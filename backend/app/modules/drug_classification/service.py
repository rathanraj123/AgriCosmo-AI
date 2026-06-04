"""
Drug ML Service — loads the trained GIN model and runs drug origin prediction directly.
No external microservice needed. Self-contained inside AgriCosmo.
"""

import os
import torch
import torch.nn as nn
import torch.nn.functional as F
from pathlib import Path
from rdkit import Chem
from torch_geometric.data import Data
from torch_geometric.nn import GINConv, GINEConv, global_add_pool, global_mean_pool
from fastapi import HTTPException

PUBCHEM_API_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"


# ── Custom Exceptions ──────────────────────────────────────────────────────────

class PubChemError(Exception):
    pass


class InvalidSMILES(Exception):
    pass


class DrugPredictionFailed(Exception):
    pass


# ── Atom / Bond Feature Encoding ───────────────────────────────────────────────

ATOM_FEATURES = {
    'element': [
        'C', 'N', 'O', 'S', 'F', 'Cl', 'Br', 'I', 'P', 'Si',
        'B', 'Se', 'Te', 'As', 'Ge', 'Sn', 'Sb', 'Bi',
        'Na', 'K', 'Ca', 'Mg', 'Fe', 'Zn', 'Cu', 'Mn',
        'Co', 'Ni', 'Mo', 'Cr', 'V', 'Ti', 'Al', 'Ga',
        'Li', 'Be', 'Pd', 'Pt', 'Au', 'Ag', 'Hg', 'Cd',
        'Pb', 'W',
    ],
    'degree': [0, 1, 2, 3, 4, 5, 6],
    'num_Hs': [0, 1, 2, 3, 4],
    'formal_charge': [-2, -1, 0, 1, 2, 3],
    'hybridization': [
        Chem.rdchem.HybridizationType.SP,
        Chem.rdchem.HybridizationType.SP2,
        Chem.rdchem.HybridizationType.SP3,
        Chem.rdchem.HybridizationType.SP3D,
        Chem.rdchem.HybridizationType.SP3D2,
    ],
}
ATOM_FEATURE_DIM = 45 + 8 + 6 + 7 + 6 + 1 + 1  # 74

BOND_FEATURES = {
    'bond_type': [
        Chem.rdchem.BondType.SINGLE,
        Chem.rdchem.BondType.DOUBLE,
        Chem.rdchem.BondType.TRIPLE,
        Chem.rdchem.BondType.AROMATIC,
    ],
    'stereo': [
        Chem.rdchem.BondStereo.STEREONONE,
        Chem.rdchem.BondStereo.STEREOANY,
        Chem.rdchem.BondStereo.STEREOZ,
        Chem.rdchem.BondStereo.STEREOE,
    ],
}
BOND_FEATURE_DIM = 5 + 5 + 1 + 1  # 12


def one_hot(value, allowable_set):
    encoding = [0] * (len(allowable_set) + 1)
    try:
        idx = allowable_set.index(value)
        encoding[idx] = 1
    except ValueError:
        encoding[-1] = 1
    return encoding


def get_atom_features(atom):
    features = []
    features += one_hot(atom.GetSymbol(), ATOM_FEATURES['element'])
    features += one_hot(atom.GetTotalDegree(), ATOM_FEATURES['degree'])
    features += one_hot(atom.GetTotalNumHs(), ATOM_FEATURES['num_Hs'])
    features += one_hot(atom.GetFormalCharge(), ATOM_FEATURES['formal_charge'])
    features += one_hot(atom.GetHybridization(), ATOM_FEATURES['hybridization'])
    features.append(1 if atom.GetIsAromatic() else 0)
    features.append(1 if atom.IsInRing() else 0)
    return features


def get_bond_features(bond):
    features = []
    features += one_hot(bond.GetBondType(), BOND_FEATURES['bond_type'])
    features += one_hot(bond.GetStereo(), BOND_FEATURES['stereo'])
    features.append(1 if bond.GetIsConjugated() else 0)
    features.append(1 if bond.IsInRing() else 0)
    return features


def smiles_to_graph(smiles, label=0):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None or mol.GetNumAtoms() < 2:
        return None

    atom_features_list = [get_atom_features(atom) for atom in mol.GetAtoms()]
    x = torch.tensor(atom_features_list, dtype=torch.float)

    edge_indices, edge_features_list = [], []
    for bond in mol.GetBonds():
        i, j = bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()
        bond_feat = get_bond_features(bond)
        edge_indices += [[i, j], [j, i]]
        edge_features_list += [bond_feat, bond_feat]

    if not edge_indices:
        return None

    edge_index = torch.tensor(edge_indices, dtype=torch.long).t().contiguous()
    edge_attr = torch.tensor(edge_features_list, dtype=torch.float)
    y = torch.tensor([label], dtype=torch.long)
    return Data(x=x, edge_index=edge_index, edge_attr=edge_attr, y=y)


# ── GIN Model Architecture ─────────────────────────────────────────────────────

class GINModel(nn.Module):
    def __init__(
        self,
        num_node_features=ATOM_FEATURE_DIM,
        num_edge_features=BOND_FEATURE_DIM,
        hidden_dim=128,
        num_layers=3,
        dropout=0.3,
        pooling='sum',
        use_edge_features=True,
        num_classes=3,
    ):
        super(GINModel, self).__init__()
        self.num_layers = num_layers
        self.dropout = dropout
        self.pooling = pooling
        self.use_edge_features = use_edge_features

        self.convs = nn.ModuleList()
        self.batch_norms = nn.ModuleList()

        for i in range(num_layers):
            in_dim = num_node_features if i == 0 else hidden_dim
            mlp = nn.Sequential(
                nn.Linear(in_dim, hidden_dim),
                nn.ReLU(),
                nn.Linear(hidden_dim, hidden_dim),
            )
            conv = GINEConv(mlp, edge_dim=num_edge_features) if use_edge_features else GINConv(mlp)
            self.convs.append(conv)
            self.batch_norms.append(nn.BatchNorm1d(hidden_dim))

        self.fc1 = nn.Linear(hidden_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, num_classes)

        self.config = {
            'num_node_features': num_node_features,
            'num_edge_features': num_edge_features,
            'hidden_dim': hidden_dim,
            'num_layers': num_layers,
            'dropout': dropout,
            'pooling': pooling,
            'use_edge_features': use_edge_features,
            'num_classes': num_classes,
        }

    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch
        edge_attr = data.edge_attr if self.use_edge_features else None

        for i in range(self.num_layers):
            if self.use_edge_features and edge_attr is not None:
                x = self.convs[i](x, edge_index, edge_attr=edge_attr)
            else:
                x = self.convs[i](x, edge_index)
            x = self.batch_norms[i](x)
            x = F.relu(x)
            x = F.dropout(x, p=self.dropout, training=self.training)

        x = global_add_pool(x, batch) if self.pooling == 'sum' else global_mean_pool(x, batch)
        x = F.relu(self.fc1(x))
        x = F.dropout(x, p=self.dropout, training=self.training)
        return self.fc2(x)


# ── Drug ML Service Singleton ─────────────────────────────────────────────────

class DrugMLService:
    """Handles GIN model loading and inference directly inside AgriCosmo."""

    def __init__(self):
        self._model = None
        self._device = None
        self._label_names = {0: 'Plant', 1: 'Fungal', 2: 'Bacterial'}

    def load_model(self):
        self._device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        # Model lives at: AgriCosmo-AI-main/ml/models/drug_classification/gin_drug_classifier_final.pt
        root_dir = Path(__file__).resolve().parents[4]  # goes up: module/drug_classification/modules/app/backend -> AgriCosmo-AI-main
        model_path = root_dir / "ml" / "models" / "drug_classification" / "gin_drug_classifier_final.pt"

        if not model_path.exists():
            raise FileNotFoundError(f"GIN Drug Classifier model not found at: {model_path}")

        print(f"[DrugMLService] Loading model from {model_path}...")

        artifact = torch.load(str(model_path), map_location=self._device, weights_only=False)
        model_config = artifact.get('model_config', {
            'num_node_features': ATOM_FEATURE_DIM,
            'num_edge_features': BOND_FEATURE_DIM,
            'hidden_dim': 128,
            'num_layers': 3,
            'dropout': 0.3,
            'pooling': 'sum',
            'use_edge_features': True,
            'num_classes': 3,
        })

        self._model = GINModel(**model_config)
        self._model.load_state_dict(artifact['model_state_dict'])
        self._model.to(self._device)
        self._model.eval()

        if 'label_names' in artifact:
            self._label_names = {int(k): v for k, v in artifact['label_names'].items()}

        print("[DrugMLService] GIN Drug Classifier loaded successfully!")

    def predict(self, smiles: str) -> dict:
        if self._model is None:
            raise RuntimeError("Drug model not loaded.")

        smiles = smiles.strip()
        if not smiles:
            raise InvalidSMILES("SMILES string cannot be empty.")

        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            raise InvalidSMILES("Invalid SMILES string. Please check your input.")

        try:
            norm_smiles = Chem.MolToSmiles(mol, isomericSmiles=False)
            mol_norm = Chem.MolFromSmiles(norm_smiles)
            if mol_norm is None:
                raise ValueError("Normalization failed.")
        except Exception:
            raise InvalidSMILES("Invalid SMILES string. Please check your input.")

        graph_data = smiles_to_graph(norm_smiles)
        if graph_data is None:
            raise DrugPredictionFailed("Molecule is too small or could not be featurized.")

        graph_data.batch = torch.zeros(graph_data.x.size(0), dtype=torch.long, device=self._device)
        graph_data = graph_data.to(self._device)

        with torch.no_grad():
            logits = self._model(graph_data)
            probs = F.softmax(logits, dim=1).cpu().numpy()[0]

        confidence = {
            "Plant": float(probs[0]),
            "Fungal": float(probs[1]),
            "Bacterial": float(probs[2]),
        }
        predicted_class = max(confidence, key=confidence.get)
        note = None
        if confidence[predicted_class] < 0.60:
            note = "Low confidence prediction — this compound may have ambiguous origin"

        return {
            "predicted_class": predicted_class,
            "prediction": predicted_class,
            "confidence": confidence,
            "note": note,
            "warning": note,
        }


# Singleton
drug_ml_service = DrugMLService()


# ── PubChem Helper ────────────────────────────────────────────────────────────

async def resolve_smiles_from_name(drug_name: str) -> str:
    """Fetch canonical SMILES for a drug name via PubChem."""
    import httpx
    url = f"{PUBCHEM_API_BASE}/compound/name/{drug_name}/property/CanonicalSMILES,IsomericSMILES/JSON"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10.0)

    if response.status_code == 404:
        raise PubChemError(f"Drug '{drug_name}' not found in PubChem database.")
    elif response.status_code != 200:
        raise PubChemError(f"PubChem API error: {response.status_code}")

    data = response.json()
    try:
        props = data["PropertyTable"]["Properties"][0]
        smiles = (
            props.get("CanonicalSMILES")
            or props.get("IsomericSMILES")
            or props.get("SMILES")
            or props.get("ConnectivitySMILES")
        )
        if not smiles:
            raise ValueError("No SMILES in response")
        return smiles
    except (KeyError, IndexError, ValueError):
        raise PubChemError("Failed to parse SMILES from PubChem response.")


async def predict_drug_origin(smiles: str) -> dict:
    """Run drug origin prediction using the local GIN model."""
    try:
        return drug_ml_service.predict(smiles)
    except InvalidSMILES as e:
        raise HTTPException(status_code=400, detail=str(e))
    except DrugPredictionFailed as e:
        raise HTTPException(status_code=500, detail=str(e))

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Pill, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';

interface DrugInputFormProps {
  onPredict: (data: { drug_name?: string; smiles?: string }) => void;
  isLoading: boolean;
}

export default function DrugInputForm({ onPredict, isLoading }: DrugInputFormProps) {
  const [activeTab, setActiveTab] = useState<'name' | 'smiles'>('name');
  const [drugName, setDrugName] = useState('');
  const [smiles, setSmiles] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'name' && !drugName.trim()) {
      toast.error('Please enter a drug name');
      return;
    }
    if (activeTab === 'smiles' && !smiles.trim()) {
      toast.error('Please enter a SMILES string');
      return;
    }

    if (activeTab === 'name') {
      onPredict({ drug_name: drugName.trim() });
    } else {
      onPredict({ smiles: smiles.trim() });
    }
  };

  return (
    <Card className="w-full shadow-lg border-border/50 glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Pill className="w-5 h-5" />
          </div>
          Input Drug Information
        </CardTitle>
        <CardDescription>
          Provide a drug name or SMILES string to predict its biological origin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-6 p-1 bg-accent/50 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('name')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'name' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Drug Name
          </button>
          <button
            onClick={() => setActiveTab('smiles')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'smiles' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            SMILES String
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'name' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Common or Chemical Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. Aspirin, Penicillin, Taxol"
                  className="pl-9 h-12 text-base rounded-xl"
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We will automatically resolve this name to a canonical SMILES string via PubChem.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Canonical SMILES</label>
              <Input
                placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O"
                className="h-12 text-base font-mono rounded-xl"
                value={smiles}
                onChange={(e) => setSmiles(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Enter the exact molecular structure SMILES representation.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold rounded-xl gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Compound...
              </>
            ) : (
              'Predict Origin'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

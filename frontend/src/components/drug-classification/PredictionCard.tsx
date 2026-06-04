import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dna, CheckCircle2, AlertTriangle, Beaker } from 'lucide-react';
import ConfidenceGauge from './ConfidenceGauge';
import ProbabilityChart from './ProbabilityChart';
import MoleculeViewerCard from './MoleculeViewerCard';
import AIExplanationCard from './AIExplanationCard';
import ReliabilityCard from './ReliabilityCard';
import ExplainabilityCard from './ExplainabilityCard';
import SimilarCompoundsCard from './SimilarCompoundsCard';
import ResearchInsightsCard from './ResearchInsightsCard';
import ExportActions from './ExportActions';
import { motion } from 'framer-motion';

interface PredictionData {
  predicted_class: string;
  confidence: Record<string, number>;
  note?: string;
  smiles: string;
  drug_name?: string;
  molecular_details?: {
    canonical_smiles: string;
    inchi?: string;
    inchi_key?: string;
    molfile_2d?: string;
    molfile_3d?: string;
    formula?: string;
    exact_mass?: number;
    mw?: number;
    atom_count?: number;
    heavy_atom_count?: number;
    formal_charge?: number;
    ring_count?: number;
    rotatable_bonds?: number;
    logp?: number;
    hbd?: number;
    hba?: number;
    tpsa?: number;
    lipinski_score?: number;
    is_drug_like?: string;
    svg_2d?: string;
  };
}

interface PredictionCardProps {
  prediction: PredictionData | null;
  isLoading?: boolean;
}

export default function PredictionCard({ prediction, isLoading }: PredictionCardProps) {
  if (isLoading) {
    return (
      <Card className="w-full h-full min-h-[600px] flex flex-col items-center justify-center border-dashed border-2 bg-background/50 backdrop-blur-sm text-muted-foreground shadow-none relative overflow-hidden">
        {/* Animated Scanner Bar */}
        <motion.div 
          initial={{ top: '0%' }}
          animate={{ top: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-primary/10 to-transparent pointer-events-none"
        />
        <div className="p-4 rounded-full bg-primary/10 mb-6 relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <Dna className="w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          </motion.div>
        </div>
        <p className="text-2xl font-black text-foreground mb-2 animate-pulse">Analyzing Molecular Graph...</p>
        <p className="text-sm mt-2 text-center max-w-sm text-muted-foreground/80 leading-relaxed">
          Running structural features through<br/>the Graph Isomorphism Network.
        </p>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className="w-full h-full min-h-[600px] flex flex-col items-center justify-center border-dashed border-2 bg-background/50 backdrop-blur-sm text-muted-foreground shadow-none">
        <div className="p-4 rounded-full bg-primary/5 mb-6">
          <Beaker className="w-12 h-12 opacity-40 text-primary" />
        </div>
        <p className="text-2xl font-black text-foreground mb-2">Ready for Analysis</p>
        <p className="text-sm mt-2 text-center max-w-sm text-muted-foreground/80 leading-relaxed">
          Enter a drug name or SMILES string<br/>to begin classification.
        </p>
      </Card>
    );
  }

  const safeConfidence = prediction.confidence || {};
  const predictedClass = prediction.predicted_class || 'Unknown';
  const mainConfidence = safeConfidence[predictedClass] || 0;
  const isHighConfidence = mainConfidence >= 0.7;

  const getOriginGradient = (origin: string) => {
    switch (origin.toLowerCase()) {
      case 'plant':
        return 'from-green-500/20 to-emerald-500/5 text-green-500 border-green-500/30';
      case 'fungal':
        return 'from-amber-500/20 to-orange-500/5 text-amber-500 border-amber-500/30';
      case 'bacterial':
        return 'from-blue-500/20 to-cyan-500/5 text-blue-500 border-blue-500/30';
      default:
        return 'from-primary/20 to-primary/5 text-primary border-primary/30';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Primary Result Card */}
      <Card className="w-full shadow-xl border-border/50 relative overflow-hidden glass-card">
        <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
        <CardHeader className="pb-4 border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-black flex items-center gap-2">
                <Dna className="w-6 h-6 text-primary" />
                Analysis Results
                <Badge variant="secondary" className="ml-2 font-mono text-[10px] bg-primary/10 text-primary border-primary/20">GIN v1.0</Badge>
              </CardTitle>
              <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                <span>{new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className="opacity-50">•</span>
                <span>ID: RUN-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isHighConfidence ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 px-3 py-1 font-semibold shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High Confidence
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 px-3 py-1 font-semibold shadow-sm">
                  <AlertTriangle className="w-3.5 h-3.5" /> Requires Review
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50 bg-background">
            
            {/* Origin Prediction */}
            <div className={`p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br ${getOriginGradient(prediction.predicted_class)}`}>
              <span className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Predicted Origin</span>
              <div className="text-5xl font-black tracking-tight drop-shadow-sm mb-2">
                {prediction.predicted_class}
              </div>
            </div>

            {/* Confidence Gauge */}
            <div className="p-8 flex items-center justify-center bg-background/50">
              <ConfidenceGauge confidence={mainConfidence} origin={prediction.predicted_class} />
            </div>

            {/* Probability Chart */}
            <div className="p-6 bg-background/50 flex items-center justify-center">
              <ProbabilityChart confidenceMap={safeConfidence} />
            </div>

          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-6">
        {/* Full width Molecular Analysis for better 3D/2D layout */}
        <MoleculeViewerCard 
          smiles={prediction.smiles}
          details={prediction.molecular_details}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AIExplanationCard 
              predictedClass={predictedClass} 
              confidenceMap={safeConfidence} 
              drugName={prediction.drug_name}
              note={prediction.note}
              smiles={prediction.smiles}
            />
            <ExplainabilityCard predictedClass={predictedClass} />
          </div>
          
          <div className="space-y-6">
            <SimilarCompoundsCard predictedClass={predictedClass} smiles={prediction.smiles} />
            <ResearchInsightsCard smiles={prediction.smiles} drugName={prediction.drug_name} />
            <ReliabilityCard confidence={mainConfidence} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

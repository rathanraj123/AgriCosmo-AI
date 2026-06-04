import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dna, CheckCircle2, AlertTriangle, Beaker } from 'lucide-react';
import ConfidenceGauge from './ConfidenceGauge';
import ProbabilityChart from './ProbabilityChart';
import CompoundDetailsCard from './CompoundDetailsCard';
import AIExplanationCard from './AIExplanationCard';
import ReliabilityCard from './ReliabilityCard';
import ExplainabilityCard from './ExplainabilityCard';
import SimilarCompoundsCard from './SimilarCompoundsCard';
import ResearchInsightsCard from './ResearchInsightsCard';
import { motion } from 'framer-motion';

interface PredictionData {
  predicted_class: string;
  confidence: Record<string, number>;
  note?: string;
  smiles: string;
  drug_name?: string;
}

interface PredictionCardProps {
  prediction: PredictionData | null;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  if (!prediction) {
    return (
      <Card className="w-full h-full min-h-[600px] flex flex-col items-center justify-center border-dashed border-2 bg-transparent text-muted-foreground shadow-none">
        <Beaker className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-xl font-bold text-foreground">Ready for Analysis</p>
        <p className="text-sm mt-2 text-center max-w-sm">
          Submit a drug name or canonical SMILES string to generate a comprehensive AI prediction report.
        </p>
      </Card>
    );
  }

  const mainConfidence = prediction.confidence[prediction.predicted_class] || 0;
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black flex items-center gap-2">
                <Dna className="w-6 h-6 text-primary" />
                Analysis Results
              </CardTitle>
            </div>
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
              <ProbabilityChart confidenceMap={prediction.confidence} />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Secondary Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AIExplanationCard 
            predictedClass={prediction.predicted_class} 
            confidenceMap={prediction.confidence} 
            drugName={prediction.drug_name}
          />
          <CompoundDetailsCard 
            smiles={prediction.smiles}
            drugName={prediction.drug_name}
          />
          <ReliabilityCard confidence={mainConfidence} />
        </div>
        
        <div className="space-y-6">
          <ExplainabilityCard predictedClass={prediction.predicted_class} />
          <SimilarCompoundsCard predictedClass={prediction.predicted_class} />
          <ResearchInsightsCard smiles={prediction.smiles} drugName={prediction.drug_name} />
        </div>
      </div>
    </motion.div>
  );
}

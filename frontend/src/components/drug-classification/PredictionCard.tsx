import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, HelpCircle, Dna, Database, Beaker } from 'lucide-react';

interface PredictionCardProps {
  prediction: {
    predicted_class: str;
    confidence: Record<string, number>;
    note?: str;
    smiles: str;
    drug_name?: str;
  } | null;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  if (!prediction) {
    return (
      <Card className="w-full h-full min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 bg-transparent text-muted-foreground shadow-none">
        <Beaker className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">Ready for Analysis</p>
        <p className="text-sm">Submit a drug name or SMILES to see predictions.</p>
      </Card>
    );
  }

  const getOriginColor = (origin: string) => {
    switch (origin.toLowerCase()) {
      case 'plant':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'fungal':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'bacterial':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const mainConfidence = prediction.confidence[prediction.predicted_class] || 0;
  const isHighConfidence = mainConfidence >= 0.7;

  return (
    <Card className="w-full shadow-lg border-border/50 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
      <CardHeader className="pb-4 border-b border-border/50 bg-accent/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Dna className="w-6 h-6 text-primary" />
              Analysis Results
            </CardTitle>
            <CardDescription className="mt-1">
              Biological origin prediction using GIN Model
            </CardDescription>
          </div>
          {isHighConfidence ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1 px-3 py-1">
              <CheckCircle2 className="w-3 h-3" /> High Confidence
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 px-3 py-1">
              <AlertTriangle className="w-3 h-3" /> Low Confidence
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        
        {/* Main Prediction */}
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between p-6 rounded-2xl bg-background border border-border/50 shadow-sm">
          <div className="text-center md:text-left space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Predicted Origin</p>
            <div className={`inline-flex px-4 py-1.5 rounded-full border text-xl font-bold ${getOriginColor(prediction.predicted_class)}`}>
              {prediction.predicted_class}
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Confidence</p>
            <p className="text-4xl font-black font-mono">{(mainConfidence * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Input Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Database className="w-4 h-4" /> Input Details
          </h4>
          <div className="p-4 rounded-xl bg-accent/30 border border-border/50 space-y-3">
            {prediction.drug_name && (
              <div>
                <span className="text-xs text-muted-foreground">Drug Name:</span>
                <p className="font-semibold text-foreground">{prediction.drug_name}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-muted-foreground">Resolved Canonical SMILES:</span>
              <p className="font-mono text-sm bg-background p-2 rounded-lg mt-1 break-all border border-border">
                {prediction.smiles}
              </p>
            </div>
          </div>
        </div>

        {/* Confidence Probabilities */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Probability Distribution</h4>
          <div className="space-y-3">
            {Object.entries(prediction.confidence)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([cls, val]) => (
                <div key={cls} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{cls}</span>
                    <span className="font-mono">{((val as number) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${cls === prediction.predicted_class ? 'gradient-primary' : 'bg-muted-foreground/30'}`}
                      style={{ width: `${(val as number) * 100}%` }}
                    />
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Recommendation / Note */}
        {prediction.note && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-600 dark:text-amber-400">
            <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{prediction.note}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

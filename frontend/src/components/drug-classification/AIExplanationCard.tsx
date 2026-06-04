import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, Sparkles } from 'lucide-react';

interface AIExplanationCardProps {
  predictedClass: string;
  confidenceMap: Record<string, number>;
  drugName?: string;
}

export default function AIExplanationCard({ predictedClass, confidenceMap, drugName }: AIExplanationCardProps) {
  const mainConfidence = Math.round((confidenceMap[predictedClass] || 0) * 100);
  
  // Dynamic Explanation Generation
  const generateExplanation = () => {
    const sorted = Object.entries(confidenceMap).sort((a, b) => b[1] - a[1]);
    const secondaryClass = sorted.length > 1 ? sorted[1][0] : '';
    const secondaryConfidence = sorted.length > 1 ? Math.round(sorted[1][1] * 100) : 0;
    
    let text = `The Graph Isomorphism Network (GIN) model predicts this compound is likely ${predictedClass.toLowerCase()} in origin`;
    
    if (mainConfidence >= 80) {
      text += ` with very high certainty (${mainConfidence}%). Its molecular graph contains highly distinct structural motifs and sub-fragments that are classically associated with ${predictedClass.toLowerCase()}-derived metabolites. `;
    } else if (mainConfidence >= 60) {
      text += ` with moderate confidence (${mainConfidence}%). While the primary structural features align with ${predictedClass.toLowerCase()} origins, there is a ${secondaryConfidence}% probability overlap with ${secondaryClass.toLowerCase()} structures. `;
    } else {
      text += `. However, this is a low-confidence prediction (${mainConfidence}%). The compound exhibits ambiguous structural features that overlap heavily across multiple biological origin classes, notably ${secondaryClass.toLowerCase()}. `;
    }

    if (drugName) {
      text += `This aligns with known structural profiles similar to ${drugName}.`;
    } else {
      text += `The prediction relies solely on the provided canonical SMILES graph topology.`;
    }

    return text;
  };

  return (
    <Card className="w-full bg-accent/20 border-accent/30 overflow-hidden relative group">
      {/* Glow Effect */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-background border border-border shadow-sm shrink-0">
            <BrainCircuit className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
              AI Explanation <Sparkles className="w-4 h-4 text-amber-500" />
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {generateExplanation()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

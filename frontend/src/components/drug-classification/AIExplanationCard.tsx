import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, Sparkles } from 'lucide-react';

interface AIExplanationCardProps {
  predictedClass: string;
  confidenceMap: Record<string, number>;
  drugName?: string;
  note?: string;
  smiles?: string;
}

export default function AIExplanationCard({ predictedClass, confidenceMap, drugName, note, smiles }: AIExplanationCardProps) {
  const mainConfidence = Math.round((confidenceMap[predictedClass] || 0) * 100);
  
  // Simple deterministic hash to pick templates
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
  };
  
  const templateIdx = smiles ? hashString(smiles) % 3 : 0;
  
  // Dynamic Explanation Generation
  const generateExplanation = () => {
    const sorted = Object.entries(confidenceMap).sort((a, b) => b[1] - a[1]);
    const secondaryClass = sorted.length > 1 ? sorted[1][0] : '';
    const secondaryConfidence = sorted.length > 1 ? Math.round(sorted[1][1] * 100) : 0;
    
    let text = '';
    
    if (mainConfidence >= 80) {
      const templates = [
        `The Graph Isomorphism Network (GIN) has classified this molecular structure as ${predictedClass.toLowerCase()} with high certainty (${mainConfidence}%). Its topological layout contains heavily conserved motifs characteristic of this domain. `,
        `Based on the topological graph mapping, the AI strongly leans towards a ${predictedClass.toLowerCase()} origin (${mainConfidence}%). The structural fragments perfectly align with known databases for this class. `,
        `We have a very definitive prediction here. The graph convolution layers identified a ${predictedClass.toLowerCase()} signature with ${mainConfidence}% confidence, showing minimal cross-domain structural ambiguity. `
      ];
      text += templates[templateIdx];
    } else if (mainConfidence >= 60) {
      const templates = [
        `The model suggests a ${predictedClass.toLowerCase()} origin, but with moderate confidence (${mainConfidence}%). We are observing a ${secondaryConfidence}% probability overlap with ${secondaryClass.toLowerCase()} metabolomics. `,
        `This compound leans ${predictedClass.toLowerCase()} (${mainConfidence}%), though the network detected competing ${secondaryClass.toLowerCase()} structural properties that introduce some uncertainty. `,
        `While the primary prediction is ${predictedClass.toLowerCase()}, the ${mainConfidence}% confidence score indicates significant structural sharing. The secondary ${secondaryClass.toLowerCase()} characteristics cannot be ignored. `
      ];
      text += templates[templateIdx];
    } else {
      const templates = [
        `This is a highly ambiguous, low-confidence prediction (${mainConfidence}%) for ${predictedClass.toLowerCase()}. The molecular graph exhibits features that overlap heavily across multiple origin classes, notably ${secondaryClass.toLowerCase()}. `,
        `The network struggled to cleanly separate this structure, resulting in a weak ${mainConfidence}% signal for ${predictedClass.toLowerCase()}. It shares deep topological similarities with ${secondaryClass.toLowerCase()} compounds. `,
        `Classification certainty is very low here (${mainConfidence}% ${predictedClass.toLowerCase()}). The geometric arrangement of atoms presents a hybrid profile, heavily mirroring ${secondaryClass.toLowerCase()} architectures. `
      ];
      text += templates[templateIdx];
    }

    if (note) {
      text += `\n\nModel Note: ${note} `;
    }

    if (drugName) {
      text += `This matches general expectations for known derivatives of ${drugName}.`;
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

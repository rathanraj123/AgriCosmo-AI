import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Network } from 'lucide-react';

interface ExplainabilityCardProps {
  predictedClass: string;
}

export default function ExplainabilityCard({ predictedClass }: ExplainabilityCardProps) {
  // Simulated Feature Importance Bars based on predicted class
  let features = [
    { name: 'Aromatic Rings', weight: 0.82 },
    { name: 'Hydroxyl Groups', weight: 0.65 },
    { name: 'Nitrogen Heterocycles', weight: 0.43 },
    { name: 'Aliphatic Chains', weight: 0.28 },
  ];

  if (predictedClass === 'Plant') {
    features = [
      { name: 'Isoprene Units', weight: 0.88 },
      { name: 'Aromatic Rings', weight: 0.71 },
      { name: 'Glycosidic Bonds', weight: 0.55 },
      { name: 'Alkaloid Scaffolds', weight: 0.45 },
    ];
  } else if (predictedClass === 'Bacterial') {
    features = [
      { name: 'Peptide Bonds', weight: 0.91 },
      { name: 'Thioester Linkages', weight: 0.74 },
      { name: 'Macrocyclic Rings', weight: 0.62 },
      { name: 'Sugar Moieties', weight: 0.39 },
    ];
  }

  return (
    <Card className="w-full shadow-sm border-border/50 bg-background/30 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Fingerprint className="w-4 h-4" /> Feature Importance (Simulated)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border border-dashed">
            <Network className="w-8 h-8 text-muted-foreground/50 shrink-0" />
            <p className="text-xs text-muted-foreground">
              The GIN model identified the following molecular sub-fragments as the most significant contributors to the {predictedClass} classification.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((feat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-foreground/80">
                  <span>{feat.name}</span>
                  <span className="font-mono text-muted-foreground">{(feat.weight * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${feat.weight * 100}%`, opacity: feat.weight + 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

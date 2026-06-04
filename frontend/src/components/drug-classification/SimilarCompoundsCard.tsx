import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker, FlaskConical, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SimilarCompoundsCardProps {
  predictedClass: string;
}

export default function SimilarCompoundsCard({ predictedClass }: SimilarCompoundsCardProps) {
  // Mock Data
  const mockSimilar = [
    { name: 'Compound A-7X', similarity: 89.4, origin: predictedClass },
    { name: 'Derivative B-92', similarity: 76.1, origin: predictedClass },
    { name: 'Analog C-44', similarity: 62.8, origin: predictedClass === 'Plant' ? 'Fungal' : 'Plant' },
  ];

  return (
    <Card className="w-full shadow-sm border-border/50">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FlaskConical className="w-4 h-4" /> Similar Known Compounds
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        <div className="divide-y divide-border/50">
          {mockSimilar.map((item, idx) => (
            <div key={idx} className="p-4 hover:bg-accent/20 transition-colors flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent text-muted-foreground group-hover:text-primary transition-colors">
                  <Beaker className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Similarity Score: <span className="font-mono text-foreground">{item.similarity}%</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
                  {item.origin}
                </Badge>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

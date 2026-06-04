import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker, FlaskConical, ExternalLink, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface SimilarCompoundsCardProps {
  predictedClass: string;
  smiles?: string;
}

interface SimilarCompound {
  name: string;
  similarity: number;
  origin: string;
}

export default function SimilarCompoundsCard({ predictedClass, smiles }: SimilarCompoundsCardProps) {
  const [similar, setSimilar] = useState<SimilarCompound[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSimilar() {
      if (!smiles) return;
      setLoading(true);
      try {
        const data: any = await api.get(`/drug-classification/similar?smiles=${encodeURIComponent(smiles)}`);
        
        // Map origin intelligently if backend left it unknown
        const mappedData = data.map((item: any) => ({
          ...item,
          origin: item.origin === 'Unknown' ? predictedClass : item.origin
        }));
        
        setSimilar(mappedData);
      } catch (e) {
        console.error("Failed to fetch similar compounds", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSimilar();
  }, [smiles, predictedClass]);

  return (
    <Card className="w-full shadow-sm border-border/50 h-full flex flex-col glass-card">
      <CardHeader className="pb-3 border-b border-border/50 bg-background/50">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FlaskConical className="w-4 h-4" /> Similar Known Compounds
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 p-0 flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
          </div>
        ) : similar.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground text-sm text-center">
            <Beaker className="w-8 h-8 opacity-20 mb-2" />
            <p>No highly similar compounds found in database.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {similar.map((item, idx) => (
              <a 
                key={idx} 
                href={`https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(item.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 hover:bg-accent/20 transition-colors flex items-center justify-between group cursor-pointer block"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent text-muted-foreground group-hover:text-primary transition-colors">
                    <Beaker className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors max-w-[150px] md:max-w-[200px] truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Similarity: <span className="font-mono text-foreground">{item.similarity}%</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
                    {item.origin}
                  </Badge>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

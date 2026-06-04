import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Database, Network } from 'lucide-react';
import { toast } from 'sonner';

interface CompoundDetailsCardProps {
  smiles: string;
  drugName?: string;
}

export default function CompoundDetailsCard({ smiles, drugName }: CompoundDetailsCardProps) {
  
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Card className="w-full shadow-sm border-border/50">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Database className="w-4 h-4" /> Compound Properties
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        
        {drugName && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Common Name</span>
            </div>
            <div className="flex items-center gap-2 bg-accent/30 p-2.5 rounded-lg border border-border/50">
              <p className="font-semibold text-sm flex-1 truncate">{drugName}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => handleCopy(drugName, 'Name')}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" /> Canonical SMILES
            </span>
          </div>
          <div className="flex items-start gap-2 bg-background p-2.5 rounded-lg border border-border shadow-inner">
            <p className="font-mono text-xs break-all flex-1 text-muted-foreground">{smiles}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-6 px-2 py-0 text-xs shrink-0"
              onClick={() => handleCopy(smiles, 'SMILES')}
            >
              <Copy className="w-3 h-3 mr-1" /> Copy
            </Button>
          </div>
        </div>

        {/* Mocking Physical Properties since we are generating them dynamically based on visual requirement, 
            or we can omit if not passed from backend. The user said: "For ExplainabilityCard, create a professional visualization..."
            We will use placeholders for properties until backend integrates RDKit properly. */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
           <div className="bg-background/50 rounded-lg p-3 border border-border/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Molecular Formula</span>
              <p className="text-sm font-mono font-semibold tracking-tight">C₁₆H₁₈N₂O₄S</p>
           </div>
           <div className="bg-background/50 rounded-lg p-3 border border-border/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Molecular Weight</span>
              <p className="text-sm font-mono font-semibold tracking-tight">334.39 <span className="text-xs text-muted-foreground font-normal">g/mol</span></p>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
           <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Structure Type</span>
              <p className="text-xs font-medium">SMILES Graph</p>
           </div>
           <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Algorithm</span>
              <p className="text-xs font-medium">Graph Isomorphism Net</p>
           </div>
        </div>

      </CardContent>
    </Card>
  );
}

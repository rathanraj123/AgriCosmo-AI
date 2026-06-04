import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, BookOpen, Database, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResearchInsightsCardProps {
  smiles: string;
  drugName?: string;
}

export default function ResearchInsightsCard({ smiles, drugName }: ResearchInsightsCardProps) {
  
  const pubchemSearchUrl = drugName 
    ? `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(drugName)}`
    : `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(smiles)}&tab=similarity`;

  return (
    <Card className="w-full shadow-sm border-border/50 bg-gradient-to-br from-background to-accent/20">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Research Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Access external databases to verify the biological origin, clinical status, and known interactions of this compound.
        </p>

        <a href={pubchemSearchUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
          <Button variant="outline" className="w-full justify-start h-12 bg-background hover:bg-accent/50 border-border shadow-sm group">
            <Database className="w-4 h-4 mr-3 text-[#17528e]" />
            <span className="flex-1 text-left font-medium">Search in PubChem</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          </Button>
        </a>

        <a href={`https://www.ebi.ac.uk/chembl/g/#search_results/all/query=${encodeURIComponent(drugName || smiles)}`} target="_blank" rel="noopener noreferrer" className="block w-full">
          <Button variant="outline" className="w-full justify-start h-12 bg-background hover:bg-accent/50 border-border shadow-sm group">
            <LinkIcon className="w-4 h-4 mr-3 text-[#009287]" />
            <span className="flex-1 text-left font-medium">Query ChEMBL</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

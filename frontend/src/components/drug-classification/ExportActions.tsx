import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileText, Share2, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportActions() {
  const handleExport = (format: string) => {
    toast.success(`Exporting as ${format}...`);
    // Simulated export delay
    setTimeout(() => {
      toast.success(`${format} export complete`);
    }, 1000);
  };

  return (
    <Card className="w-full shadow-lg border-border/50 glass-card">
      <CardHeader className="border-b border-border/50 bg-background/50">
        <CardTitle className="text-xl flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" /> Export Results
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 bg-background hover:bg-accent hover:text-primary transition-all group" onClick={() => handleExport('PDF')}>
            <FileText className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> PDF Report
          </Button>
          <Button variant="outline" className="h-12 bg-background hover:bg-accent hover:text-primary transition-all group" onClick={() => handleExport('JSON')}>
            <FileJson className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> JSON Data
          </Button>
          <Button variant="outline" className="h-12 bg-background hover:bg-accent hover:text-primary transition-all group" onClick={() => handleExport('CSV')}>
            <Printer className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Print CSV
          </Button>
          <Button variant="outline" className="h-12 bg-background hover:bg-accent hover:text-primary transition-all group" onClick={() => handleExport('Share')}>
            <Share2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

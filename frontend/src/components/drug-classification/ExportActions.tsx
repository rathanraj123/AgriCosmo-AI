import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileText, Share2, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface ExportActionsProps {
  predictionData?: any;
}

export default function ExportActions({ predictionData }: ExportActionsProps) {
  const handleExport = (format: string) => {
    if (!predictionData) {
      toast.error('No prediction data available to export');
      return;
    }

    if (format === 'JSON') {
      const exportData = {
        app: "AgriCosmo AI",
        timestamp: new Date().toISOString(),
        prediction: predictionData
      };
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.href = url;
      downloadAnchorNode.download = `prediction_${predictionData.id || 'export'}.json`;
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      URL.revokeObjectURL(url);
      toast.success('JSON Export complete');
    } else if (format === 'CSV') {
      const csvContent = `ID,Input,Predicted_Class,Confidence_Plant,Confidence_Fungal,Confidence_Bacterial\n${predictionData.id || ''},"${predictionData.smiles || predictionData.drug_name || ''}",${predictionData.predicted_class},${predictionData.confidence?.Plant || 0},${predictionData.confidence?.Fungal || 0},${predictionData.confidence?.Bacterial || 0}\n`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.href = url;
      downloadAnchorNode.download = "prediction_export.csv";
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      URL.revokeObjectURL(url);
      toast.success('CSV Export complete');
    } else if (format === 'PDF') {
      window.print();
      toast.success('Opening print dialog for PDF...');
    } else if (format === 'Share') {
      const shareData = {
        title: 'AgriCosmo Drug Classification Results',
        text: 'Check out these structural classification results from AgriCosmo AI.',
        url: window.location.href,
      };
      
      if (navigator.share) {
        navigator.share(shareData)
          .then(() => toast.success('Shared successfully'))
          .catch((err) => {
            if (err.name !== 'AbortError') {
              toast.error('Error sharing results');
            }
          });
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard to share');
      }
    } else {
      toast.success(`Exporting as ${format}...`);
      setTimeout(() => {
        toast.success(`${format} export complete`);
      }, 1000);
    }
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

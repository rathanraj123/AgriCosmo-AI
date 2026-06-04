import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pill, Search, Copy, ClipboardPaste, X } from 'lucide-react';
import { toast } from 'sonner';

interface DrugInputFormProps {
  onPredict: (data: { drug_name?: string; smiles?: string }) => void;
  isLoading: boolean;
}

export default function DrugInputForm({ onPredict, isLoading }: DrugInputFormProps) {
  const [activeTab, setActiveTab] = useState<'name' | 'smiles'>('name');
  const [drugName, setDrugName] = useState('');
  const [smiles, setSmiles] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'name' && !drugName.trim()) {
      toast.error('Please enter a drug name');
      return;
    }
    if (activeTab === 'smiles' && !smiles.trim()) {
      toast.error('Please enter a SMILES string');
      return;
    }

    if (activeTab === 'name') {
      onPredict({ drug_name: drugName.trim() });
    } else {
      onPredict({ smiles: smiles.trim() });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSmiles(text);
    } catch (err) {
      toast.error('Failed to read clipboard');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(smiles);
    toast.success('Copied to clipboard');
  };

  return (
    <Card className="w-full shadow-lg border-border/50 bg-background/50 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 gradient-primary" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Pill className="w-6 h-6" />
          </div>
          Compound Analysis
        </CardTitle>
        <CardDescription className="text-base">
          Enter a pharmaceutical compound to analyze its biological origin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Animated Segmented Toggle */}
        <div className="relative flex p-1 mb-6 bg-accent/30 rounded-xl max-w-sm">
          <button
            onClick={() => setActiveTab('name')}
            className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'name' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
            }`}
          >
            Drug Name
          </button>
          <button
            onClick={() => setActiveTab('smiles')}
            className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'smiles' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
            }`}
          >
            SMILES String
          </button>
          {/* Active Background Animation */}
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-lg shadow-sm transition-transform duration-300 ease-out"
            style={{ transform: activeTab === 'name' ? 'translateX(0)' : 'translateX(calc(100% + 8px))' }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'name' ? (
              <motion.div
                key="name"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <label className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">
                  Common or Chemical Name
                </label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    placeholder="e.g. Aspirin, Penicillin, Taxol"
                    className="pl-12 h-14 text-lg rounded-xl bg-background/50 border-border/50 focus-visible:ring-primary/30 transition-all"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground/70">
                  Automatically resolved to a canonical SMILES string via PubChem.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="smiles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-end">
                  <label className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">
                    Canonical SMILES
                  </label>
                  <span className="text-xs font-mono text-muted-foreground bg-accent/50 px-2 py-0.5 rounded-md">
                    {smiles.length} chars
                  </span>
                </div>
                <div className="relative">
                  <Textarea
                    placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O"
                    className="min-h-[120px] text-base font-mono rounded-xl bg-background/50 border-border/50 focus-visible:ring-primary/30 transition-all resize-none p-4 pb-12"
                    value={smiles}
                    onChange={(e) => setSmiles(e.target.value)}
                    disabled={isLoading}
                  />
                  {/* Action Buttons inside Textarea */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 px-2.5 text-xs rounded-md bg-accent/50 hover:bg-accent hover:text-foreground"
                      onClick={handlePaste}
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 mr-1.5" />
                      Paste
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 px-2.5 text-xs rounded-md bg-accent/50 hover:bg-accent hover:text-foreground"
                      onClick={handleCopy}
                      disabled={!smiles}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Copy
                    </Button>
                    {smiles && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setSmiles('')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold rounded-xl gradient-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all relative overflow-hidden group"
            disabled={isLoading}
          >
            {/* Hover Pulse Effect */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing Molecular Graph...
              </motion.div>
            ) : (
              'Analyze Compound'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Pill } from 'lucide-react';
import { toast } from 'sonner';

import InputModeToggle from './InputModeToggle';
import DrugNameInput from './DrugNameInput';
import SmilesInput from './SmilesInput';

interface DrugInputFormProps {
  onPredict: (data: { drug_name?: string; smiles?: string }) => void;
  isLoading: boolean;
}

export default function DrugInputForm({ onPredict, isLoading }: DrugInputFormProps) {
  const [activeTab, setActiveTab] = useState<'name' | 'smiles'>('name');
  const [drugName, setDrugName] = useState('');
  const [smiles, setSmiles] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'name') {
      if (!drugName.trim()) {
        setError('Please enter a drug name');
        return;
      }
      if (drugName.trim().length < 3) {
        setError('Drug name is too short');
        return;
      }
      onPredict({ drug_name: drugName.trim() });
    } else {
      if (!smiles.trim()) {
        setError('Please enter a SMILES string');
        return;
      }
      // Basic SMILES validation heuristic
      if (!/^[A-Za-z0-9@+\-\[\]\(\)\\=#$.]+$/.test(smiles.trim())) {
        setError('Invalid characters in SMILES string');
        return;
      }
      onPredict({ smiles: smiles.trim() });
    }
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
        <InputModeToggle activeTab={activeTab} setActiveTab={setActiveTab} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'name' ? (
              <DrugNameInput
                key="name"
                value={drugName}
                onChange={(val) => { setDrugName(val); setError(''); }}
                disabled={isLoading}
                error={error}
              />
            ) : (
              <SmilesInput
                key="smiles"
                value={smiles}
                onChange={(val) => { setSmiles(val); setError(''); }}
                disabled={isLoading}
                error={error}
              />
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

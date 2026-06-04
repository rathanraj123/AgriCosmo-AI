import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill } from 'lucide-react';

import HeroMetrics from '@/components/drug-classification/HeroMetrics';
import DrugInputForm from '@/components/drug-classification/DrugInputForm';
import PredictionCard from '@/components/drug-classification/PredictionCard';
import PredictionHistory from '@/components/drug-classification/PredictionHistory';
import AnalyticsDashboard from '@/components/drug-classification/AnalyticsDashboard';
import ExportActions from '@/components/drug-classification/ExportActions';

export default function DrugClassificationPage() {
  const { token } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handlePredict = async (data: { drug_name?: string; smiles?: string }) => {
    setLoading(true);
    // Clear previous prediction while loading for a cleaner UX
    setPrediction(null);
    try {
      const res = await fetch(`${API_URL}/drug-classification/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to predict drug origin');
      }

      const result = await res.json();
      setPrediction(result);
      toast.success('Prediction complete!');
      setRefreshHistory(prev => prev + 1); // Trigger history re-fetch
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-[1400px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700 relative z-10">
      
      {/* Background ambient light */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
            Drug <span className="gradient-text">Classification AI</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl leading-relaxed">
            Predict the biological origin of pharmaceutical compounds using advanced Graph Neural Networks (GIN).
          </p>
        </div>
      </div>

      <HeroMetrics />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Input, Analytics, History */}
        <div className="xl:col-span-4 space-y-8 flex flex-col">
          <DrugInputForm onPredict={handlePredict} isLoading={loading} />
          
          <div className="hidden xl:block space-y-8">
            <AnalyticsDashboard />
            <ExportActions />
          </div>
        </div>

        {/* Right Column: Prediction Results */}
        <div className="xl:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={prediction ? 'result' : 'empty'}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <PredictionCard prediction={prediction} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile/Tablet View For Analytics/Export/History (Pushed to bottom) */}
        <div className="xl:hidden space-y-8 col-span-1">
          <AnalyticsDashboard />
          <ExportActions />
        </div>

        <div className="xl:col-span-12 mt-4" key={refreshHistory}>
          <PredictionHistory />
        </div>

      </div>
    </div>
  );
}


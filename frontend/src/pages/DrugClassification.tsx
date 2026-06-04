import React, { useState, useEffect } from 'react';
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
  const [prediction, setPrediction] = useState<any>(() => {
    // Restore from localStorage on mount
    const saved = localStorage.getItem('agricosmo_last_prediction');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [stats, setStats] = useState<any>(null);

  // Save to localStorage whenever it changes
  useEffect(() => {
    if (prediction) {
      localStorage.setItem('agricosmo_last_prediction', JSON.stringify(prediction));
    } else {
      localStorage.removeItem('agricosmo_last_prediction');
    }
  }, [prediction]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/drug-classification/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error('Failed to fetch stats', e);
      }
    };
    if (token) {
      fetchStats();
    }
  }, [token, refreshHistory]);

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

      <HeroMetrics stats={stats} />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Input, Analytics, History */}
        <div className="xl:col-span-4 space-y-8 flex flex-col">
          <DrugInputForm onPredict={handlePredict} isLoading={loading} />
          
          <div className="hidden xl:block space-y-8">
            <AnalyticsDashboard stats={stats} />
            <ExportActions />
            <div key={refreshHistory}>
              <PredictionHistory onSelect={(item) => {
                setPrediction({
                  predicted_class: item.predicted_class,
                  confidence: item.confidence,
                  note: item.note,
                  smiles: item.smiles,
                  drug_name: item.input_data !== item.smiles ? item.input_data : undefined
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Results */}
        <div className="xl:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={loading ? 'loading' : (prediction ? 'result' : 'empty')}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <PredictionCard prediction={prediction} isLoading={loading} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile/Tablet View For Analytics/Export/History (Pushed to bottom) */}
        <div className="xl:hidden space-y-8 col-span-1">
          <AnalyticsDashboard stats={stats} />
          <ExportActions />
          <div key={`mobile-${refreshHistory}`}>
            <PredictionHistory onSelect={(item) => {
              setPrediction({
                predicted_class: item.predicted_class,
                confidence: item.confidence,
                note: item.note,
                smiles: item.smiles,
                drug_name: item.input_data !== item.smiles ? item.input_data : undefined
              });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} />
          </div>
        </div>

      </div>
    </div>
  );
}


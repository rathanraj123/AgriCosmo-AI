import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config';

import DrugInputForm from '@/components/drug-classification/DrugInputForm';
import PredictionCard from '@/components/drug-classification/PredictionCard';
import DrugHistoryTable from '@/components/drug-classification/DrugHistoryTable';

export default function DrugClassificationPage() {
  const { token } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handlePredict = async (data: { drug_name?: string; smiles?: string }) => {
    setLoading(true);
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
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500 relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
            Drug <span className="gradient-text">Classification</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Predict the biological origin (Plant, Fungal, Bacterial) of pharmaceutical compounds using our advanced Graph Isomorphism Network (GIN).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input and History */}
        <div className="lg:col-span-5 space-y-8">
          <DrugInputForm onPredict={handlePredict} isLoading={loading} />
          
          <div key={refreshHistory}>
            <DrugHistoryTable />
          </div>
        </div>

        {/* Right Column: Prediction Results */}
        <div className="lg:col-span-7">
          <PredictionCard prediction={prediction} />
        </div>

      </div>
    </div>
  );
}

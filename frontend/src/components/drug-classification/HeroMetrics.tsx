import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Beaker, BrainCircuit, CheckCircle2 } from 'lucide-react';
import MetricCard from './MetricCard';

export default function HeroMetrics({ stats }: { stats?: any }) {
  const metrics = [
    {
      title: 'Total Predictions',
      value: stats ? stats.total_predictions.toLocaleString() : '---',
      trend: '+12% this week',
      icon: Activity,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      delay: 0.1,
    },
    {
      title: 'Model Accuracy',
      value: stats ? `${stats.model_accuracy}%` : '---%',
      trend: 'State-of-the-art GIN',
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      delay: 0.2,
    },
    {
      title: 'Supported Origins',
      value: 'Plant, Fungal, Bact.',
      trend: '3 Major Classes',
      icon: Beaker,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      delay: 0.3,
    },
    {
      title: 'Model Status',
      value: stats ? stats.model_status : 'Loading...',
      trend: 'Last updated 2 days ago',
      icon: BrainCircuit,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      delay: 0.4,
    },
  ];

  return (
    <div className="mb-10 w-full">
      {/* Animated Hero Header */}
      <div className="mb-8 space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight"
        >
          Drug <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Classification AI</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl"
        >
          AI-Powered Drug Origin Classification using Graph Neural Networks
        </motion.p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <MetricCard 
            key={i}
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            icon={metric.icon}
            color={metric.color}
            bg={metric.bg}
            delay={metric.delay}
          />
        ))}
      </div>
    </div>
  );
}

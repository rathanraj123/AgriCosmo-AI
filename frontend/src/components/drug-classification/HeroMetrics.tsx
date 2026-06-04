import { motion } from 'framer-motion';
import { Activity, Beaker, BrainCircuit, CheckCircle2 } from 'lucide-react';

const metrics = [
  {
    title: 'Total Predictions',
    value: '14,203',
    trend: '+12% this week',
    icon: Activity,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    delay: 0.1,
  },
  {
    title: 'Model Accuracy',
    value: '94.8%',
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
    value: 'Active',
    trend: 'Last updated 2 days ago',
    icon: BrainCircuit,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    delay: 0.4,
  },
];

export default function HeroMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: metric.delay }}
          className="p-5 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl ${metric.bg} ${metric.color} group-hover:scale-110 transition-transform`}>
              <metric.icon className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold tracking-tight">{metric.value}</h3>
            <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
            <p className="text-xs text-muted-foreground/70 mt-2">{metric.trend}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

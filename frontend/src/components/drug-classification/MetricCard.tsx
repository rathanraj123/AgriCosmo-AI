import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import CountUp from 'react-countup';

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  delay: number;
}

export default function MetricCard({ title, value, trend, icon: Icon, color, bg, delay }: MetricCardProps) {
  // Simple heuristic to decide if we can animate it
  // If value contains a digit, let's try to animate it
  const hasNumber = /\d/.test(value);
  
  // Extract purely the numeric part for CountUp, and the prefix/suffix
  let endValue = 0;
  let prefix = '';
  let suffix = '';
  let decimals = 0;

  if (hasNumber) {
    const numMatch = value.match(/([\D]*)([\d,.]+)([\D]*)/);
    if (numMatch) {
      prefix = numMatch[1];
      const numStr = numMatch[2].replace(/,/g, '');
      endValue = parseFloat(numStr);
      suffix = numMatch[3];
      if (numStr.includes('.')) {
        decimals = numStr.split('.')[1].length;
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="p-5 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group h-full min-h-[140px] flex flex-col justify-between hover:scale-[1.02] hover:border-primary/30"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-bold tracking-tight">
          {hasNumber ? (
            <CountUp 
              end={endValue} 
              prefix={prefix} 
              suffix={suffix} 
              decimals={decimals}
              duration={2}
              separator=","
            />
          ) : (
            value
          )}
        </h3>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground/70 mt-2">{trend}</p>
      </div>
    </motion.div>
  );
}

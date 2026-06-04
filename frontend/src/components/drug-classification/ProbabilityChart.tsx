import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface ProbabilityChartProps {
  confidenceMap: Record<string, number>;
}

export default function ProbabilityChart({ confidenceMap }: ProbabilityChartProps) {
  // Process the map into recharts data format
  const data = Object.entries(confidenceMap)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 1000) / 10, // percentage to 1 decimal place
    }))
    .sort((a, b) => b.value - a.value);

  const getColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'plant': return '#22c55e'; // green-500
      case 'fungal': return '#f59e0b'; // amber-500
      case 'bacterial': return '#3b82f6'; // blue-500
      default: return '#8b5cf6'; // violet-500
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 p-3 rounded-xl shadow-lg">
          <p className="text-sm font-bold flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(name) }} />
            {name} Origin
          </p>
          <p className="text-2xl font-black font-mono mt-1">{value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Probability Distribution
      </h4>
      <div className="flex-1 min-h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationBegin={200}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(entry.name)} 
                  className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Custom Legend underneath */}
        <div className="absolute bottom-0 left-0 w-full flex justify-center gap-4">
          {data.map((entry, idx) => (
            <motion.div 
              key={entry.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (idx * 0.1) }}
              className="flex items-center gap-1.5"
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColor(entry.name) }} />
              <span className="text-xs font-medium text-muted-foreground">{entry.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

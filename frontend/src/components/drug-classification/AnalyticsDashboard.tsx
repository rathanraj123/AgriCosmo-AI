import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

export default function AnalyticsDashboard({ stats }: { stats?: any }) {
  // Use real trend data if available, otherwise fallback to mock
  const data = stats?.trend_data || [
    { day: 'Mon', predictions: 120, accuracy: 92 },
    { day: 'Tue', predictions: 150, accuracy: 94 },
    { day: 'Wed', predictions: 180, accuracy: 95 },
    { day: 'Thu', predictions: 170, accuracy: 93 },
    { day: 'Fri', predictions: 220, accuracy: 96 },
    { day: 'Sat', predictions: 110, accuracy: 94 },
    { day: 'Sun', predictions: 90, accuracy: 95 },
  ];

  return (
    <Card className="w-full shadow-lg border-border/50 glass-card">
      <CardHeader className="border-b border-border/50 bg-background/50">
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Usage Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPredictions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area 
                type="monotone" 
                dataKey="predictions" 
                stroke="var(--primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPredictions)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

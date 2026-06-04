import { motion } from 'framer-motion';
import { CloudRain, Thermometer, Cloud, Wind, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useClimateData } from '@/hooks/useDashboard';

export function ClimateCenter() {
  const { data: climateData } = useClimateData();
  const data = climateData || [];

  return (
    <div className="bg-black/40 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-cyan-500" /> Climate Intelligence
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Open-Meteo & NASA EarthData Sync</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-bold font-mono border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> FUNGAL RISK: ELEVATED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Avg Temp', value: `${data[data.length-1]?.temp || 28}°C`, icon: Thermometer, color: 'text-amber-500' },
          { label: 'Humidity', value: `${data[data.length-1]?.humidity || 82}%`, icon: Cloud, color: 'text-cyan-500' },
          { label: 'Precipitation', value: `${data[data.length-1]?.rain || 15}mm`, icon: CloudRain, color: 'text-blue-500' },
          { label: 'Wind Spd', value: '12km/h', icon: Wind, color: 'text-slate-400' }, // Wind not provided by simple query, leaving static
        ].map((metric) => (
          <div key={metric.label} className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
            <metric.icon className={`w-4 h-4 mb-2 ${metric.color}`} />
            <p className="text-[10px] text-slate-500 font-mono uppercase">{metric.label}</p>
            <p className="text-lg font-bold text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
              itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
            />
            <Area yAxisId="left" type="monotone" dataKey="humidity" stroke="#06b6d4" fill="url(#colorHumidity)" strokeWidth={2} name="Humidity (%)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Bug, Leaf, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useMemo, useState, useEffect } from 'react';
import { useOutbreaks } from '@/hooks/useDashboard';

const icons: any = {
  'Fungal': Leaf,
  'Bacterial': Activity,
  'Pest': Bug,
  'Viral': AlertTriangle,
  'Unknown': Activity
};

export function OutbreakMonitor() {
  const { data: fetchedOutbreaks } = useOutbreaks();
  const [liveOutbreaks, setLiveOutbreaks] = useState<any[]>([]);

  useEffect(() => {
    if (fetchedOutbreaks) {
      // Map icons string to actual lucide components
      const processed = fetchedOutbreaks.map((o: any) => ({
        ...o,
        icon: icons[o.type] || Activity
      }));
      setLiveOutbreaks(processed);
    }
  }, [fetchedOutbreaks]);

  return (
    <div className="bg-black/40 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" /> Outbreak Monitor
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Live Pathogen Tracking</p>
        </div>
      </div>

      <div className="space-y-3">
        {liveOutbreaks.length === 0 ? (
          <div className="text-center p-4 text-slate-500 text-xs font-mono">No active outbreaks detected.</div>
        ) : (
          liveOutbreaks.map((outbreak, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-slate-700 transition-colors">
              <div className={`p-3 rounded-lg ${outbreak.bg} shrink-0`}>
                <outbreak.icon className={`w-5 h-5 ${outbreak.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-white text-sm truncate">{outbreak.disease}</h4>
                  <span className={`text-[10px] font-mono font-bold ${outbreak.trend.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {outbreak.trend}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>{outbreak.type}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span>{outbreak.regions} Active Scans</span>
                </div>
              </div>

              <div className="sm:w-32">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-400">Spread Risk</span>
                  <span className={outbreak.risk > 70 ? 'text-rose-500 font-bold' : 'text-white'}>{outbreak.risk}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${outbreak.risk}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`h-full rounded-full ${outbreak.risk > 70 ? 'bg-rose-500' : outbreak.risk > 50 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

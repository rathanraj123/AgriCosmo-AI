import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, CheckCircle2, AlertTriangle, XCircle, Upload } from 'lucide-react';
import { api } from '@/lib/api';

const severityBadge = (s: string) => {
  const sev = s.toLowerCase();
  if (sev === 'low' || sev === 'none') return 'bg-success/10 text-success';
  if (sev === 'medium') return 'bg-warning/10 text-warning';
  if (sev === 'high' || sev === 'critical') return 'bg-destructive/10 text-destructive';
  return 'bg-secondary/10 text-secondary';
};

const statusIcon = (s: string) =>
  s === 'completed' ? <CheckCircle2 className="w-4 h-4 text-success" /> :
  s === 'processing' ? <ScanLine className="w-4 h-4 text-primary animate-pulse" /> :
  <XCircle className="w-4 h-4 text-destructive" />;

export default function AdminScansPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await api.get<any>('/analytics/scans');
        // Sometimes backend returns direct array, sometimes wraps in { data: [] }
        const scanData = Array.isArray(res) ? res : (res.data || []);
        setScans(scanData);
      } catch (error) {
        console.error('Failed to fetch admin scans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScans();
  }, []);
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="gradient-text">Scan Monitoring</span>
          </h1>
          <p className="text-muted-foreground mt-2">Real-time scan tracking and quality monitoring.</p>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Today', value: scans.filter(s => new Date(s.time).toDateString() === new Date().toDateString()).length.toString(), icon: ScanLine },
            { label: 'Completed', value: scans.filter(s => s.status === 'completed').length.toString(), icon: CheckCircle2 },
            { label: 'Processing', value: scans.filter(s => s.status === 'processing').length.toString(), icon: ScanLine },
            { label: 'Failed', value: scans.filter(s => s.status === 'failed').length.toString(), icon: AlertTriangle },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <s.icon className="w-4 h-4 text-muted-foreground mb-2" />
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Dataset Upload */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Upload className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Upload Training Dataset</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">Coming Soon</span>
          </div>
          <p className="text-sm text-muted-foreground">Upload new labeled datasets to retrain and improve model accuracy.</p>
        </motion.div>

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">User</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Disease</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Confidence</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Severity</th>
                  <th className="text-right p-4 font-semibold text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Fetching scan history...</td></tr>
            ) : scans.length > 0 ? (
              scans.map((s) => (
                <tr key={s.id} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                  <td className="p-4">{statusIcon(s.status)}</td>
                  <td className="p-4 font-medium">{s.user}</td>
                  <td className="p-4">{s.disease}</td>
                  <td className="p-4 font-semibold text-primary">{s.confidence > 0 ? `${s.confidence}%` : '—'}</td>
                  <td className="p-4">
                    {s.status === 'completed' && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${severityBadge(s.severity)}`}>{s.severity}</span>
                    )}
                  </td>
                  <td className="p-4 text-right text-muted-foreground">{new Date(s.time).toLocaleTimeString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No scans found.</td></tr>
            )}
          </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

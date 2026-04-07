import { motion } from 'framer-motion';
import { TrendingUp, Target, Globe, Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
  { month: 'Oct', users: 1200, scans: 28000 }, { month: 'Nov', users: 1450, scans: 32000 },
  { month: 'Dec', users: 1680, scans: 35000 }, { month: 'Jan', users: 2100, scans: 39000 },
  { month: 'Feb', users: 2500, scans: 44000 }, { month: 'Mar', users: 2847, scans: 48293 },
];

const regionData = [
  { region: 'North India', value: 35 }, { region: 'South India', value: 28 },
  { region: 'East India', value: 18 }, { region: 'West India', value: 12 },
  { region: 'International', value: 7 },
];

const cropDist = [
  { crop: 'Rice', scans: 12400 }, { crop: 'Wheat', scans: 9800 },
  { crop: 'Tomato', scans: 8200 }, { crop: 'Potato', scans: 6500 },
  { crop: 'Cotton', scans: 5200 }, { crop: 'Maize', scans: 3800 },
];

const PIE_COLORS = ['hsl(160, 84%, 39%)', 'hsl(243, 75%, 59%)', 'hsl(45, 93%, 47%)', 'hsl(0, 84%, 60%)', 'hsl(200, 70%, 50%)'];

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-2">Platform growth, model performance, and usage analytics.</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: TrendingUp, label: 'Growth Rate', value: '+18%/mo' },
            { icon: Target, label: 'Model Accuracy', value: '98.7%' },
            { icon: Globe, label: 'Regions Served', value: '12' },
            { icon: Cpu, label: 'Avg Inference', value: '1.2s' },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-5 hover-lift">
              <k.icon className="w-5 h-5 text-primary mb-2" />
              <div className="text-2xl font-extrabold">{k.value}</div>
              <div className="text-sm text-muted-foreground">{k.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Growth Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Platform Growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="growthUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="hsl(160, 84%, 39%)" fill="url(#growthUsers)" strokeWidth={2} name="Users" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Region Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Regional Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={regionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="region">
                  {regionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {regionData.map((r, i) => (
                <span key={r.region} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />{r.region}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Crop Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Scans by Crop</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cropDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="crop" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', fontSize: 12 }} />
                <Bar dataKey="scans" fill="hsl(243, 75%, 59%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

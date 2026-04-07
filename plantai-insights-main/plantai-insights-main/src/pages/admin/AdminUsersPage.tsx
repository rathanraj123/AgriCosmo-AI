import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Wheat, Microscope } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get<any>('/analytics/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                       u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleBlock = async (id: string) => {
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u));
    // In a real app, I'd call api.post(`/users/${id}/toggle-status`)
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="gradient-text">User Management</span>
          </h1>
          <p className="text-muted-foreground mt-2">View, search, and manage platform users.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total', value: users.length },
            { icon: Wheat, label: 'Farmers', value: users.filter(u => u.role === 'farmer').length },
            { icon: Microscope, label: 'Scientists', value: users.filter(u => u.role === 'scientist').length },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4 text-center">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2.5 rounded-xl glass text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="all">All Roles</option>
            <option value="farmer">Farmer</option>
            <option value="scientist">Scientist</option>
          </select>
        </div>

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-semibold text-muted-foreground">User</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Scans</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Joined</th>
                  <th className="text-right p-4 font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${u.role === 'farmer' ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">{u.scans}</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${u.status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{new Date(u.joined).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => toggleBlock(u.id)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${u.status === 'active' ? 'text-destructive hover:bg-destructive/10' : 'text-success hover:bg-success/10'}`}>
                        {u.status === 'active' ? 'Block' : 'Unblock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

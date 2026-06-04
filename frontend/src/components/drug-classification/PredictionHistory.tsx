import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, History, Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { API_URL } from '@/config';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryItem {
  id: string;
  input_data: string;
  predicted_class: string;
  confidence: Record<string, number>;
  created_at: string;
}

export default function PredictionHistory() {
  const { token } = useAppStore();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/drug-classification/history?per_page=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/drug-classification/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Record deleted");
        fetchHistory();
      } else {
        toast.error("Failed to delete record");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredHistory = history.filter(h => 
    h.input_data.toLowerCase().includes(search.toLowerCase()) || 
    h.predicted_class.toLowerCase().includes(search.toLowerCase())
  );

  const getOriginBadge = (origin: string) => {
    switch (origin.toLowerCase()) {
      case 'plant': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'fungal': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'bacterial': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      default: return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  return (
    <Card className="w-full shadow-lg border-border/50 glass-card">
      <CardHeader className="border-b border-border/50 bg-background/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Prediction History
          </CardTitle>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search history..." 
              className="pl-9 h-9 w-[200px] text-sm bg-background border-border/50 focus-visible:ring-primary/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground text-sm flex flex-col items-center">
            <History className="w-12 h-12 mb-4 opacity-20" />
            <p>No history found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            <AnimatePresence>
              {filteredHistory.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 hover:bg-accent/30 transition-colors flex items-center justify-between group"
                >
                  <div className="space-y-1 flex-1 min-w-0 pr-4">
                    <p className="font-semibold text-sm truncate text-foreground">
                      {item.input_data}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="font-mono">{((item.confidence[item.predicted_class] || 0) * 100).toFixed(1)}% Conf</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <Badge variant="outline" className={`px-2 py-0.5 text-xs font-semibold shadow-sm ${getOriginBadge(item.predicted_class)}`}>
                      {item.predicted_class}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(item.id)} 
                      className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

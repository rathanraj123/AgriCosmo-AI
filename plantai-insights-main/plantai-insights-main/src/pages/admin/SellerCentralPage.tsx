import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Box, ShoppingCart, Users, TrendingUp, Package, 
  Trash2, Edit, CheckCircle2, XCircle, Search, Filter, Plus,
  LayoutDashboard, List, ShoppingBag, Settings, Menu, X, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand?: string;
  image_url: string;
  specifications?: string[];
  rating?: number;
  reviews_count?: number;
  is_featured?: boolean;
}

interface Order {
  id: string;
  customer_name: string;
  items_count: number;
  total_amount: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
}

export default function SellerCentralPage() {
  const { userRole } = useAppStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, activeListings: 0, pendingOrders: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ 
    name: '', description: '', price: 0, stock: 10, category: 'Fertilizer', 
    image_url: '', brand: '', specifications: '', is_featured: false 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.get<any>('/marketplace/products'),
        api.get<any>('/marketplace/admin/orders')
      ]);
      
      const prodList = prodRes.items || prodRes;
      const orderList = orderRes.items || orderRes;
      
      setProducts(prodList);
      setOrders(orderList);
      
      // Calculate Stats
      setStats({
        totalSales: orderList.length,
        activeListings: prodList.length,
        pendingOrders: orderList.filter((o: any) => o.status === 'PENDING').length,
        revenue: orderList.reduce((sum: number, o: any) => sum + o.total_amount, 0)
      });
    } catch (error) {
      console.error('Failed to fetch seller data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...newProduct,
      specifications: newProduct.specifications.split(',').map(s => s.trim()).filter(Boolean)
    };
    try {
      if (editingProduct) {
        const res = await api.put<Product>(`/marketplace/products/${editingProduct.id}`, payload);
        setProducts(products.map(p => p.id === editingProduct.id ? res : p));
      } else {
        const res = await api.post<Product>('/marketplace/products', payload);
        setProducts([res, ...products]);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setNewProduct({ name: '', description: '', price: 0, stock: 10, category: 'Fertilizer', image_url: '', brand: '', specifications: '', is_featured: false });
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/marketplace/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/marketplace/orders/${id}/status`, { status });
      setOrders(orders.map(o => o.id === id ? { ...o, status: status as any } : o));
    } catch (error) {
      console.error('Update status failed:', error);
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-10 text-center max-w-md shadow-2xl"
        >
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-8 font-medium">
            This workspace is reserved for authorized AgriCosmo administrators. Please sign in to access Seller Central.
          </p>
          <Button 
            className="w-full h-14 gradient-primary rounded-2xl font-bold text-lg shadow-xl"
            onClick={() => window.location.href = '/admin/login'}
          >
            Sign In as Admin
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass border-r transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black">Seller<span className="gradient-text">Central</span></h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">AgriCosmo Marketplace</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'inventory', label: 'Inventory', icon: List },
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === item.id 
                    ? 'gradient-primary text-white shadow-md' 
                    : 'text-muted-foreground hover:bg-accent/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:bg-accent/50 transition-all">
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-20 glass border-b sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="w-6 h-6" />
            </Button>
            <h2 className="text-xl font-black capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search listings..." className="pl-10 w-64 rounded-xl h-10" />
            </div>
            <Button className="gradient-primary rounded-xl h-10 px-6 font-bold shadow-lg" onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Product
            </Button>
          </div>
        </header>

        <div className="p-8 pb-20">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-success' },
                    { label: 'Active Listings', value: stats.activeListings, icon: Box, color: 'text-primary' },
                    { label: 'Pending Orders', value: stats.pendingOrders, icon: ShoppingBag, color: 'text-warning' },
                    { label: 'Growth', value: '+24%', icon: TrendingUp, color: 'text-success' },
                  ].map((s, i) => (
                    <div key={i} className="glass rounded-3xl p-6 hover-lift border-primary/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent/30 flex items-center justify-center">
                          <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter text-success bg-success/5 border-success/20">Real-time</Badge>
                      </div>
                      <h4 className="text-3xl font-black mb-1">{s.value}</h4>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Sales Chart Placeholder / Recent Orders */}
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 glass rounded-3xl p-8 h-[400px] flex items-center justify-center border-primary/5">
                    <div className="text-center opacity-40">
                      <BarChart3 className="w-20 h-20 mx-auto mb-4" />
                      <p className="text-xl font-bold">Sales Performance Visualizer</p>
                    </div>
                  </div>
                  <div className="glass rounded-3xl p-6 border-primary/5">
                    <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                       <ShoppingCart className="w-5 h-5 text-primary" />
                       Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center gap-4 p-3 rounded-2xl bg-accent/20">
                          <div className="w-10 h-10 rounded-xl gradient-secondary flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">Farmer Order #{order.id.slice(0, 5)}</p>
                            <p className="text-[10px] text-muted-foreground font-bold">₹{order.total_amount}</p>
                          </div>
                          <Badge className="text-[8px]">{order.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div 
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="glass rounded-3xl overflow-hidden border-primary/5">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-accent/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-accent/20 transition-all group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={p.image_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-accent/30" />
                              <div>
                                <p className="font-bold text-sm">{p.name}</p>
                                <p className="text-[10px] text-muted-foreground line-clamp-1">{p.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="text-[10px] font-bold">{p.category}</Badge>
                          </td>
                          <td className="px-6 py-4 font-black text-primary">₹{p.price}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {p.stock < 5 && <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />}
                              <span className="font-bold">{p.stock}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" 
                                onClick={() => { 
                                  setEditingProduct(p); 
                                  setNewProduct({
                                    name: p.name,
                                    description: p.description,
                                    price: p.price,
                                    stock: p.stock,
                                    category: p.category,
                                    image_url: p.image_url,
                                    brand: p.brand || '',
                                    specifications: (p.specifications || []).join(', '),
                                    is_featured: p.is_featured || false
                                  }); 
                                  setIsProductModalOpen(true); 
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <Button size="icon" variant="ghost" className="w-8 h-8 rounded-lg hover:bg-destructive/10" onClick={() => deleteProduct(p.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="grid gap-4">
                  {orders.map(order => (
                    <div key={order.id} className="glass rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-primary/5">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-black text-lg">Order #{order.id.slice(0, 8)}</h3>
                            <Badge className={
                              order.status === 'DELIVERED' ? 'bg-success/10 text-success border-success/20' :
                              order.status === 'SHIPPED' ? 'bg-primary/10 text-primary border-primary/20' :
                              'bg-warning/10 text-warning border-warning/20'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="text-secondary">₹{order.total_amount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {order.status === 'PENDING' && (
                          <Button size="sm" className="gradient-primary rounded-xl px-4 h-9 font-bold" onClick={() => updateOrderStatus(order.id, 'SHIPPED')}>
                            Mark as Shipped
                          </Button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <Button size="sm" className="bg-success text-white hover:bg-success/90 rounded-xl px-4 h-9 font-bold" onClick={() => updateOrderStatus(order.id, 'DELIVERED')}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark Delivered
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="rounded-xl px-4 h-9 font-bold">Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed inset-4 md:inset-auto md:w-full md:max-w-2xl md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-background rounded-3xl z-[70] shadow-2xl p-8 border"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">{editingProduct ? 'Edit Listing' : 'New Listing'}</h2>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsProductModalOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 scrollbar-hide">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Title</label>
                    <Input placeholder="e.g. Organic NPK" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Brand</label>
                    <Input placeholder="e.g. AgriPro" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Category</label>
                    <select className="w-full bg-background border rounded-xl h-10 px-4 text-sm outline-none focus:ring-1 focus:ring-primary" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                      {['Fertilizer', 'Pesticides', 'Seeds', 'Tools'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Price (₹)</label>
                    <Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} required className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Stock</label>
                    <Input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} required className="h-10 rounded-xl" />
                  </div>
                  <div className="flex items-center gap-3 pt-6 px-1">
                    <input 
                      type="checkbox" 
                      id="isFeatured"
                      checked={newProduct.is_featured} 
                      onChange={e => setNewProduct({...newProduct, is_featured: e.target.checked})}
                      className="w-4 h-4 rounded border-primary text-primary focus:ring-primary"
                    />
                    <label htmlFor="isFeatured" className="text-xs font-bold cursor-pointer">Featured Listing</label>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Key Features (Comma separated)</label>
                  <Input placeholder="Eco-friendly, High Yield, 5kg" value={newProduct.specifications} onChange={e => setNewProduct({...newProduct, specifications: e.target.value})} className="h-10 rounded-xl" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Description</label>
                  <textarea className="w-full bg-background border rounded-2xl p-4 text-sm min-h-[80px] outline-none focus:ring-1 focus:ring-primary" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Image URL</label>
                  <Input placeholder="https://..." value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} className="h-10 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-12 gradient-primary rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] transition-transform mt-4">
                  {editingProduct ? 'Update Listing' : 'Launch Product'}
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

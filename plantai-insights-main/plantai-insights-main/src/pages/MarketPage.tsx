import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Filter, Tag, Info, ShoppingBag, ArrowRight, Star, Truck, ShieldCheck, Plus, CheckCircle2, X } from 'lucide-react';
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

export default function MarketPage() {
  const { token, userRole } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const activeCategoryValue = activeCategory;

  useEffect(() => {
    fetchProducts();
    const savedCart = localStorage.getItem('agricosmo-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart');
      }
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('agricosmo-cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    try {
      const response = await api.get<any>('/marketplace/products');
      if (response && response.items) {
        setProducts(response.items);
      } else if (Array.isArray(response)) {
        setProducts(response);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy admin handlers removed (moved to Seller Central)

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("This product is currently out of stock.");
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Only ${product.stock} units available in stock.`);
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        if (delta > 0 && item.quantity >= item.product.stock) {
          alert(`Only ${item.product.stock} units available in stock.`);
          return item;
        }
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!token) {
      alert('Please login to place an order');
      return;
    }
    
    setIsCheckingOut(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price_at_purchase: item.product.price
        })),
        total_amount: cartTotal,
        shipping_address: "Default Address", // In a real app, this would be a form
        contact_phone: "9999999999"
      };
      
      await api.post('/marketplace/orders', orderData);
      alert('Order placed successfully!');
      setCart([]);
      setIsCartOpen(false);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategoryValue === 'All' || p.category === activeCategoryValue;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Agri<span className="gradient-text">Market</span></h1>
            <p className="text-muted-foreground mt-2">Premium fertilizers, pesticides, and certified crop treatments.</p>
          </div>
          <div className="flex gap-4">
             {userRole === 'admin' && (
               <Button 
                 onClick={() => window.location.href = '/admin/seller-central'} 
                 className="gradient-secondary rounded-xl h-11 px-6 shadow-lg"
               >
                 Seller Central
               </Button>
             )}
             <div className="relative min-w-[280px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input 
                 placeholder="Search products..." 
                 className="pl-10 rounded-xl h-11" 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
               />
             </div>
             <Button 
               variant="outline" 
               size="icon" 
               className="rounded-xl h-11 w-11 shrink-0 relative"
               onClick={() => setIsCartOpen(true)}
             >
               <ShoppingCart className="w-5 h-5 text-muted-foreground" />
               {cart.length > 0 && (
                 <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary text-[10px] font-bold text-white flex items-center justify-center border-2 border-background">
                   {cart.reduce((a, b) => a + b.quantity, 0)}
                 </span>
               )}
             </Button>
          </div>
        </div>

        {/* Cart Drawer Overlay */}
        <AnimatePresence>
          {isCartOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCartOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 px-4"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                    Your Cart
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>×</Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                      <ShoppingBag className="w-16 h-16 mb-4" />
                      <p className="text-xl font-medium">Your cart is empty</p>
                      <Button variant="link" onClick={() => setIsCartOpen(false)}>Start shopping</Button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl bg-accent/30 overflow-hidden shrink-0">
                          <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{item.product.name}</h4>
                          <p className="text-primary font-bold">₹{item.product.price}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border rounded-lg">
                              <button onClick={() => updateQuantity(item.product.id, -1)} className="px-3 py-1 hover:bg-accent">-</button>
                              <span className="px-3 py-1 font-medium">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, 1)} className="px-3 py-1 hover:bg-accent">+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.product.id)} className="text-xs text-destructive font-medium hover:underline">Remove</button>
                          </div>
                        </div>
                        <div className="text-right font-bold">
                          ₹{item.product.price * item.quantity}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {cart.length > 0 && (
                  <div className="p-6 border-t bg-accent/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-2xl font-black">₹{cartTotal}</span>
                    </div>
                    <Button 
                      onClick={handleCheckout} 
                      disabled={isCheckingOut}
                      className="w-full h-14 gradient-primary rounded-2xl font-bold text-lg shadow-xl"
                    >
                      {isCheckingOut ? 'Processing...' : 'Complete Checkout'}
                      {!isCheckingOut && <ArrowRight className="w-5 h-5 ml-2" />}
                    </Button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Detail Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProduct(null)}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60]"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="fixed inset-4 md:inset-auto md:w-full md:max-w-4xl md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-background rounded-[40px] z-[70] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/10"
              >
                <div className="md:w-1/2 relative bg-accent/20">
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-white/90 text-black border-none px-4 py-1.5 font-black uppercase text-[10px] tracking-widest backdrop-blur-md shadow-xl">
                      {selectedProduct.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">{selectedProduct.brand || 'AgriCosmo'}</span>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="font-black text-sm">{selectedProduct.rating || 4.5}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">(120+ Verified Reviews)</span>
                      </div>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{selectedProduct.name}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                      {selectedProduct.description}
                    </p>
                    
                    {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
                      <div className="space-y-4 mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Key Specifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.specifications.map((spec, i) => (
                            <Badge key={i} variant="secondary" className="rounded-lg px-3 py-1 text-[10px] font-bold">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-accent/20 border border-white/5">
                        <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Availability</p>
                        <p className="text-sm font-bold flex items-center gap-2 text-success">
                          <CheckCircle2 className="w-4 h-4" />
                          In Stock ({selectedProduct.stock})
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-accent/20 border border-white/5">
                        <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Shipping</p>
                        <p className="text-sm font-bold flex items-center gap-2">
                          <Truck className="w-4 h-4 text-primary" />
                          2-3 Day Delivery
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Total Price</p>
                      <h3 className="text-4xl font-black gradient-text">₹{selectedProduct.price}</h3>
                    </div>
                    <Button 
                      onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                      className="flex-1 gradient-primary h-16 rounded-2xl font-black text-xl shadow-2xl hover:scale-[1.02] transition-transform"
                    >
                      <ShoppingCart className="w-6 h-6 mr-3" />
                      Add To Cart
                    </Button>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center backdrop-blur-md transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
          {['All', 'Fertilizer', 'Pesticide', 'Bio-Control', 'Seeds', 'Tools'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-card border text-muted-foreground hover:bg-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass rounded-2xl h-[400px] animate-pulse bg-accent/20" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center glass rounded-3xl">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium text-lg">No products found matching your search.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="glass rounded-2xl overflow-hidden border shadow-sm flex flex-col group relative"
                >
                  {product.is_featured && (
                    <div className="absolute top-0 left-0 z-10 px-3 py-1 bg-warning text-[10px] font-black uppercase text-warning-foreground rounded-br-xl shadow-lg">
                      Featured
                    </div>
                  )}
                  <div 
                    className="aspect-square bg-accent/30 relative overflow-hidden cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <img 
                      src={product.image_url || 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <Badge className="absolute top-3 right-3 gradient-primary border-none shadow-md">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{product.brand || 'AgriCosmo'}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-warning text-warning" />
                        <span className="text-[10px] font-bold">{product.rating || 4.5}</span>
                      </div>
                    </div>
                    <h3 
                      className="font-bold text-lg mb-1 leading-tight line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-xl font-black gradient-text">₹{product.price}</span>
                        <p className="text-[10px] text-muted-foreground">Incl. taxes</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={`rounded-xl px-4 h-9 shadow-sm hover:shadow-md transition-all ${product.stock === 0 ? 'bg-muted text-muted-foreground' : 'gradient-primary'}`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.stock === 0 ? 'Out of Stock' : 'Add To Cart'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Promo Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-primary/10 border-primary/20"
        >
          <div className="relative z-10 max-w-xl">
            <Badge className="mb-4 bg-primary text-primary-foreground font-bold px-4 py-1">Limited Offer</Badge>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">Expert Consultation + <span className="text-primary">Free Fertilizers</span></h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-6">
              Subscribe to AgriCosmo Pro and get monthly soil tests and personalized nutrient recommendations delivered to your farm.
            </p>
            <Button className="gradient-primary rounded-2xl px-10 h-14 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              Claim Now
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full hidden lg:block opacity-20">
             <div className="w-full h-full bg-gradient-to-l from-primary to-transparent" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

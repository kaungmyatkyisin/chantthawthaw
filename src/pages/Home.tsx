import { Container, Grid, Typography, Box, CircularProgress, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../lib/supabase';
import { Product, Order } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, Filter } from 'lucide-react';

const CATEGORY_DATA = [
  { name: 'အခြေခံ စားသောက်ကုန်များ', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80' },
  { name: 'သောက်စရာများ', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80' },
  { name: 'နို့ထွက်ပစ္စည်း၊ ပေါင်မုန့် နှင့် အအေး', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80' },
  { name: 'အသီးအနှံ နှင့် အသားအမျိုးမျိုး', image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=300&q=80' },
  { name: 'နံနက်စာနှင့် အဆာပြေ မုန့်အမျိုးမျိုး', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80' },
  { name: 'မိခင်နှင့် ကလေး အသုံးအဆောင်ပစ္စည်းများ', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80' },
  { name: 'ဆေးဝါးနှင့် ကျန်းမာရေးပစ္စည်းများ', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80' },
  { name: 'အလှအပ နှင့် တစ်ကိုယ်ရည်သုံး ပစ္စည်းများ', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80' },
  { name: 'အိမ်သုံးအဆောင် ပစ္စည်းများ', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80' },
  { name: 'ကွန်ပျူတာနှင့် မိုဘိုင်းဖုန်းပစ္စည်းများ', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&q=80' },
  { name: 'ဖက်ရှင်ပစ္စည်းများ', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80' },
  { name: 'စာအုပ်၊ ဂီတနှင့် စာရေးကိရိယာများ', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=300&q=80' },
];

const CATEGORIES = ['အားလုံး', ...CATEGORY_DATA.map(c => c.name)];

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trackPhone, setTrackPhone] = useState('');
  const [trackResults, setTrackResults] = useState<Order[]>([]);
  const [trackLoading, setTrackLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSupabase()
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = async () => {
    if (!trackPhone.trim()) return;
    setTrackLoading(true);
    setHasSearched(true);
    try {
      const { data, error } = await getSupabase()
        .from('orders')
        .select('*')
        .eq('customer_phone', trackPhone.trim())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrackResults(data || []);
    } catch (error) {
      console.error('Error tracking order:', error);
    } finally {
      setTrackLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    
    if (value.trim()) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6); // Limit suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setShowSuggestions(false);
  };

  const filteredProducts = products.filter(p => {
    return p.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleCategoryClick = (catName: string) => {
    navigate(`/category/${encodeURIComponent(catName)}`);
  };

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6 }}>
          {/* Top: Search Bar */}
          <Box sx={{ 
            maxWidth: 600, 
            mx: 'auto',
            position: 'relative',
            mb: 6
          }}>
            <Box sx={{ 
              backgroundColor: 'white',
              p: 1,
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: '1px solid #FBC02D',
            }}>
              <TextField
                placeholder="Search products..."
                fullWidth
                variant="outlined"
                value={search}
                onChange={handleSearchChange}
                onFocus={() => search.trim() && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowSuggestions(false);
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '12px',
                    backgroundColor: '#f1f5f9',
                    border: 'none',
                    '& fieldset': { border: 'none' }
                  } 
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} className="text-slate-400" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                {suggestions.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.id)}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                      <img 
                        src={product.image_url || 'https://picsum.photos/seed/grocery/50/50'} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{product.name}</p>
                      <p className="text-[10px] text-slate-400">{product.category}</p>
                    </div>
                    <div className="text-cyan-600 font-bold text-xs">
                      Ks {product.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Box>

          {/* Middle: Categories Grid */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" className="text-rose-500 font-bold mb-4">
              အမျိုးအစားများ:
            </Typography>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {CATEGORY_DATA.map((cat) => (
                <div 
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="cursor-pointer border border-gray-200 rounded-md overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="h-24 md:h-32 overflow-hidden">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="bg-gray-100 p-2 text-center">
                    <p className="text-[10px] md:text-sm font-bold text-gray-800 line-clamp-2">
                      {cat.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Box>

          {/* Track My Order Section */}
          <Box sx={{ mb: 6, p: 3, backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <Typography variant="h6" className="text-rose-500 font-bold mb-4">
              သင့်အော်ဒါကို ဖုန်းနံပါတ်ဖြင့် ရှာဖွေပါ
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: trackResults.length > 0 || hasSearched ? 4 : 0 }}>
              <TextField
                placeholder="Phone Number"
                size="small"
                fullWidth
                value={trackPhone}
                onChange={(e) => setTrackPhone(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <Button 
                variant="contained" 
                onClick={handleTrackOrder}
                disabled={trackLoading}
                sx={{ 
                  backgroundColor: '#2E7D32', 
                  borderRadius: '12px',
                  px: 4,
                  textTransform: 'none',
                  fontWeight: 700
                }}
              >
                {trackLoading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
              </Button>
            </Box>

            {hasSearched && !trackLoading && (
              <Box sx={{ mt: 3 }}>
                {trackResults.length > 0 ? (
                  <div className="space-y-3">
                    {trackResults.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Order ID: {order.id.slice(0, 8)}...</p>
                          <p className="text-sm font-bold text-slate-800">Total: Ks {order.total_amount.toLocaleString()}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 
                          order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                          'bg-rose-100 text-rose-600'
                        }`}>
                          {order.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    ဤဖုန်းနံပါတ်ဖြင့် အော်ဒါမှတ်တမ်း မရှိသေးပါ။
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Bottom: Dynamic Product Display */}
          <Box>
            <Typography variant="h6" className="text-slate-800 font-bold mb-4">
              {search ? `ရှာဖွေမှုရလဒ်များ: "${search}"` : 'အထူးအစီအစဉ် ပစ္စည်းများ:'}
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: '#2E7D32' }} />
              </Box>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="h6" color="textSecondary">
                  ရှာဖွေမှုနှင့် ကိုက်ညီသော ပစ္စည်းမရှိပါ။
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

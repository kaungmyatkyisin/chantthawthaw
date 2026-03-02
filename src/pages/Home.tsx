import { Container, Grid, Typography, Box, CircularProgress, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, Filter } from 'lucide-react';

const CATEGORIES = ['အားလုံး', 'အသီးအနှံ', 'ဟင်းသီးဟင်းရွက်', 'နို့နှင့်နို့ထွက်ပစ္စည်း', 'မုန့်မျိုးစုံ', 'အသားနှင့်ငါး', 'အိမ်သုံးကုန်ခြောက်', 'ဖျော်ရည်နှင့်အချိုရည်', 'ကျောင်းဝတ်စုံ'];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('အားလုံး');

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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'အားလုံး' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-1px', color: '#1e293b' }}>
            Fresh Groceries, <span className="text-[#2E7D32]">Delivered.</span>
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 4, fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
            Shop the freshest produce and household essentials from the comfort of your home.
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2, 
            maxWidth: 800, 
            mx: 'auto',
            backgroundColor: 'white',
            p: 1.5,
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid #FBC02D'
          }}>
            <TextField
              placeholder="Search products..."
              fullWidth
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                displayEmpty
                sx={{ 
                  borderRadius: '12px',
                  backgroundColor: '#f1f5f9',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <Filter size={18} className="text-slate-400" />
                  </InputAdornment>
                }
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#2E7D32' }} />
          </Box>
        ) : filteredProducts.length > 0 ? (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="textSecondary">
              No products found matching your criteria.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

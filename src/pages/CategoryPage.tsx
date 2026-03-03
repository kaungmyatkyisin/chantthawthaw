import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSupabase } from '../lib/supabase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ChevronLeft } from 'lucide-react';

export default function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [categoryName]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSupabase()
        .from('products')
        .select('*')
        .eq('category', categoryName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Link 
            to="/" 
            className="inline-flex items-center text-slate-500 hover:text-rose-500 transition-colors mb-4 font-medium"
          >
            <ChevronLeft size={20} />
            <span>ပင်မစာမျက်နှာသို့</span>
          </Link>
          <Typography variant="h5" className="text-rose-500 font-bold">
            ရှာဖွေထားသောပစ္စည်းများကို အောက်တွင်ဖော်ပြထားသည် ({categoryName})
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#f43f5e' }} />
          </Box>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="textSecondary">
              ဤအမျိုးအစားတွင် ပစ္စည်းများမရှိသေးပါ။
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

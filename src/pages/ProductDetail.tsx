import { Container, Typography, Box, CircularProgress, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSupabase } from '../lib/supabase';
import { Product } from '../types';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSupabase()
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5">Product not found.</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Back to Home</Button>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Button 
          onClick={() => navigate(-1)} 
          startIcon={<ChevronLeft />}
          sx={{ mb: 4, textTransform: 'none', color: '#64748b' }}
        >
          Back
        </Button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section */}
            <div className="bg-slate-50 p-6 flex items-center justify-center">
              <img 
                src={product.image_url || 'https://picsum.photos/seed/grocery/800/800'} 
                alt={product.name}
                className="max-w-full max-h-[500px] object-contain rounded-xl shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Info Section */}
            <div className="p-8 md:p-12 flex flex-col">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-rose-50 text-rose-500 text-xs font-bold rounded-full mb-4">
                  {product.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-slate-500 text-lg">
                  {product.description || 'Premium quality product selected for you.'}
                </p>
              </div>

              <div className="mt-auto">
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-black text-cyan-600">
                    Ks {product.price.toLocaleString()}
                  </span>
                  <span className="text-slate-400 text-sm">/ unit</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => product.stock_quantity > 0 && addToCart(product)}
                    disabled={product.stock_quantity <= 0}
                    className={`flex-grow py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold text-lg shadow-lg ${
                      product.stock_quantity > 0 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <ShoppingCart size={24} />
                    {product.stock_quantity > 0 ? 'Add to Cart' : 'ပစ္စည်းပြတ်သွားပါပြီ'}
                  </button>
                  <button className="flex-grow bg-white border-2 border-slate-200 hover:border-rose-500 hover:text-rose-500 text-slate-600 py-4 rounded-2xl transition-all font-bold text-lg">
                    Save for Later
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Availability</p>
                      <p className={`text-sm font-bold ${product.stock_quantity > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Delivery</p>
                      <p className="text-sm font-bold text-slate-700">Fast Delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Box>
  );
}

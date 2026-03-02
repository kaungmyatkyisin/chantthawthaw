import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { Product } from '../types';
import ProductForm from '../components/ProductForm';

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await getSupabase()
          .from('products')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              Inventory Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage your products, prices, and stock levels.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Plus size={20} />}
            onClick={handleAdd}
            sx={{ 
              backgroundColor: '#2E7D32', 
              '&:hover': { backgroundColor: '#1B5E20' },
              textTransform: 'none',
              borderRadius: '12px',
              px: 3,
              py: 1.2,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)'
            }}
          >
            Add Product
          </Button>
        </Box>

        <Paper elevation={0} sx={{ 
          borderRadius: '20px', 
          overflow: 'hidden', 
          border: '1px solid #f1f5f9',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Created At</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#64748b' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={product.image_url} 
                            variant="rounded" 
                            sx={{ width: 48, height: 48, borderRadius: '10px' }}
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {product.name}
                            </Typography>
                            {product.description && (
                              <Typography variant="caption" color="textSecondary" sx={{ 
                                display: 'block',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {product.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={product.category} 
                          size="small" 
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.75rem',
                            backgroundColor: '#f1f5f9',
                            color: '#475569'
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#2E7D32' }}>
                        Ks {product.price.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {new Date(product.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="View in Store">
                            <IconButton size="small" sx={{ color: '#64748b' }}>
                              <ExternalLink size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Product">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEdit(product)}
                              sx={{ color: '#2E7D32', backgroundColor: '#E8F5E9', '&:hover': { backgroundColor: '#C8E6C9' } }}
                            >
                              <Edit2 size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Product">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(product.id)}
                              sx={{ color: '#ef4444', backgroundColor: '#fef2f2', '&:hover': { backgroundColor: '#fee2e2' } }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <Typography color="textSecondary">No products found. Start by adding one!</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      <ProductForm 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={fetchProducts}
        product={editingProduct}
      />
    </Box>
  );
}

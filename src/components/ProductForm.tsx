import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  Typography,
  CircularProgress,
  MenuItem
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Product, ProductInput } from '../types';
import { getSupabase } from '../lib/supabase';
import { Upload } from 'lucide-react';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  product?: Product | null;
}

const CATEGORIES = [
  'အခြေခံ စားသောက်ကုန်များ',
  'သောက်စရာများ',
  'နို့ထွက်ပစ္စည်း၊ ပေါင်မုန့် နှင့် အအေး',
  'အသီးအနှံ နှင့် အသားအမျိုးမျိုး',
  'နံနက်စာနှင့် အဆာပြေ မုန့်အမျိုးမျိုး',
  'မိခင်နှင့် ကလေး အသုံးအဆောင်ပစ္စည်းများ',
  'ဆေးဝါးနှင့် ကျန်းမာရေးပစ္စည်းများ',
  'အလှအပ နှင့် တစ်ကိုယ်ရည်သုံး ပစ္စည်းများ',
  'အိမ်သုံးအဆောင် ပစ္စည်းများ',
  'ကွန်ပျူတာနှင့် မိုဘိုင်းဖုန်းပစ္စည်းများ',
  'ဖက်ရှင်ပစ္စည်းများ',
  'စာအုပ်၊ ဂီတနှင့် စာရေးကိရိယာများ'
];

export default function ProductForm({ open, onClose, onSubmit, product }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category: CATEGORIES[0],
    stock_quantity: 0
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        stock_quantity: product.stock_quantity
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: CATEGORIES[0],
        stock_quantity: 0
      });
    }
  }, [product, open]);

  const handleUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error: uploadError } = await getSupabase().storage
      .from('product-images bucket')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = getSupabase().storage
      .from('product-images bucket')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.image_url;
      if (imageFile) {
        finalImageUrl = await handleUpload(imageFile);
      }

      const payload = { ...formData, image_url: finalImageUrl };

      if (product) {
        const { error } = await getSupabase()
          .from('products')
          .update(payload)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await getSupabase()
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }

      onSubmit();
      onClose();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(`Error saving product: ${error.message || 'Unknown error'}. \n\nCheck your Supabase RLS policies for the "products" table and "product-images bucket" storage.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {product ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <TextField
            label="Product Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Short Description"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter a brief description of the product..."
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Price (MMK)"
              type="number"
              fullWidth
              required
              inputProps={{ step: "1", min: "0" }}
              onFocus={(e) => e.target.select()}
              value={formData.price === 0 ? '' : formData.price}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ ...formData, price: val === '' ? 0 : parseFloat(val) });
              }}
            />
            <TextField
              select
              label="Category"
              fullWidth
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Stock Quantity"
            type="number"
            fullWidth
            required
            inputProps={{ min: "0" }}
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
            helperText="လက်ကျန်ပစ္စည်းအရေအတွက်"
          />
          
          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 1.5, display: 'block', fontWeight: 700, textAlign: 'center' }}>
              Product Image
            </Typography>
            <Box 
              sx={{ 
                border: '2px dotted', 
                borderColor: imageFile ? '#22c55e' : '#cbd5e1',
                borderRadius: '16px', 
                p: 4, 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: imageFile ? '#f0fdf4' : '#f8fafc',
                transition: 'all 0.2s ease',
                width: '100%',
                minHeight: '160px',
                boxSizing: 'border-box',
                '&:hover': { 
                  borderColor: '#2E7D32',
                  backgroundColor: '#f1f5f9'
                }
              }}
              component="label"
            >
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
              />
              <Upload 
                size={32} 
                style={{ 
                  marginBottom: '12px',
                  color: imageFile ? '#22c55e' : '#94a3b8'
                }} 
              />
              <Typography variant="body2" sx={{ fontWeight: 700, color: imageFile ? '#15803d' : '#64748b', mb: 0.5 }}>
                {imageFile ? 'Image Selected' : 'Click to upload or drag and drop'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                SVG, PNG, JPG or GIF (max. 800x400px)
              </Typography>
            </Box>
            {formData.image_url && !imageFile && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <img src={formData.image_url} alt="Current" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                <Typography variant="caption">Current image</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ 
              backgroundColor: '#2E7D32', 
              '&:hover': { backgroundColor: '#1B5E20' },
              textTransform: 'none',
              borderRadius: '8px',
              px: 4,
              boxShadow: 'none',
              fontWeight: 700
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (product ? 'Update Product' : 'Add Product')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

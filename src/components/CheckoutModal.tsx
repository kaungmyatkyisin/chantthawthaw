import React, { useState, useEffect } from 'react';
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
  IconButton
} from '@mui/material';
import { X, Upload, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getSupabase } from '../lib/supabase';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    alternative_phone: '',
    note: ''
  });
  const [slipFile, setSlipFile] = useState<File | null>(null);

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (open) {
      // Reset when opening to ensure a fresh state
      setSuccess(false);
      setLoading(false);
      setSlipFile(null);
      setFormData({ 
        name: '', 
        phone: '',
        address: '',
        alternative_phone: '',
        note: ''
      });
    }
  }, [open]);

  const handleUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await getSupabase().storage
      .from('order-slips')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = getSupabase().storage
      .from('order-slips')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipFile) {
      alert('ကျေးဇူးပြု၍ ငွေလွှဲဖြတ်ပိုင်း Screenshot တင်ပေးပါ။');
      return;
    }

    setLoading(true);
    try {
      const slipUrl = await handleUpload(slipFile);

      const { error } = await getSupabase()
        .from('orders')
        .insert([{
          customer_name: formData.name,
          customer_phone: formData.phone,
          address: formData.address,
          alternative_phone: formData.alternative_phone,
          note: formData.note,
          total_amount: totalPrice,
          items: items,
          slip_url: slipUrl,
          status: 'pending'
        }]);

      if (error) throw error;

      // Decrement stock for each item
      for (const item of items) {
        try {
          const { data: productData, error: fetchError } = await getSupabase()
            .from('products')
            .select('stock_quantity')
            .eq('id', item.id)
            .single();

          if (!fetchError && productData) {
            const newStock = Math.max(0, productData.stock_quantity - item.quantity);
            await getSupabase()
              .from('products')
              .update({ stock_quantity: newStock })
              .eq('id', item.id);
          }
        } catch (stockErr) {
          console.error('Error updating stock for item:', item.id, stockErr);
          // Continue with other items even if one fails
        }
      }

      setSuccess(true);
      clearCart();
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Order တင်ရာတွင် အမှားအယွင်းရှိခဲ့ပါသည်။ ကျေးဇူးပြု၍ ထပ်မံကြိုးစားကြည့်ပါ။');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 6 }}>
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Order တင်ပြီးပါပြီ!
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
            ဝယ်ယူအားပေးမှုအတွက်ကျေးဇူးတင်ပါသည်။ Order Confirm ကြောင်းကို မကြာမီ ပြန်လည်ဆက်သွယ်ပါမည်။
          </Typography>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={onClose}
            sx={{ backgroundColor: '#2E7D32', py: 1.5, borderRadius: '12px' }}
          >
            ပိတ်မည်
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="body">
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Checkout
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ mb: 4, p: 2, backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 700 }}>
              Order Summary
            </Typography>
            {items.map(item => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{item.name} x {item.quantity}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Ks {(item.price * item.quantity).toLocaleString()}</Typography>
              </Box>
            ))}
            <Box sx={{ borderTop: '1px dashed #cbd5e1', mt: 2, pt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0891b2' }}>Ks {totalPrice.toLocaleString()}</Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 4, p: 2, backgroundColor: '#fff7ed', borderRadius: '16px', border: '1px solid #ffedd5' }}>
            <Typography variant="subtitle2" sx={{ color: '#9a3412', mb: 1, fontWeight: 700 }}>
              Payment Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" sx={{ color: '#c2410c', fontWeight: 600 }}>
                KBZ Pay: 09-759728262 (Name: Kaung Myat Kyi Sin)
              </Typography>
              <Typography variant="body2" sx={{ color: '#c2410c', fontWeight: 600 }}>
                KBZ Pay: 09-940968446 (Name: Soe Myat Kyaw)
              </Typography>
              <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700, mt: 1 }}>
                * Kpay Note ထဲတွင် ပစ္စည်းမှာယူသူ ဖုန်းနံပါတ်ကို ဖြည့်ပေးပါ
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Customer Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Phone Number"
              required
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              label="နေရပ်လိပ်စာအပြည့်အစုံ"
              required
              fullWidth
              multiline
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="အိမ်အမှတ်၊ လမ်း၊ ရပ်ကွက်၊ မြို့နယ်..."
            />
            <TextField
              label="ဒုတိယ ဖုန်းနံပါတ် (ရှိလျှင်)"
              fullWidth
              value={formData.alternative_phone}
              onChange={(e) => setFormData({ ...formData, alternative_phone: e.target.value })}
            />
            <TextField
              label="မှတ်ချက် (Delivery Note)"
              fullWidth
              multiline
              rows={2}
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="ပို့ဆောင်ရာတွင် သိစေလိုသည်များ..."
            />
            
            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ mb: 1.5, display: 'block', fontWeight: 700, textAlign: 'center' }}>
                ငွေလွှဲဖြတ်ပိုင်း Screenshot တင်ရန်
              </Typography>
              <Box 
                sx={{ 
                  border: '2px dotted', 
                  borderColor: slipFile ? '#22c55e' : '#cbd5e1',
                  borderRadius: '16px', 
                  p: 4, 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: slipFile ? '#f0fdf4' : '#f8fafc',
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
                  onChange={(e) => setSlipFile(e.target.files?.[0] || null)} 
                />
                <Upload 
                  size={32} 
                  style={{ 
                    marginBottom: '12px',
                    color: slipFile ? '#22c55e' : '#94a3b8'
                  }} 
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700, 
                    color: slipFile ? '#15803d' : '#64748b',
                    mb: slipFile ? 0.5 : 0,
                    width: '100%'
                  }}
                >
                  {slipFile ? 'Screenshot ရွေးချယ်ပြီးပါပြီ' : 'Screenshot ရွေးချယ်ရန်'}
                </Typography>
                {slipFile && (
                  <Typography 
                    variant="caption" 
                    color="textSecondary" 
                    sx={{ 
                      display: 'block',
                      wordBreak: 'break-all',
                      maxWidth: '100%'
                    }}
                  >
                    {slipFile.name}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            disabled={loading}
            sx={{ 
              backgroundColor: '#2E7D32', 
              '&:hover': { backgroundColor: '#1B5E20' },
              py: 1.5,
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Order တင်မည်'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Badge, 
  Drawer, 
  Typography, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar,
  IconButton as MuiIconButton
} from '@mui/material';
import { ShoppingCart, X, Plus, Minus, Trash2, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';

export default function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    if (totalItems > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setIsOpen(open);
  };

  return (
    <>
      {/* Floating Cart Icon */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24, 
          zIndex: 1000 
        }}
      >
        <IconButton 
          onClick={toggleDrawer(true)}
          sx={{ 
            backgroundColor: '#2E7D32', 
            color: 'white', 
            width: 64, 
            height: 64, 
            boxShadow: '0 8px 32px rgba(46, 125, 50, 0.3)',
            '&:hover': { backgroundColor: '#1B5E20' },
            transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <Badge badgeContent={totalItems} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 700, fontSize: '0.75rem', minWidth: 20, height: 20 } }}>
            <ShoppingCart size={28} />
          </Badge>
        </IconButton>
      </Box>

      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, borderRadius: { xs: 0, sm: '24px 0 0 24px' } }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              Shopping Cart
            </Typography>
            <MuiIconButton onClick={toggleDrawer(false)}>
              <X size={24} />
            </MuiIconButton>
          </Box>

          {items.length === 0 ? (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <ShoppingCart size={64} className="mb-4 text-slate-300" />
              <Typography variant="h6">Your cart is empty</Typography>
              <Button onClick={toggleDrawer(false)} sx={{ mt: 2, textTransform: 'none' }}>Start Shopping</Button>
            </Box>
          ) : (
            <>
              <List sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                {items.map((item) => (
                  <ListItem 
                    key={item.id} 
                    disablePadding 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '16px',
                      border: '1px solid #f1f5f9'
                    }}
                  >
                    <ListItemAvatar sx={{ mr: 2 }}>
                      <Avatar 
                        src={item.image_url} 
                        variant="rounded" 
                        sx={{ width: 64, height: 64, borderRadius: '12px' }}
                      />
                    </ListItemAvatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, lineClamp: 1 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontWeight: 600 }}>
                        Ks {item.price.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', p: 0.5 }}>
                          <MuiIconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus size={14} />
                          </MuiIconButton>
                          <Typography variant="body2" sx={{ mx: 1.5, fontWeight: 700 }}>
                            {item.quantity}
                          </Typography>
                          <MuiIconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus size={14} />
                          </MuiIconButton>
                        </Box>
                        <MuiIconButton size="small" color="error" onClick={() => removeFromCart(item.id)}>
                          <Trash2 size={18} />
                        </MuiIconButton>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>

              <Box sx={{ pt: 3, borderTop: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Total</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0891b2' }}>
                    Ks {totalPrice.toLocaleString()}
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  onClick={() => {
                    setIsOpen(false);
                    setCheckoutOpen(true);
                  }}
                  sx={{ 
                    backgroundColor: '#2E7D32', 
                    '&:hover': { backgroundColor: '#1B5E20' },
                    py: 2,
                    borderRadius: '16px',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 24px rgba(46, 125, 50, 0.2)'
                  }}
                  endIcon={<ChevronRight />}
                >
                  Checkout
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}

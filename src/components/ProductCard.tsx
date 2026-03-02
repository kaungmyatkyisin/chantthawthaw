import { Card, CardMedia, CardContent, Typography, Box, Chip } from '@mui/material';
import { ShoppingBasket } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          '& .product-image': {
            transform: 'scale(1.08)',
          }
        }
      }}
    >
      <Box sx={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
        <CardMedia
          className="product-image"
          component="img"
          image={product.image_url || 'https://picsum.photos/seed/grocery/400/300'}
          alt={product.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        <Chip 
          label={product.category} 
          size="small" 
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12, 
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(4px)',
            fontWeight: 600,
            fontSize: '0.7rem'
          }} 
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Typography 
          variant="subtitle1" 
          component="h3" 
          sx={{ 
            fontWeight: 700, 
            lineHeight: 1.2, 
            mb: 0.5,
            height: '2.4em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {product.name}
        </Typography>
        {product.description && (
          <Typography 
            variant="body2" 
            color="textSecondary" 
            sx={{ 
              mb: 1.5,
              height: '3em',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontSize: '0.8rem',
              lineHeight: 1.4
            }}
          >
            {product.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800, color: '#2E7D32' }}>
            Ks {product.price.toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

import { Product } from '../types';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking the Add to Cart button
    if ((e.target as HTMLElement).closest('button')) return;
    navigate(`/product/${product.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 flex flex-col h-full group cursor-pointer"
    >
      {/* Top: Product Image */}
      <div className="relative pt-[100%] overflow-hidden bg-slate-50">
        <img 
          src={product.image_url || 'https://picsum.photos/seed/grocery/400/400'} 
          alt={product.name}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Middle: Product Info */}
      <div className="p-2 md:p-3 flex flex-col flex-grow">
        <h3 className="text-[10px] md:text-sm font-bold text-slate-800 line-clamp-2 leading-tight mb-1 h-8 md:h-10">
          {product.name}
        </h3>
        
        {/* Weight/Gram info in gray */}
        <p className="text-[8px] md:text-xs text-slate-400 mb-1 md:mb-2 line-clamp-1">
          {product.description || '500g'}
        </p>

        {/* Price in blue/cyan */}
        <div className="mt-auto flex flex-col gap-2">
          <p className="text-xs md:text-base font-extrabold text-cyan-600">
            Ks {product.price.toLocaleString()}
          </p>
          
          {/* Add to Cart Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (product.stock_quantity > 0) {
                addToCart(product);
              }
            }}
            disabled={product.stock_quantity <= 0}
            className={`w-full py-1.5 md:py-2 rounded-lg flex items-center justify-center gap-1 md:gap-2 transition-colors ${
              product.stock_quantity > 0 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={14} className="md:w-4 md:h-4" />
            <span className="text-[10px] md:text-xs font-bold">
              {product.stock_quantity > 0 ? 'Add to Cart' : 'ပစ္စည်းပြတ်သွားပါပြီ'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

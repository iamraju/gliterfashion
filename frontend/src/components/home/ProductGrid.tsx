import { Eye, Heart, ShoppingBasket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/currency';

const WishlistButton = ({ productId }: { productId: string }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const inWishlist = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    if (inWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transition-colors ${inWishlist ? 'text-red-500 hover:bg-gray-50' : 'hover:bg-accent hover:text-white'}`} 
      title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <Heart size={18} className={inWishlist ? "fill-current" : ""} />
    </button>
  );
};

// Simple interface for frontend display
interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice?: number | null;
  images: { imageUrl: string; isPrimary: boolean }[];
  category: { name: string };
}

interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  loading?: boolean;
  viewAllLink?: string;
}

const ProductGrid = ({ title, subtitle, products, loading = false, viewAllLink = '/products' }: ProductGridProps) => {
  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
           <div className="text-center mb-12">
             <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
             <div className="h-4 w-64 bg-gray-200 rounded mx-auto animate-pulse" />
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="space-y-4">
                 <div className="aspect-[3/4] bg-gray-200 rounded-xl animate-pulse" />
                 <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                 <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
               </div>
             ))}
           </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">{title}</h2>
            {subtitle && <p className="text-gray-500">{subtitle}</p>}
          </div>
          <Link to={viewAllLink} className="hidden md:flex items-center text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors">
            View All <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product) => {
            const primaryImage = product.images?.find(img => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl || "https://placehold.co/600x400?text=No+Photo";
            const secondImage = product.images?.[1]?.imageUrl || primaryImage;

            return (
              <div key={product.id} className="group relative">
                {/* Image Container */}
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative mb-4">
                   <Link to={`/product/${product.slug}`} className="block h-full w-full">
                     <img 
                       src={primaryImage} 
                       alt={product.name}
                       className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0"
                     />
                     <img 
                       src={secondImage} 
                       alt={product.name}
                       className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                     />
                   </Link>

                   {/* Badges */}
                   <div className="absolute top-3 left-3 flex flex-col gap-2">
                     {product.salePrice && (
                       <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded">
                         Sale
                       </span>
                     )}
                     {/* We can calculate 'New' based on date if needed, or pass it */}
                   </div>

                   <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <Link to={`/product/${product.slug}`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-black hover:text-white transition-colors" title="View Details">
                        <ShoppingBasket size={18} />
                      </Link>
                      <Link to={`/product/${product.slug}`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-black hover:text-white transition-colors" title="View Details">
                        <Eye size={18} />
                      </Link>
                      <WishlistButton productId={product.id} />
                   </div>
                </div>

                {/* Info */}
                <div>
                   <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
                   <Link to={`/product/${product.slug}`}>
                     <h3 className="font-bold text-gray-900 mb-1 hover:text-accent transition-colors">{product.name}</h3>
                   </Link>
                   <div className="flex items-center gap-2">
                     {product.salePrice ? (
                       <>
                         <span className="font-bold text-red-500">{formatCurrency(product.salePrice)}</span>
                         <span className="text-sm text-gray-400 line-through">{formatCurrency(product.basePrice)}</span>
                       </>
                     ) : (
                       <span className="font-bold text-gray-900">{formatCurrency(product.basePrice)}</span>
                     )}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
};

export default ProductGrid;

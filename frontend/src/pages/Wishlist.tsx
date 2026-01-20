import { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Heart } from 'lucide-react';
import PageBanner from '../components/common/PageBanner';
import { formatCurrency } from '../utils/currency';

const Wishlist = () => {
  const { items, loading, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleMoveToBag = async (item: any) => {
    if (item.product?.variants?.length > 0) {
       // Just add the first variant for now or redirect to product page
       // Better UX: redirect to product page if variants exist
       // But for "Move to Bag", let's try to add if single variant
       if (item.product.variants.length === 1) {
          await addItem(item.product.variants[0].id, 1);
          await removeFromWishlist(item.productId);
       } else {
         // Redirect
         window.location.href = `/product/${item.product.slug}`;
       }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="animate-pulse">Loading your wishlist...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageBanner 
        title="My Wishlist"
        subtitle="Save your favorite pieces for later."
        image="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop"
      />
      <div className="container mx-auto px-4 py-12">

        {items.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[48px]">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">Save items you love to buy later.</p>
            <Link to="/products" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-accent transition-colors">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item: any) => {
              const product = item.product;
              const image = product?.images?.find((i: any) => i.isPrimary)?.imageUrl || product?.images?.[0]?.imageUrl;
              
              return (
                <div key={item.id} className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                    <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <button 
                      onClick={() => removeFromWishlist(item.productId)}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-black hover:text-white transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{formatCurrency(product.basePrice)}</p>
                    
                    <button 
                      onClick={() => handleMoveToBag(item)}
                      className="w-full py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} />
                      {product.variants?.length > 1 ? 'Select Options' : 'Add to Bag'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;

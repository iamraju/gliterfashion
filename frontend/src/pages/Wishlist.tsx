import { useEffect } from 'react';
import ProfileLayout from '../components/profile/ProfileLayout';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Heart } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const Wishlist = () => {
  const { items, loading, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleMoveToBag = async (item: any) => {
    if (item.product?.variants?.length > 0) {
       if (item.product.variants.length === 1) {
          await addItem(item.product.variants[0].id, 1);
          toast.success('Added to Bag');
       } else {
         window.location.href = `/product/${item.product.slug}`;
       }
    }
  };

  const handleRemove = (productId: string) => {
    Swal.fire({
      title: 'Remove from Wishlist?',
      text: "Are you sure you want to remove this item?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromWishlist(productId);
      }
    });
  };

  if (loading) {
    return (
      <ProfileLayout breadcrumbs={[{ label: 'My Account', path: '/dashboard' }, { label: 'My Wishlist' }]}>
        <div className="flex justify-center items-center h-64">
           <p className="animate-pulse">Loading your wishlist...</p>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout breadcrumbs={[{ label: 'My Account', path: '/dashboard' }, { label: 'My Wishlist' }]}>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">My Wishlist</h1>
        <p className="text-gray-500">Save your favorite pieces for later.</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8">Save items you love to buy later.</p>
          <Link to="/products" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-accent transition-colors">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Product</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Price</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item: any) => {
                  const product = item.product;
                  const image = product?.images?.find((i: any) => i.isPrimary)?.imageUrl || product?.images?.[0]?.imageUrl;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <Link to={`/product/${product.slug}`} className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 block">
                            <img src={image} alt={product.name} className="w-full h-full object-cover" />
                          </Link>
                          <div>
                            <Link to={`/product/${product.slug}`} className="font-bold text-gray-900 hover:text-accent transition-colors line-clamp-1">{product.name}</Link>
                            <p className="text-xs text-gray-400 mt-1">{product.category?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-gray-900">
                        {formatCurrency(product.basePrice)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleRemove(item.productId)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleMoveToBag(item)}
                            className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                          >
                            <ShoppingBag size={14} />
                            {product.variants?.length > 1 ? 'Select' : 'Add'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
};

export default Wishlist;

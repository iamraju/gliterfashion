import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBasket, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import PageBanner from '../components/common/PageBanner';

const Cart = () => {
  const { cart, loading, updateQuantity, removeItem, initCart, applyCoupon, removeCoupon } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    initCart();
  }, [initCart]);

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((acc: number, item: any) => {
    const price = parseFloat(item.variant?.price || item.priceAtAdd);
    return acc + (price * item.quantity);
  }, 0);

  const appliedCoupon = cart?.appliedCoupon;
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      discount = (subtotal * Number(appliedCoupon.value)) / 100;
      // Apply max discount cap only if maxDiscountAmount > 0 (0 = no limit)
      if (appliedCoupon.maxDiscountAmount && Number(appliedCoupon.maxDiscountAmount) > 0 && discount > Number(appliedCoupon.maxDiscountAmount)) {
        discount = Number(appliedCoupon.maxDiscountAmount);
      }
    } else {
      // FIXED_AMOUNT type
      discount = Number(appliedCoupon.value);
    }
    // Ensure discount doesn't exceed subtotal
    if (discount > subtotal) discount = subtotal;
  }
  
  const total = subtotal - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setApplyingCoupon(true);
      await applyCoupon(couponCode);
      Swal.fire({
        title: 'Success!',
        text: 'Coupon applied successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        customClass: { popup: 'rounded-[32px]' }
      });
      setCouponCode('');
    } catch (error: any) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.error || error.message || 'Failed to apply coupon',
        icon: 'error',
        confirmButtonColor: '#000000',
        customClass: {
          popup: 'rounded-[32px]',
          confirmButton: 'rounded-xl font-bold px-8 py-3'
        }
      });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      Swal.fire({
        title: 'Removed!',
        text: 'Coupon removed',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        customClass: { popup: 'rounded-[32px]' }
      });
    } catch (error: any) {
      toast.error('Failed to remove coupon');
    }
  };

  const handleRemoveItem = async (itemId: string, productName: string) => {
    const result = await Swal.fire({
      title: 'Remove Item?',
      text: `Remove "${productName}" from your cart?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#71717a',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-[32px] overflow-hidden border-none shadow-2xl',
        confirmButton: 'rounded-xl font-bold px-8 py-3',
        cancelButton: 'rounded-xl font-bold px-8 py-3'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await removeItem(itemId);
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error('Failed to remove item');
    }
  };

  if (loading && !cart) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-accent mb-4" size={48} />
          <p className="text-gray-500 animate-pulse font-medium">Securing your selections...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageBanner 
        title="Shopping Bag"
        subtitle="Review your selected items and proceed to checkout."
        image="https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2064&auto=format&fit=crop"
      />
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="flex items-center gap-4 mb-8">
          <span className="bg-gray-100 text-gray-500 px-4 py-1 rounded-full text-sm font-bold">{cartItems.length} Items</span>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShoppingBasket className="text-gray-300" size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-4">Your bag is currently empty</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto">Discover our latest collections and find the perfect pieces for your wardrobe.</p>
            <Link to="/products" className="inline-block bg-black text-white px-10 py-4 rounded-2xl font-bold hover:bg-accent transition-all duration-300 shadow-xl hover:shadow-accent/20">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              {cartItems.map((item: any) => {
                const product = item.variant?.product;
                const primaryImage = product?.images?.find((img: any) => img.isPrimary)?.imageUrl || product?.images?.[0]?.imageUrl || "https://placehold.co/600x400?text=No+Photo";
                const price = parseFloat(item.variant?.price || item.priceAtAdd);
                const sizeAttribute = item.variant?.productVariantAttribute?.find((a: any) => a.attribute.name === 'Size');

                return (
                  <div key={item.id} className="group flex gap-6 p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-2xl hover:shadow-gray-100 transition-all duration-500 relative overflow-hidden">
                    <div className="w-32 h-44 bg-gray-100 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                      <img src={primaryImage} alt={product?.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1 block">{product?.category?.name}</span>
                            <Link to={`/product/${product?.slug}`} className="font-serif font-bold text-xl lg:text-2xl hover:text-accent transition-colors line-clamp-1">{product?.name}</Link>
                          </div>
                          <button 
                            onClick={() => handleRemoveItem(item.id, product?.name || 'this item')}
                            className="w-10 h-10 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center transition-all duration-300"
                            title="Remove from bag"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {sizeAttribute && (
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Size:</span>
                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-lg">{sizeAttribute.attributeValue.value}</span>
                          </div>
                        )}
                        <p className="font-bold text-xl">रु. {price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Subtotal</span>
                          <span className="font-bold text-lg">रु. {(price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-8 rounded-[32px] sticky top-24 border border-gray-100">
                <h3 className="text-2xl font-serif font-bold mb-8">Order Summary</h3>
                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Bag Subtotal</span>
                    <span className="font-bold text-gray-900">रु. {subtotal.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center text-accent">
                      <div className="flex flex-col">
                        <span className="font-medium">Discount ({appliedCoupon?.code})</span>
                        <button 
                          onClick={handleRemoveCoupon}
                          className="text-[10px] font-bold uppercase tracking-widest hover:underline text-left"
                        >
                          Remove
                        </button>
                      </div>
                      <span className="font-bold">- रु. {discount.toLocaleString()}</span>
                    </div>
                  )}

                  {!discount && (
                    <div className="pt-4">
                       <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Coupon Code"
                          className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-accent outline-none transition-all uppercase font-bold tracking-widest"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponCode.trim()}
                          className="px-6 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all disabled:opacity-50"
                        >
                          {applyingCoupon ? <Loader2 className="animate-spin" size={16} /> : 'Apply'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xl font-serif font-bold">Total</span>
                    <span className="text-2xl font-bold">रु. {total.toLocaleString()}</span>
                  </div>
                </div>
                <Link to="/checkout" className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-accent transition-all duration-300 shadow-xl hover:shadow-accent/20 flex items-center justify-center gap-3 group">
                  <span className="uppercase tracking-widest text-sm">Proceed to Checkout</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="mt-8 space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-[0.2em]">
                    Guaranteed Safe Checkout
                  </p>
                  <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder for payment icons */}
                    <div className="w-10 h-6 bg-gray-200 rounded" />
                    <div className="w-10 h-6 bg-gray-200 rounded" />
                    <div className="w-10 h-6 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;

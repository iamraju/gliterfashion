
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProfileLayout from '../../components/profile/ProfileLayout';
import { userApi } from '../../api/user';
import { Loader2, ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (id) {
          const data = await userApi.getOrderDetails(id);
          setOrder(data);
        }
      } catch (error) {
        console.error('Failed to fetch order details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-gray-300" size={40} />
        </div>
      </ProfileLayout>
    );
  }

  if (!order) {
    return (
      <ProfileLayout>
        <div className="text-center py-20">
          <p className="text-gray-500">Order not found.</p>
          <Link to="/profile/orders" className="text-black font-bold">Back to Orders</Link>
        </div>
      </ProfileLayout>
    );
  }

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: "Are you sure you want to cancel this order? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel Order',
      cancelButtonText: 'No, Keep It',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#71717a',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-[32px] font-sans',
        confirmButton: 'rounded-xl font-bold px-8 py-3',
        cancelButton: 'rounded-xl font-bold px-8 py-3'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await userApi.cancelOrder(order.id);

      await Swal.fire({
        title: 'Cancelled!',
        text: 'Your order has been successfully cancelled.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#ffffff',
        customClass: {
          popup: 'rounded-[32px] font-sans'
        }
      });

      const data = await userApi.getOrderDetails(order.id);
      setOrder(data);
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.error || 'Failed to cancel order',
        confirmButtonColor: '#000000',
        customClass: {
          popup: 'rounded-[32px] font-sans',
          confirmButton: 'rounded-xl font-bold px-8 py-3'
        }
      });
    }
  };

  return (
    <ProfileLayout>
      <div className="mb-12">
        <Link to="/profile/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-all text-xs font-bold uppercase tracking-widest mb-6">
          <ArrowLeft size={16} />
          Back to Orders
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Order {order.orderNumber}</h1>
            <p className="text-gray-500 font-medium">Placed on {format(new Date(order.createdAt), 'PPPP')}</p>
          </div>
          <div className="flex items-center gap-4">
             <span className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${order.status === 'CANCELLED' ? 'bg-red-500' : 'bg-black'} text-white`}>
                {order.status}
             </span>
             {order.status === 'PENDING' && (
               <button 
                 onClick={handleCancel}
                 className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100"
               >
                 Cancel Order
               </button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Package size={18} />
              Items in Order
            </h3>
            <div className="space-y-6">
              {order.orderItems.map((item: any) => (
                <div key={item.id} className="flex gap-6 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="w-20 h-24 bg-white rounded-xl border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    <img 
                      src={item.variant?.product?.images?.find((i: any) => i.isPrimary)?.imageUrl || item.variant?.product?.images?.[0]?.imageUrl || "https://placehold.co/600x400?text=No+Photo"} 
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{item.productName}</h4>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-2">Qty: {item.quantity}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900 border-b-2 border-accent/20">रु. {parseFloat(item.unitPrice).toLocaleString()}</span>
                      <span className="text-black font-bold">रु. {parseFloat(item.totalPrice).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Summary */}
          <div className="bg-black text-white rounded-[32px] p-8 shadow-2xl shadow-black/20">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-50">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm opacity-80">
                <span>Subtotal</span>
                <span>रु. {parseFloat(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm opacity-80">
                <span>Shipping</span>
                <span>रु. {parseFloat(order.shippingAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm opacity-80">
                <span>Tax (VAT 13%)</span>
                <span>रु. {parseFloat(order.taxAmount).toLocaleString()}</span>
              </div>
              {parseFloat(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Discount</span>
                  <span>- रु. {parseFloat(order.discountAmount).toLocaleString()}</span>
                </div>
              )}
              <div className="h-px bg-white/10 my-6" />
              <div className="flex justify-between items-end">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Total</p>
                    <p className="text-3xl font-serif font-bold italic">रु. {parseFloat(order.totalAmount).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100">
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                  <MapPin size={12} />
                  Shipping Address
                </h4>
                <div className="text-sm space-y-1">
                  <p className="font-bold">{order.shippingAddress.fullName}</p>
                  <p className="text-gray-500">{order.shippingAddress.addressLine1}</p>
                  <p className="text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p className="text-gray-500">{order.shippingAddress.phone}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                  <CreditCard size={12} />
                  Payment Method
                </h4>
                <p className="text-sm font-bold">{order.paymentMethod || 'Cash On Delivery'}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-accent">{order.paymentStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default OrderDetails;

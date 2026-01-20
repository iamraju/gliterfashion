
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfileLayout from '../../components/profile/ProfileLayout';
import { userApi } from '../../api/user';
import { Loader2, Package, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { formatCurrency } from '../../utils/currency';

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await userApi.getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const handleCancel = async (e: React.MouseEvent, orderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      await userApi.cancelOrder(orderId);
      
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

      // Refresh list
      const data = await userApi.getOrders();
      setOrders(data);
    } catch (error: any) {
      console.error('Failed to cancel order', error);
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

    <ProfileLayout breadcrumbs={[{ label: 'My Account', path: '/dashboard' }, { label: 'My Orders' }]}>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">My Orders</h1>
        <p className="text-gray-500">Track and manage your recent purchases.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-gray-300" size={40} />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
          <Link to="/" className="inline-block mt-4 text-black font-bold border-b-2 border-black pb-1 hover:text-accent hover:border-accent transition-all">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="relative group">
              <Link
                to={`/profile/orders/${order.id}`}
                className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-gray-100 rounded-[24px] hover:border-black transition-all hover:shadow-xl hover:shadow-black/5"
              >
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">
                      Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-left md:text-right mr-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    
                    {order.status === 'PENDING' && (
                      <button
                        onClick={(e) => handleCancel(e, order.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all text-xs font-bold uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    )}
                    
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all hidden md:block" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </ProfileLayout>
  );
};

export default Orders;

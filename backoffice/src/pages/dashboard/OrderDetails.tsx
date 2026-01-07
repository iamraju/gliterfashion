import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Printer, 
  Truck, 
  Package, 
  User, 
  MapPin, 
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { ordersApi, type Order, type OrderStatus } from '../../api/orders';

const statusConfig: Record<OrderStatus, { color: string; bg: string; icon: any }> = {
  PENDING: { color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  CONFIRMED: { color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle2 },
  PROCESSING: { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Package },
  SHIPPED: { color: 'text-purple-600', bg: 'bg-purple-50', icon: Truck },
  DELIVERED: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
  CANCELLED: { color: 'text-rose-600', bg: 'bg-rose-50', icon: XCircle },
  REFUNDED: { color: 'text-gray-600', bg: 'bg-gray-50', icon: AlertCircle },
};

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const data = await ordersApi.getById(id!);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: OrderStatus) => {
    try {
      setIsUpdating(true);
      await ordersApi.updateStatus(id!, status);
      await fetchOrder();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

  const currentStatus = statusConfig[order.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-white rounded-xl transition-all text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${currentStatus.bg} ${currentStatus.color}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {order.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </button>
          <div className="relative group">
            <button className="inline-flex items-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-dark transition-all shadow-lg shadow-brand-primary/20">
              Update Status
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {(Object.keys(statusConfig) as OrderStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  disabled={isUpdating || order.status === status}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors disabled:opacity-50"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="font-bold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-brand-primary" />
                Order Items
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order.orderItems?.map((item) => (
                <div key={item.id} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold shrink-0">
                    IMG
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      SKU: {item.id.slice(0, 8).toUpperCase()} | Qty: {item.quantity}
                    </p>
                    {item.variantDetails && (
                        <div className="flex flex-wrap gap-2 mt-2">
                             {Object.entries(item.variantDetails).map(([k, v]: any) => (
                                 <span key={k} className="px-2 py-0.5 bg-gray-100 rounded-md text-[10px] uppercase font-bold text-gray-600">
                                     {k}: {v}
                                 </span>
                             ))}
                        </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">रु. {Number(item.totalPrice).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">रु. {Number(item.unitPrice).toLocaleString()} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Summary */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-4">
             <div className="flex justify-between text-gray-600">
               <span>Subtotal</span>
               <span className="font-medium text-gray-900">रु. {Number(order.subtotal).toLocaleString()}</span>
             </div>
             <div className="flex justify-between text-gray-600">
               <span>Shipping Fee</span>
               <span className="font-medium text-gray-900">रु. {Number(order.shippingAmount).toLocaleString()}</span>
             </div>
             <div className="flex justify-between text-gray-600">
               <span>Tax (13% VAT)</span>
               <span className="font-medium text-gray-900">रु. {Number(order.taxAmount).toLocaleString()}</span>
             </div>
             <div className="flex justify-between text-rose-600">
               <span>Discount</span>
               <span className="font-medium">- रु. {Number(order.discountAmount).toLocaleString()}</span>
             </div>
             <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
               <span className="text-lg font-bold text-gray-900">Total</span>
               <span className="text-2xl font-black text-brand-primary">रु. {Number(order.totalAmount).toLocaleString()}</span>
             </div>
          </div>
        </div>

        {/* Right Column: Customer & Shipping Info */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 flex items-center mb-6">
              <User className="w-5 h-5 mr-2 text-brand-primary" />
              Customer
            </h2>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-4">
               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-primary font-bold shadow-sm">
                 {order.user?.firstName.charAt(0)}
               </div>
               <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{order.user?.firstName} {order.user?.lastName}</p>
                  <p className="text-xs text-gray-500 truncate">{order.user?.email}</p>
               </div>
            </div>
            <Link 
              to={`/customers/${order.userId}`}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gray-900 ml-0 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all"
            >
              View Profile
            </Link>
          </div>

          {/* Shipping Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 flex items-center mb-6">
              <MapPin className="w-5 h-5 mr-2 text-brand-primary" />
              Shipping Address
            </h2>
            {order.shippingAddress ? (
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            ) : (
                <p className="text-sm text-gray-400 italic">No shipping address provided</p>
            )}
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 flex items-center mb-6">
              <CreditCard className="w-5 h-5 mr-2 text-brand-primary" />
              Payment Info
            </h2>
            <div className="flex items-center justify-between mb-2">
               <span className="text-sm text-gray-500 uppercase tracking-wider font-bold">Method</span>
               <span className="text-sm font-bold text-gray-900 uppercase">{order.paymentMethod || 'COD'}</span>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-sm text-gray-500 uppercase tracking-wider font-bold">Status</span>
               <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                 order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
               }`}>
                 {order.paymentStatus}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

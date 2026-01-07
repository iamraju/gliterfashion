import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingBag,
  Shield,
  ArrowRight
} from 'lucide-react';
import { customersApi, type Customer } from '../../api/customers';
import { ordersApi, type Order } from '../../api/orders';

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setIsLoading(true);
      const [customerData, allOrders] = await Promise.all([
        customersApi.getById(id!),
        ordersApi.getAll()
      ]);
      setCustomer(customerData);
      // Filter orders for this customer since backend findAll might not expose a customer-only filter easily for superadmin
      // In a real app, backend should provide /customers/:id/orders
      setOrders(allOrders.filter(o => o.userId === id));
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading customer profile...</div>;
  if (!customer) return <div className="p-8 text-center text-red-500">Customer not found</div>;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/customers')}
            className="p-2 hover:bg-white rounded-xl transition-all text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.firstName} {customer.lastName}</h1>
            <p className="text-gray-500 text-sm mt-1 flex items-center">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Customer Profile
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
            Send Message
          </button>
          <button className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-xl border border-red-100 hover:bg-red-100 transition-all">
            Suspend Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stats & Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 bg-gradient-to-br from-brand-primary to-brand-secondary flex flex-col items-center">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white text-4xl font-black border border-white/30 shadow-2xl mb-4">
                {customer.firstName.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{customer.firstName} {customer.lastName}</h3>
              <p className="text-white/70 text-sm">{customer.email}</p>
            </div>
            
            <div className="p-6 space-y-6">
               <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center text-gray-500 text-sm">
                     <Calendar className="w-4 h-4 mr-2" />
                     Joined
                  </div>
                  <span className="font-bold text-gray-900">{new Date(customer.createdAt!).toLocaleDateString()}</span>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-brand-light rounded-2xl text-center">
                     <p className="text-[10px] uppercase font-black text-brand-primary/60 mb-1">Orders</p>
                     <p className="text-2xl font-black text-brand-primary">{orders.length}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl text-center">
                     <p className="text-[10px] uppercase font-black text-emerald-600/60 mb-1">Spent</p>
                     <p className="text-2xl font-black text-emerald-600">रु. {orders.reduce((sum, o) => sum + Number(o.totalAmount), 0).toLocaleString()}</p>
                  </div>
               </div>

               <div className="space-y-4 pt-4">
                  <h4 className="text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Contact Details</h4>
                  <div className="space-y-3">
                     <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                           <Mail className="w-4 h-4 text-gray-400" />
                        </div>
                        {customer.email}
                     </div>
                     <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                           <Phone className="w-4 h-4 text-gray-400" />
                        </div>
                        {customer.id.slice(0, 10)} {/* Mock phone or real if available */}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right: Order History */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 flex items-center uppercase tracking-wider text-sm">
                   <ShoppingBag className="w-5 h-5 mr-3 text-brand-primary" />
                   Recent Orders
                </h2>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                  {orders.length} Total
                </span>
             </div>
             
             {orders.length === 0 ? (
                <div className="p-12 text-center text-gray-400 italic">No orders history yet.</div>
             ) : (
                <div className="divide-y divide-gray-50">
                   {orders.map(order => (
                      <div key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                               <ShoppingBag className="w-6 h-6 text-gray-300" />
                            </div>
                            <div>
                               <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                               <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-8">
                            <div className="text-right">
                               <p className="font-bold text-gray-900">रु. {Number(order.totalAmount).toLocaleString()}</p>
                               <span className={`text-[10px] font-black uppercase ${
                                 order.status === 'DELIVERED' ? 'text-emerald-500' : 
                                 order.status === 'CANCELLED' ? 'text-rose-500' : 'text-amber-500'
                               }`}>
                                 {order.status}
                               </span>
                            </div>
                            <Link 
                               to={`/orders/${order.id}`}
                               className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-light rounded-xl transition-all"
                            >
                               <ArrowRight className="w-5 h-5" />
                            </Link>
                         </div>
                      </div>
                   ))}
                </div>
             )}
           </div>

           {/* More info sections could go here */}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;

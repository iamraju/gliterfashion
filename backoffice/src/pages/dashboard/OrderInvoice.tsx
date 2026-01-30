import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ordersApi, type Order } from '../../api/orders';

const OrderInvoice = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (id) {
          const data = await ordersApi.getById(id);
          setOrder(data);
        }
      } catch (error) {
        console.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (order) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [order]);

  if (loading) return <div className="p-8 text-center">Loading Invoice...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

  return (
    <div className="bg-white min-h-screen p-8 text-black font-sans max-w-4xl mx-auto" id="invoice">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tighter mb-2">GLITTER<span className="text-gray-400">.</span></h1>
          <p className="text-gray-500 text-sm">Kathmandu, Nepal<br />support@glitterfashion.com<br />+977 9812345678</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">INVOICE</h2>
          <p className="text-gray-500">#{order.orderNumber}</p>
          <p className="text-gray-500 text-sm mt-1">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Bill To</h3>
          <div className="text-sm font-medium">
             <p className="font-bold text-gray-900 text-lg mb-1">{order.user?.firstName} {order.user?.lastName || order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.addressLine1}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p>{order.shippingAddress?.phone}</p>
            <p>{order.user?.email || order.guestEmail}</p>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Payment Info</h3>
          <div className="text-sm">
            <p><span className="text-gray-500">Method:</span> <span className="font-bold">{order.paymentMethod || 'COD'}</span></p>
            <p><span className="text-gray-500">Status:</span> <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-gray-900'}`}>{order.paymentStatus}</span></p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Item</th>
              <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Quantity</th>
              <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Price</th>
              <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.orderItems?.map((item: any) => (
              <tr key={item.id}>
                <td className="py-4">
                  <p className="font-bold text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-500">SKU: {item.id.slice(0, 8).toUpperCase()}</p>
                </td>
                <td className="py-4 text-right">{item.quantity}</td>
                <td className="py-4 text-right">Rs. {Number(item.unitPrice).toLocaleString()}</td>
                <td className="py-4 text-right font-bold">Rs. {Number(item.totalPrice).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-bold">Rs. {Number(order.subtotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className="font-bold">Rs. {Number(order.shippingAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax (13%)</span>
            <span className="font-bold">Rs. {Number(order.taxAmount).toLocaleString()}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="text-gray-500">Discount</span>
              <span className="font-bold">- Rs. {Number(order.discountAmount).toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-xl">Rs. {Number(order.totalAmount).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 mt-20 pt-8 border-t border-gray-100">
        <p>Thank you for shopping with Glitter Fashion.</p>
        <p>For support, please contact support@glitterfashion.com</p>
      </div>

      <style>{`
        @media print {
          @page { margin: 0; }
          body { margin: 1.6cm; }
          .no-print { display: none; }
        }
      `}</style>
    </div>
  );
};

export default OrderInvoice;

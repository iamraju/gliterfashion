import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { useCartStore } from '../store/cartStore'; // Assuming this store exists
import { CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/store';

const EsewaSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eSewa returns: ?oid={orderId}&amt={amount}&refId={referenceId}
  // OR ?data={encodedString} in v2 (but we used v2 form, usually it returns encoded data or params depending on config)
  // Our seed config uses http://localhost:5173/checkout/esewa/success?q=su
  
  useEffect(() => {
    const separateVerify = async () => {
       const oid = searchParams.get('oid');
       const amt = searchParams.get('amt');
       const refId = searchParams.get('refId');
       const encodedData = searchParams.get('data');

       if (!oid && !encodedData) {
           setError('Invalid response from Payment Gateway');
           setVerifying(false);
           return;
       }

       try {
           // Call backend to verify
           await axios.post(`${API_URL}/orders/verify-payment`, {
               oid, amt, refId, encodedData,
               type: 'esewa'
           }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}` // If logged in
            }
           });
           
           // If verify success
           clearCart();
           // Redirect to order details
           // But just show success message for now
           setVerifying(false);
       } catch (err: any) {
           setError('Payment verification failed. Please contact support.');
           setVerifying(false);
       }
    };

    separateVerify();
  }, [searchParams, clearCart]);

  if (verifying) {
      return (
          <Layout>
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <h2 className="text-2xl font-bold mb-4">Verifying Payment...</h2>
                  <p className="text-gray-500">Please wait while we confirm your transaction.</p>
              </div>
          </Layout>
      );
  }

  if (error) {
      return (
          <Layout>
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
                  <p className="text-gray-600 mb-8">{error}</p>
                  <button onClick={() => navigate('/contact')} className="text-brand-primary underline">Contact Support</button>
              </div>
          </Layout>
      );
  }

  return (
      <Layout>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
              <h1 className="text-4xl font-serif font-bold mb-4">Payment Successful!</h1>
              <p className="text-gray-500 text-lg mb-8">Thank you for your purchase. Your order has been confirmed.</p>
              <div className="space-x-4">
                <button onClick={() => navigate('/profile/orders')} className="px-6 py-3 bg-black text-white rounded-xl font-bold">View My Orders</button>
                <button onClick={() => navigate('/')} className="px-6 py-3 border border-gray-300 rounded-xl font-bold">Continue Shopping</button>
              </div>
          </div>
      </Layout>
  );
};

export default EsewaSuccess;

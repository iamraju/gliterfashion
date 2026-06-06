import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/store';
import { CheckCircle, XCircle,Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useCartStore } from '../store/cartStore';

const PayPalSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your payment...');
    const [orderId, setOrderId] = useState<string | null>(null);
    const { clearCart } = useCartStore();

    useEffect(() => {
        const verifyPayment = async () => {
             const token = searchParams.get('token');
             if (!token) {
                 setStatus('error');
                 setMessage('No payment token found.');
                 return;
             }

             try {
                const response = await api.post('/checkout/paypal/capture', { token });
                if (response.data.status === 'COMPLETED') {
                     setStatus('success');
                     setMessage('Payment successful! Your order has been placed.');
                     setOrderId(response.data.orderId);
                     clearCart();
                } else {
                     setStatus('error');
                     setMessage('Payment not completed. Status: ' + response.data.status);
                }
             } catch (error: any) {
                 console.error('Payment Verification Error', error);
                 setStatus('error');
                 setMessage(error.response?.data?.message || 'Failed to verify payment.');
             }
        };

        verifyPayment();
    }, [searchParams, clearCart]);

    return (
        <Layout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 size={48} className="animate-spin text-accent" />
                            <h2 className="text-xl font-bold">Processing Payment</h2>
                            <p className="text-gray-500">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center gap-4">
                            <CheckCircle size={64} className="text-green-500" />
                            <h2 className="text-2xl font-bold font-serif">Order Confirmed!</h2>
                            <p className="text-gray-600">{message}</p>
                            {orderId && <p className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">Order ID: {orderId}</p>}
                            <div className="flex gap-3 mt-4">
                               <Link to="/profile/orders" className="btn btn-black">View Orders</Link>
                               <Link to="/" className="btn btn-outline">Continue Shopping</Link>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-4">
                            <XCircle size={64} className="text-red-500" />
                             <h2 className="text-2xl font-bold font-serif">Payment Failed</h2>
                             <p className="text-red-600">{message}</p>
                             <div className="flex gap-3 mt-4">
                                <button onClick={() => navigate('/checkout')} className="btn btn-black">Try Again</button>
                                <Link to="/contact" className="btn btn-outline">Contact Support</Link>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PayPalSuccess;

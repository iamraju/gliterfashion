import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';

const PayPalCancel = () => {
    return (
        <Layout>
             <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="flex flex-col items-center gap-4">
                        <XCircle size={64} className="text-yellow-500" />
                        <h2 className="text-2xl font-bold font-serif">Payment Cancelled</h2>
                        <p className="text-gray-600">You have cancelled the PayPal payment process. No charges have been made.</p>
                        
                        <div className="flex gap-3 mt-6 justify-center w-full">
                            <Link to="/checkout" className="btn btn-black flex items-center gap-2 justify-center flex-1">
                                <ArrowLeft size={16} />
                                Return to Checkout
                            </Link>
                            <Link to="/cart" className="btn btn-outline flex-1">
                                View Cart
                            </Link>
                        </div>
                    </div>
                </div>
             </div>
        </Layout>
    );
};

export default PayPalCancel;

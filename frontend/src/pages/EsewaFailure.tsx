import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { XCircle } from 'lucide-react';

const EsewaFailure: React.FC = () => {
  const navigate = useNavigate();

  return (
      <Layout>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <XCircle className="w-20 h-20 text-red-500 mb-6" />
              <h1 className="text-4xl font-serif font-bold mb-4">Payment Failed</h1>
              <p className="text-gray-500 text-lg mb-8">Your transaction could not be completed. You can try again or choose a different payment method.</p>
               <div className="space-x-4">
                <button onClick={() => navigate('/checkout')} className="px-6 py-3 bg-black text-white rounded-xl font-bold">Try Again</button>
                <button onClick={() => navigate('/cart')} className="px-6 py-3 border border-gray-300 rounded-xl font-bold">Return to Cart</button>
              </div>
          </div>
      </Layout>
  );
};

export default EsewaFailure;

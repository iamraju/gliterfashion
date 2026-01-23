import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/store') + '/auth/verify-email';
        await axios.get(`${API_URL}?token=${token}`);
        setStatus('success');
        setMessage('Your email has been successfully verified.');
        toast.success('Email verified!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
       <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full text-center">
          {status === 'loading' && (
            <>
              <Loader2 size={48} className="mx-auto text-brand-primary animate-spin mb-4" />
              <h2 className="text-2xl font-bold font-serif mb-2">Verifying...</h2>
              <p className="text-gray-500">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold font-serif mb-4">Email Verified!</h2>
              <p className="text-gray-500 mb-8">{message}</p>
              <Link to="/auth/login" className="block w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-accent transition-colors">
                Sign In Now
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={32} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold font-serif mb-4">Verification Failed</h2>
              <p className="text-gray-500 mb-8">{message}</p>
              <Link to="/auth/login" className="block w-full bg-gray-100 text-gray-900 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                Back to Login
              </Link>
            </>
          )}
       </div>
    </div>
  );
};

export default VerifyEmail;

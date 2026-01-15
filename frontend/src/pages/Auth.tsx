
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, loading } = useAuthStore();
  const { totalItems } = useCartStore();

  // Login State
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<{ [key: string]: string }>({});

  // Register State
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [registerErrors, setRegisterErrors] = useState<{ [key: string]: string }>({});

  // Login Validation
  const validateLoginForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!loginData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) newErrors.email = 'Invalid email address';
    
    if (!loginData.password) newErrors.password = 'Password is required';
    else if (loginData.password.length < 6) newErrors.password = 'Must be at least 6 characters';

    setLoginErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Register Validation
  const validateRegisterForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!registerData.firstName) newErrors.firstName = 'First name is required';
    if (!registerData.lastName) newErrors.lastName = 'Last name is required';
    if (!registerData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(registerData.email)) newErrors.email = 'Invalid email address';
    if (!registerData.password) newErrors.password = 'Password is required';
    else if (registerData.password.length < 6) newErrors.password = 'Must be at least 6 characters';
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setRegisterErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    if (!validateLoginForm()) return;

    try {
      await login(loginData);
      if (totalItems > 0) {
        navigate('/checkout');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      if (message.toLowerCase().includes('email')) {
        setLoginErrors({ email: message });
      } else if (message.toLowerCase().includes('password')) {
        setLoginErrors({ password: message });
      } else {
        setLoginErrors({ form: message });
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterErrors({});
    if (!validateRegisterForm()) return;

    try {
      await register(registerData);
      if (totalItems > 0) {
        navigate('/checkout');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      if (message.toLowerCase().includes('email')) {
        setRegisterErrors({ email: message });
      } else {
        setRegisterErrors({ form: message });
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start max-w-7xl mx-auto">
          
          {/* Login Section */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-serif font-bold mb-3">Welcome Back</h2>
              <p className="text-gray-500">Sign in to your account</p>
            </div>

            <div className="bg-white p-8 lg:p-12 rounded-[48px] shadow-2xl shadow-gray-100 border border-gray-50">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {loginErrors.form && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-medium border border-red-100 italic">
                    {loginErrors.form}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 ${loginErrors.email ? 'text-red-400' : 'text-gray-400'}`} size={20} />
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => {
                        setLoginData({ ...loginData, email: e.target.value });
                        if (loginErrors.email) setLoginErrors({ ...loginErrors, email: '' });
                      }}
                      className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-14 pr-5 focus:ring-2 focus:ring-accent transition-all outline-none font-medium ${
                        loginErrors.email ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                      }`}
                      placeholder="email@example.com"
                    />
                  </div>
                  {loginErrors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-5">{loginErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
                  <div className="relative">
                    <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 ${loginErrors.password ? 'text-red-400' : 'text-gray-400'}`} size={20} />
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => {
                        setLoginData({ ...loginData, password: e.target.value });
                        if (loginErrors.password) setLoginErrors({ ...loginErrors, password: '' });
                      }}
                      className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-14 pr-5 focus:ring-2 focus:ring-accent transition-all outline-none font-medium ${
                        loginErrors.password ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {loginErrors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-5">{loginErrors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-accent transition-all duration-300 shadow-xl hover:shadow-accent/20 flex items-center justify-center gap-3 group mt-4"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Register Section */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-serif font-bold mb-3">Join Glitter</h2>
              <p className="text-gray-500">Create your account to start shopping</p>
            </div>

            <div className="bg-white p-8 lg:p-12 rounded-[48px] shadow-2xl shadow-gray-100 border border-gray-50">
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                {registerErrors.form && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-medium border border-red-100 italic">
                    {registerErrors.form}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                    <div className="relative">
                      <User className={`absolute left-5 top-1/2 -translate-y-1/2 ${registerErrors.firstName ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                      <input
                        type="text"
                        value={registerData.firstName}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, firstName: e.target.value });
                          if (registerErrors.firstName) setRegisterErrors({ ...registerErrors, firstName: '' });
                        }}
                        className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-accent transition-all outline-none font-medium text-sm ${
                          registerErrors.firstName ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                        }`}
                        placeholder="John"
                      />
                    </div>
                    {registerErrors.firstName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-5">{registerErrors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                    <div className="relative">
                      <User className={`absolute left-5 top-1/2 -translate-y-1/2 ${registerErrors.lastName ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                      <input
                        type="text"
                        value={registerData.lastName}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, lastName: e.target.value });
                          if (registerErrors.lastName) setRegisterErrors({ ...registerErrors, lastName: '' });
                        }}
                        className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-accent transition-all outline-none font-medium text-sm ${
                          registerErrors.lastName ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                        }`}
                        placeholder="Doe"
                      />
                    </div>
                    {registerErrors.lastName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-5">{registerErrors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 ${registerErrors.email ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, email: e.target.value });
                        if (registerErrors.email) setRegisterErrors({ ...registerErrors, email: '' });
                      }}
                      className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-accent transition-all outline-none font-medium text-sm ${
                        registerErrors.email ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                      }`}
                      placeholder="name@example.com"
                    />
                  </div>
                  {registerErrors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-5">{registerErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
                  <div className="relative">
                    <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 ${registerErrors.password ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                    <input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, password: e.target.value });
                        if (registerErrors.password) setRegisterErrors({ ...registerErrors, password: '' });
                      }}
                      className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-accent transition-all outline-none font-medium text-sm ${
                        registerErrors.password ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {registerErrors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-5">{registerErrors.password}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 ${registerErrors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                    <input
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, confirmPassword: e.target.value });
                        if (registerErrors.confirmPassword) setRegisterErrors({ ...registerErrors, confirmPassword: '' });
                      }}
                      className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-accent transition-all outline-none font-medium text-sm ${
                        registerErrors.confirmPassword ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {registerErrors.confirmPassword && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-5">{registerErrors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-accent transition-all duration-300 shadow-xl hover:shadow-accent/20 flex items-center justify-center gap-3 group mt-4"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Auth;

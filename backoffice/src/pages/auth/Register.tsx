import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, Loader2, AlertCircle, Building2, MapPin, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';

const countries = [
  { id: 'NP', name: 'Nepal' },
  { id: 'IN', name: 'India' },
  { id: 'US', name: 'United States' },
  { id: 'GB', name: 'United Kingdom' },
  { id: 'AU', name: 'Australia' },
];

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  companyName: z.string().min(1, 'Company name is required'),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  terms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register: registerAuth, isAuthenticated, isLoading: authLoading } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      streetAddress: '',
      city: '',
      state: '',
      country: 'NP',
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Hardcode role as SELLER as per requirements
      await registerAuth({
        ...data,
        role: 'SELLER',
      });
      navigate('/');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 lg:p-12 rounded-3xl shadow-xl border border-gray-100 transition-all">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Seller Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the Glitter Fashion community and start selling today
          </p>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{apiError}</p>
          </div>
        )}

        <form className="mt-8 space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Section: Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('firstName')}
                placeholder="First Name"
                icon={User}
                error={errors.firstName?.message}
              />
              <Input
                {...register('lastName')}
                placeholder="Last Name"
                icon={User}
                error={errors.lastName?.message}
              />
            </div>
            <Input
              {...register('email')}
              type="email"
              placeholder="Email address"
              icon={Mail}
              error={errors.email?.message}
              autoComplete="email"
            />
          </div>

          {/* Section: Company Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Company Details</h3>
            <Input
              {...register('companyName')}
              placeholder="Company Name"
              icon={Building2}
              error={errors.companyName?.message}
            />
          </div>

          {/* Section: Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Location (Optional)</h3>
            <Input
              {...register('streetAddress')}
              placeholder="Street Address"
              icon={MapPin}
              error={errors.streetAddress?.message}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('city')}
                placeholder="City"
                icon={MapPin}
                error={errors.city?.message}
              />
              <Input
                {...register('state')}
                placeholder="State / Province"
                icon={MapPin}
                error={errors.state?.message}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 ml-1">
                Country
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Globe className="h-5 w-5" />
                </div>
                <select
                  {...register('country')}
                  className="appearance-none block w-full pl-11 pr-10 py-3 border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm bg-white hover:border-gray-400"
                >
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Password */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                icon={Lock}
                error={errors.password?.message}
                autoComplete="new-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                }
              />
              <Input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                icon={Lock}
                error={errors.confirmPassword?.message}
              />
            </div>
          </div>

          {/* Terms and Submit */}
          <div className="space-y-6 pt-4">
            <div className="space-y-1">
              <div className="flex items-start">
                <input
                  {...register('terms')}
                  id="terms"
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer mt-0.5"
                />
                <label htmlFor="terms" className="ml-3 block text-sm text-gray-700 cursor-pointer italic">
                  I agree to the <span className="text-blue-600 hover:underline font-semibold">Terms of Service</span> and <span className="text-blue-600 hover:underline font-semibold">Privacy Policy</span>
                </label>
              </div>
              {errors.terms && (
                <p className="text-xs text-red-600 ml-1">{errors.terms.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-3" />
                  Processing...
                </span>
              ) : (
                'Complete Registration'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/auth/login" className="font-bold text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline transition-all">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

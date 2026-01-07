import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building2, MapPin, Globe, Loader2, AlertCircle, CheckCircle2, Save, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users';
import Input from '../../components/ui/Input';

const countries = [
  { id: 'NP', name: 'Nepal' },
  { id: 'IN', name: 'India' },
  { id: 'US', name: 'United States' },
  { id: 'GB', name: 'United Kingdom' },
  { id: 'AU', name: 'Australia' },
];

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  companyName: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

const UpdateProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, updateUserData } = useAuth();

  const isSeller = user?.role === 'SELLER';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      companyName: user?.companyName || '',
      streetAddress: user?.streetAddress || '',
      city: user?.city || '',
      state: user?.state || '',
      country: user?.country || 'NP',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyName: user.companyName,
        streetAddress: user.streetAddress,
        city: user.city,
        state: user.state,
        country: user.country || 'NP',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateProfileFormValues) => {
    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);
    try {
      // Clean up data based on role
      const payload = { ...data };
      if (!isSeller) {
        delete payload.companyName;
        delete payload.streetAddress;
        delete payload.city;
        delete payload.state;
        delete payload.country;
      }

      const updatedUser = await usersApi.updateMe(payload);
      updateUserData(updatedUser);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
        <div className="px-8 py-10 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <h2 className="text-3xl font-bold">Update Profile</h2>
          <p className="text-blue-100 mt-2">Update your personal and account details</p>
        </div>

        <div className="p-8 lg:p-12">
          {apiError && (
            <div className="mb-8 bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <p className="font-semibold">{apiError}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-8 bg-green-50 border border-green-100 text-green-600 px-6 py-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
              <p className="font-semibold">{successMessage}</p>
            </div>
          )}

          <form className="space-y-10" onSubmit={handleSubmit(onSubmit)}>
            {/* Account Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-gray-900">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold">Account Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  {...register('firstName')}
                  label="First Name"
                  placeholder="First Name"
                  icon={User}
                  error={errors.firstName?.message}
                />
                <Input
                  {...register('lastName')}
                  label="Last Name"
                  placeholder="Last Name"
                  icon={User}
                  error={errors.lastName?.message}
                />
              </div>
              <Input
                {...register('email')}
                label="Email Address"
                type="email"
                placeholder="Email address"
                icon={Mail}
                error={errors.email?.message}
                autoComplete="email"
              />
            </div>

            {/* Seller Details (only if seller) */}
            {isSeller && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-gray-900">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold">Company Details</h3>
                </div>
                <Input
                  {...register('companyName')}
                  label="Company Name"
                  placeholder="Company Name"
                  icon={Building2}
                  error={errors.companyName?.message}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    {...register('streetAddress')}
                    label="Street Address"
                    placeholder="Street Address"
                    icon={MapPin}
                    error={errors.streetAddress?.message}
                  />
                  <Input
                    {...register('city')}
                    label="City"
                    placeholder="City"
                    icon={MapPin}
                    error={errors.city?.message}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    {...register('state')}
                    label="State / Province"
                    placeholder="State / Province"
                    icon={MapPin}
                    error={errors.state?.message}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 ml-1">
                      Country
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Globe className="h-5 w-5" />
                      </div>
                      <select
                        {...register('country')}
                        className="appearance-none block w-full pl-12 pr-10 py-3.5 border border-gray-300 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all sm:text-sm bg-white hover:border-gray-400 font-medium"
                      >
                        {countries.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto min-w-[200px] py-4 px-8 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;

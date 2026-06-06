import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Save, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usersApi } from '../../api/users';
import Input from '../../components/ui/Input';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const ChangePassword: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);
    try {
      await usersApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccessMessage('Password changed successfully!');
      reset();
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Password change failed. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-10 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Change Password</h2>
              <p className="text-gray-400 text-sm mt-1">Ensure your account is using a long, random password to stay secure.</p>
            </div>
          </div>
        </div>

        <div className="p-8 lg:p-10">
          {apiError && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <p className="font-semibold">{apiError}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-100 text-green-600 px-6 py-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
              <p className="font-semibold">{successMessage}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register('currentPassword')}
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Enter current password"
              icon={Lock}
              error={errors.currentPassword?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="p-1.5 focus:outline-none hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              }
            />

            <div className="h-px bg-gray-100 my-4" />

            <Input
              {...register('newPassword')}
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              icon={Lock}
              error={errors.newPassword?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="p-1.5 focus:outline-none hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              }
            />

            <Input
              {...register('confirmPassword')}
              label="Confirm New Password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              icon={Lock}
              error={errors.confirmPassword?.message}
            />

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-8 text-lg font-bold text-white bg-gray-900 hover:bg-black rounded-2xl shadow-xl shadow-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Change Password</span>
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

export default ChangePassword;

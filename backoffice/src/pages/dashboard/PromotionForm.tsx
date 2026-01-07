import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Percent,
  CircleDollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { couponsApi } from '../../api/coupons';
import Input from '../../components/ui/Input';

const promotionSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.coerce.number().min(0, 'Value must be positive'),
  minOrderAmount: z.coerce.number().min(0).default(0),
  maxDiscountAmount: z.coerce.number().min(0).default(0),
  usageLimit: z.coerce.number().int().min(0).default(0),
  startsAt: z.string().min(1, 'Start date is required'),
  expiresAt: z.string().min(1, 'Expiry date is required'),
  isActive: z.boolean(),
  categoryIds: z.array(z.string()).default([]),
  productIds: z.array(z.string()).default([]),
}).refine((data) => {
    return new Date(data.startsAt) < new Date(data.expiresAt);
}, {
    message: "Start date must be before expiration date",
    path: ["startsAt"]
});

interface PromotionFormValues {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  categoryIds: string[];
  productIds: string[];
}

const PromotionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema) as any,
    defaultValues: {
      type: 'PERCENTAGE',
      value: 0,
      isActive: true,
      startsAt: new Date().toISOString().split('T')[0] + 'T00:00',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T23:59',
      categoryIds: [],
      productIds: [],
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      usageLimit: 0,
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    const loadInitialData = async () => {
        try {
            const [catsData, prodsData] = await Promise.all([
                import('../../api/categories').then(m => m.categoriesApi.getAll()),
                import('../../api/products').then(m => m.productsApi.getAll())
            ]);
            setCategories(catsData);
            setProducts(prodsData);
        } catch (err) {
            console.error('Failed to load selection data', err);
        }
    };
    loadInitialData();

    if (isEditMode && id) {
      const loadCoupon = async () => {
        setIsLoading(true);
        try {
          const coupon = await couponsApi.getById(id);
          setValue('code', coupon.code);
          setValue('type', coupon.type);
          setValue('value', Number(coupon.value));
          setValue('minOrderAmount', coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0);
          setValue('maxDiscountAmount', coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : 0);
          setValue('usageLimit', coupon.usageLimit || 0);
          setValue('isActive', coupon.isActive);
          
          // Format dates for datetime-local input
          setValue('startsAt', new Date(coupon.startsAt).toISOString().slice(0, 16));
          setValue('expiresAt', new Date(coupon.expiresAt).toISOString().slice(0, 16));
          setValue('categoryIds', coupon.categories?.map((c: any) => c.id) || []);
          setValue('productIds', coupon.products?.map((p: any) => p.id) || []);
        } catch (err) {
          setError('Failed to load promotion details');
        } finally {
          setIsLoading(false);
        }
      };
      loadCoupon();
    }
  }, [id, isEditMode, setValue]);

  const onSubmit = async (data: PromotionFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // API expects ISO datetime with Z or offset
      const payload: any = {
          ...data,
          startsAt: new Date(data.startsAt).toISOString(),
          expiresAt: new Date(data.expiresAt).toISOString(),
      };

      if (isEditMode && id) {
        await couponsApi.update(id, payload);
      } else {
        await couponsApi.create(payload as any);
      }
      navigate('/promotions');
    } catch (err: any) {
      if (err.response?.data?.details) {
          const detailMsgs = err.response.data.details.map((d: any) => `${d.path}: ${d.message}`).join(', ');
          setError(`Validation Error: ${detailMsgs}`);
      } else if (err.response?.data?.error) {
          setError(typeof err.response.data.error === 'string' ? err.response.data.error : JSON.stringify(err.response.data.error));
      } else {
          setError(err.response?.data?.message || 'Failed to save promotion');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/promotions" className="p-2 hover:bg-white rounded-xl text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Promotion' : 'Create Promotion'}
            </h1>
            <p className="text-sm text-gray-500">
              Set up your discount codes and rules
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="inline-flex items-center px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 active:scale-95 disabled:opacity-70 disabled:grayscale"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {isSubmitting ? 'Saving...' : 'Save Promotion'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-700 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Basic Details</h3>
            
            <div className="space-y-4">
                <Input
                    {...register('code')}
                    label="Coupon Code"
                    placeholder="e.g. SUMMER2024"
                    error={errors.code?.message}
                    className="font-mono"
                />

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 ml-1">
                            Discount Type
                        </label>
                        <select
                            {...register('type')}
                            className="appearance-none block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all sm:text-sm bg-white hover:border-gray-400"
                        >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED_AMOUNT">Fixed Amount (रु.)</option>
                        </select>
                    </div>
                    <Input
                        type="number"
                        {...register('value', { valueAsNumber: true })}
                        label={selectedType === 'PERCENTAGE' ? 'Discount Percentage' : 'Discount Amount'}
                        placeholder="0"
                        error={errors.value?.message}
                        icon={selectedType === 'PERCENTAGE' ? Percent : CircleDollarSign}
                    />
                </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Restrictions & Limits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    type="number"
                    {...register('minOrderAmount', { valueAsNumber: true })}
                    label="Min Order Amount (रु.)"
                    placeholder="Optional"
                    error={errors.minOrderAmount?.message}
                />
                <Input
                    type="number"
                    {...register('maxDiscountAmount', { valueAsNumber: true })}
                    label="Max Discount (रु.)"
                    placeholder="Optional"
                    error={errors.maxDiscountAmount?.message}
                    disabled={selectedType === 'FIXED_AMOUNT'}
                />
                <Input
                    type="number"
                    {...register('usageLimit', { valueAsNumber: true })}
                    label="Global Usage Limit"
                    placeholder="Unlimited"
                    error={errors.usageLimit?.message}
                />
                 <div className="flex flex-col justify-end pb-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-brand-primary/30 transition-all">
                        <input
                            type="checkbox"
                            {...register('isActive')}
                            className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary transition-all"
                        />
                        <span className="text-sm font-bold text-gray-700 italic">Active Promotion</span>
                    </label>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 ml-1">
                        Restrict to Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                    const current = watch('categoryIds') || [];
                                    const next = current.includes(cat.id) 
                                        ? current.filter(id => id !== cat.id)
                                        : [...current, cat.id];
                                    setValue('categoryIds', next);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    (watch('categoryIds') || []).includes(cat.id)
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-brand-primary/30'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                        {categories.length === 0 && <p className="text-xs text-gray-400 italic">No categories found</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 ml-1">
                        Restrict to Products
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {products.map(prod => (
                            <button
                                key={prod.id}
                                type="button"
                                onClick={() => {
                                    const current = watch('productIds') || [];
                                    const next = current.includes(prod.id) 
                                        ? current.filter(id => id !== prod.id)
                                        : [...current, prod.id];
                                    setValue('productIds', next);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    (watch('productIds') || []).includes(prod.id)
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-brand-primary/30'
                                }`}
                            >
                                {prod.name}
                            </button>
                        ))}
                        {products.length === 0 && <p className="text-xs text-gray-400 italic">No products found</p>}
                    </div>
                </div>
            </div>
        </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-brand-primary" />
                Schedule
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 ml-1">
                  Starts At
                </label>
                <input
                    type="datetime-local"
                    {...register('startsAt')}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all sm:text-sm bg-white"
                />
                {errors.startsAt && (
                   <p className="text-xs text-red-600 ml-1 font-medium italic">{errors.startsAt.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 ml-1">
                  Expires At
                </label>
                <input
                    type="datetime-local"
                    {...register('expiresAt')}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all sm:text-sm bg-white"
                />
                {errors.expiresAt && (
                   <p className="text-xs text-red-600 ml-1 font-medium italic">{errors.expiresAt.message}</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-orange-600 tracking-wider mb-1">Notice</p>
                <p className="text-xs text-orange-700 leading-relaxed font-medium italic">
                    All times are in your local time zone. The promotion will automatically activate and expire at these times.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionForm;

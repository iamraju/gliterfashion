import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { settingsApi } from '../../../api/settings';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ShippingMethodFormData {
  title: string;
  charge: string;
  deliveryTimeDays: string;
  deliveryTimeHours: string;
  isActive: boolean;
  description: string;
  image?: FileList;
}

const ShippingMethodForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ShippingMethodFormData>({
    defaultValues: {
      title: '',
      charge: '0',
      deliveryTimeDays: '1',
      deliveryTimeHours: '0',
      isActive: true,
      description: ''
    }
  });

  const imageWatcher = watch('image');

  useEffect(() => {
    if (imageWatcher && imageWatcher.length > 0) {
      const file = imageWatcher[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageWatcher]);

  useEffect(() => {
    if (id) {
      loadMethod(id);
    }
  }, [id]);

  const loadMethod = async (methodId: string) => {
    try {
      const data = await settingsApi.getShippingMethodById(methodId);
      reset({
        title: data.title,
        charge: data.charge.toString(),
        deliveryTimeDays: data.deliveryTimeDays.toString(),
        deliveryTimeHours: (data.deliveryTimeHours || 0).toString(),
        isActive: data.isActive,
        description: data.description || ''
      });
      if (data.imageUrl) {
        setPreviewUrl(`${import.meta.env.VITE_API_URL}/uploads/${data.imageUrl}`);
      }
    } catch (error) {
      console.error('Failed to load shipping method');
      navigate('/settings/shipping-methods');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ShippingMethodFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('charge', data.charge);
      formData.append('deliveryTimeDays', data.deliveryTimeDays);
      formData.append('deliveryTimeHours', data.deliveryTimeHours);
      formData.append('isActive', data.isActive.toString());
      formData.append('description', data.description);
      
      if (data.image?.[0]) {
        formData.append('image', data.image[0]);
      }

      if (id) {
        await settingsApi.updateShippingMethod(id, formData);
      } else {
        await settingsApi.createShippingMethod(formData);
      }
      navigate('/settings/shipping-methods');
    } catch (error) {
      console.error('Failed to save shipping method', error);
      alert('Failed to save shipping method.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/settings/shipping-methods" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Shipping Method' : 'New Shipping Method'}</h1>
          <p className="text-gray-500">Configure delivery options</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input 
            {...register('title', { required: 'Title is required' })}
            type="text"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
            placeholder="e.g. Standard Delivery, Express Shipping"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Charge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Charge (रु.)</label>
            <input 
              {...register('charge')}
              type="number"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 self-end h-[42px]">
            <input 
              {...register('isActive')}
              type="checkbox"
              id="isActive"
              className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black/20"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Status</label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Delivery Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (Days) *</label>
            <input 
              {...register('deliveryTimeDays', { required: 'Required' })}
              type="number"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
            />
          </div>

          {/* Delivery Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (Hours)</label>
            <input 
              {...register('deliveryTimeHours')}
              type="number"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            {...register('description')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
            placeholder="Details about this shipping method..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Badge/Image</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
               {previewUrl ? (
                 <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <Upload className="text-gray-400" size={24} />
               )}
            </div>
            <input 
              {...register('image')}
              type="file"
              accept="image/*"
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link to="/settings/shipping-methods" className="px-6 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-900 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {id ? 'Update Shipping' : 'Create Shipping'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ShippingMethodForm;

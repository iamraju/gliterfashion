import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { brandsApi } from '../../api/brands';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const brandSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
});

type BrandFormData = z.infer<typeof brandSchema>;

const BrandForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      description: '',
      logoUrl: '',
      isActive: true
    }
  });

  useEffect(() => {
    if (id) {
      loadBrand(id);
    }
  }, [id]);

  const loadBrand = async (brandId: string) => {
    try {
      const data = await brandsApi.getById(brandId);
      reset({
        name: data.name,
        description: data.description || '',
        logoUrl: data.logoUrl || '',
        isActive: data.isActive
      });
    } catch (error) {
      console.error('Failed to load brand');
      navigate('/brands');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: BrandFormData) => {
    setLoading(true);
    try {
      if (id) {
        await brandsApi.update(id, data);
      } else {
        await brandsApi.create(data);
      }
      navigate('/brands');
    } catch (error) {
      console.error('Failed to save brand', error);
      alert('Failed to save brand. Please check if the name is unique.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-gray-500">Loading brand details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/brands" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Brand' : 'New Brand'}</h1>
          <p className="text-gray-500">
            {id ? 'Update brand details' : 'Create a new brand'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
          <input 
            {...register('name')}
            type="text"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
            placeholder="e.g. Nike, Adidas, My Private Label"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            {...register('description')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
            placeholder="Brief description of the brand..."
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
          <input 
            {...register('logoUrl')}
            type="text"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
            placeholder="https://..."
          />
          {errors.logoUrl && <p className="text-red-500 text-xs mt-1">{errors.logoUrl.message}</p>}
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 pt-2">
           <input 
             {...register('isActive')}
             type="checkbox"
             id="isActive"
             className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black/20"
           />
           <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Status</label>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link to="/brands" className="px-6 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-900 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {id ? 'Update Brand' : 'Create Brand'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default BrandForm;

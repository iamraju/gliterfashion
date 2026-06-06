import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { bannersApi } from '../../api/banners';
import { ChevronLeft, Save, Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const BannerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    link: '',
    buttonText: 'Shop Now',
    align: 'left' as 'left' | 'center' | 'right',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      bannersApi.getById(id!)
        .then(data => {
            setFormData({
                title: data.title,
                subtitle: data.subtitle || '',
                imageUrl: data.imageUrl,
                link: data.link || '',
                buttonText: data.buttonText || 'Shop Now',
                align: data.align || 'left',
                isActive: data.isActive,
                sortOrder: data.sortOrder || 0
            });
            if (data.imageUrl) {
                if (data.imageUrl.startsWith('http')) {
                   setPreviewUrl(data.imageUrl);
                } else {
                   setPreviewUrl(`${import.meta.env.VITE_API_URL}/uploads/${data.imageUrl}`);
                }
            }
        })
        .catch(() => toast.error('Failed to load banner'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await bannersApi.update(id!, formData);
        toast.success('Banner updated');
      } else {
        await bannersApi.create(formData);
        toast.success('Banner created');
      }
      navigate('/banners');
    } catch (error) {
      toast.error('Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Immediate preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const toastId = toast.loading('Uploading image...');
      try {
          const res = await bannersApi.uploadImage(file);
          setFormData(prev => ({ ...prev, imageUrl: res.url }));
          toast.success('Image uploaded', { id: toastId });
      } catch (error) {
          toast.error('Upload failed', { id: toastId });
          // Revert preview on failure if needed, or leave it to show what they tried
      }
  };

  if (loading) return (
    <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-4">
                <Link to="/banners" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold font-serif text-gray-900">{isEdit ? 'Edit Banner' : 'Create New Banner'}</h1>
            </div>
            <div className="flex gap-3">
                 <Link to="/banners" className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-white transition-colors">
                     Cancel
                 </Link>
                 <button 
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 bg-black text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20"
                 >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Banner'}
                 </button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content (2/3) */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Banner Content</h3>
                    <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="block text-sm font-bold uppercase tracking-widest text-gray-700">Image</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors relative bg-gray-50/30">
                                {previewUrl ? (
                                    <div className="relative group">
                                        <img src={previewUrl} alt="Preview" className="w-full h-80 object-cover rounded-xl shadow-sm" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-sm">
                                            <label className="cursor-pointer bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-xl">
                                                <Upload size={18} /> Change Image
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center justify-center py-16">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                            <Upload size={32} />
                                        </div>
                                        <span className="text-lg font-bold text-gray-900 mb-1">Click to upload banner</span>
                                        <span className="text-sm text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px recommended)</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold uppercase tracking-widest text-gray-700">Headeline / Title</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-black transition-colors font-serif text-lg text-gray-900"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="e.g. Summer Collection 2026"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold uppercase tracking-widest text-gray-700">Button Text</label>
                                <input 
                                    type="text" 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-black transition-colors text-gray-900"
                                    value={formData.buttonText}
                                    onChange={e => setFormData({...formData, buttonText: e.target.value})}
                                    placeholder="e.g. Shop Now"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold uppercase tracking-widest text-gray-700">Subtitle / Description</label>
                            <textarea 
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-black transition-colors text-gray-900"
                                rows={3}
                                value={formData.subtitle}
                                onChange={e => setFormData({...formData, subtitle: e.target.value})}
                                placeholder="Short description inviting users to click..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar (1/3) */}
            <div className="space-y-6">
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                     <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Settings</h3>
                     
                     <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:border-black transition-colors">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                />
                                <span className="font-bold text-gray-900">Active Status</span>
                            </label>
                            <p className="text-xs text-gray-500 px-1">If unchecked, this banner will be hidden from the storefront.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold uppercase tracking-widest text-gray-700">Link URL</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors text-gray-900"
                                value={formData.link}
                                onChange={e => setFormData({...formData, link: e.target.value})}
                                placeholder="e.g. /products/summer"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold uppercase tracking-widest text-gray-700">Sort Order</label>
                            <input 
                                type="number" 
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors text-gray-900"
                                value={formData.sortOrder}
                                onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                            />
                        </div>
                         
                        <div className="space-y-2">
                            <label className="block text-sm font-bold uppercase tracking-widest text-gray-700">Text Align</label>
                            <select 
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors appearance-none text-gray-900"
                                value={formData.align}

                                onChange={e => setFormData({...formData, align: e.target.value as 'left' | 'center' | 'right'})}
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default BannerForm;

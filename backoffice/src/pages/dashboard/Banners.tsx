import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bannersApi } from '../../api/banners';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Banners = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      const data = await bannersApi.getAll();
      setBanners(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);



  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await bannersApi.delete(id);
        Swal.fire(
          'Deleted!',
          'Your banner has been deleted.',
          'success'
        );
        fetchBanners();
      } catch (error) {
        toast.error('Failed to delete banner');
      }
    }
  };

  if (loading) return (
    <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home Slides</h1>
          <p className="text-gray-500">Manage your homepage hero banners</p>
        </div>
        <Link 
          to="/banners/new" 
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          Add New Slide
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500">Image</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500">Title & Subtitle</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500">Order</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500">Status</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {banners.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">No banners found. Create one!</td>
                    </tr>
                ) : (
                    banners.map((banner) => (
                        <tr key={banner.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                                <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                  <img 
                                    src={banner.imageUrl?.startsWith('http') ? banner.imageUrl : `${import.meta.env.VITE_API_URL}/uploads/${banner.imageUrl}`} 
                                    alt={banner.title} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                            </td>
                            <td className="p-4">
                                <h3 className="font-bold text-sm text-gray-900">{banner.title}</h3>
                                {banner.subtitle && <p className="text-xs text-gray-500 truncate max-w-xs">{banner.subtitle}</p>}
                            </td>
                            <td className="p-4">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black text-xs font-bold font-mono">
                                    {banner.sortOrder}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {banner.isActive ? 'Active' : 'Draft'}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Link to={`/banners/${banner.id}`} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-blue-600 transition-colors">
                                        <Edit size={16} />
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(banner.id)}
                                        className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Banners;

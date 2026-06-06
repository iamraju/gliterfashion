import { useEffect, useState } from 'react';
import { brandsApi, type Brand } from '../../api/brands';
import { Plus, Search, Pencil, Trash2, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const data = await brandsApi.getAll();
      setBrands(data);
    } catch (error) {
      console.error('Failed to load brands', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Delete Brand?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#71717a',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-[32px] overflow-hidden border-none shadow-2xl',
        confirmButton: 'rounded-xl font-bold px-8 py-3',
        cancelButton: 'rounded-xl font-bold px-8 py-3'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await brandsApi.delete(id);
      setBrands(brands.filter(b => b.id !== id));
      Swal.fire({
        title: 'Deleted!',
        text: 'Brand has been removed.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        customClass: {
          popup: 'rounded-[32px]'
        }
      });
    } catch (error: any) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Delete failed',
        icon: 'error',
        confirmButtonColor: '#000000',
        customClass: {
          popup: 'rounded-[32px]',
          confirmButton: 'rounded-xl font-bold px-8 py-3'
        }
      });
    }
  };

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500">Manage global and private brands</p>
        </div>
        <Link 
          to="/brands/new" 
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={20} />
          Add Brand
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search brands..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Products</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
              ) : filteredBrands.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No brands found</td></tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         {brand.logoUrl ? (
                           <img src={brand.logoUrl} alt={brand.name} className="w-8 h-8 rounded-full object-cover bg-gray-100" />
                         ) : (
                           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                             {brand.name.charAt(0)}
                           </div>
                         )}
                         <div>
                           <div className="font-medium text-gray-900">{brand.name}</div>
                           {brand.description && <div className="text-xs text-gray-500 truncate max-w-[200px]">{brand.description}</div>}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {brand.sellerId ? (
                         <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                           <Lock size={12} /> Private
                         </span>
                      ) : (
                         <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                           <Globe size={12} /> Global
                         </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {brand._count?.products || 0} Products
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${brand.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                         {brand.isActive ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/brands/${brand.id}`} className="p-1 text-gray-400 hover:text-black transition-colors">
                          <Pencil size={18} />
                        </Link>
                        <button onClick={() => handleDelete(brand.id, brand.name)} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 size={18} />
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

export default Brands;

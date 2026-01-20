import { useEffect, useState } from 'react';
import { settingsApi, type ShippingMethod } from '../../../api/settings';
import { Plus, Search, Pencil, Trash2, Truck, Clock } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';
import { Link } from 'react-router-dom';

const ShippingMethods = () => {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const data = await settingsApi.getShippingMethods();
      setMethods(data);
    } catch (error) {
      console.error('Failed to load shipping methods', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this shipping method?')) return;
    try {
      await settingsApi.deleteShippingMethod(id);
      setMethods(methods.filter(m => m.id !== id));
    } catch (error) {
      alert('Failed to delete shipping method');
    }
  };

  const filteredMethods = methods.filter(method => 
    method.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Methods</h1>
          <p className="text-gray-500">Manage delivery options and charges</p>
        </div>
        <Link 
          to="/settings/shipping-methods/new" 
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={20} />
          Add Shipping Method
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search methods..."
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
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Charge</th>
                <th className="px-6 py-4">Delivery Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
              ) : filteredMethods.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No methods found</td></tr>
              ) : (
                filteredMethods.map((method) => (
                  <tr key={method.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                           {method.imageUrl ? (
                             <img src={method.imageUrl} alt={method.title} className="w-full h-full rounded-lg object-cover" />
                           ) : (
                             <Truck size={20} />
                           )}
                         </div>
                         <div>
                           <div className="font-medium text-gray-900">{method.title}</div>
                           {method.description && <div className="text-xs text-gray-500 truncate max-w-[200px]">{method.description}</div>}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(method.charge)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock size={16} className="text-gray-400" />
                        {method.deliveryTimeDays}d {method.deliveryTimeHours}h
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${method.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                         {method.isActive ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/settings/shipping-methods/${method.id}`} className="p-1 text-gray-400 hover:text-black transition-colors">
                          <Pencil size={18} />
                        </Link>
                        <button onClick={() => handleDelete(method.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
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

export default ShippingMethods;

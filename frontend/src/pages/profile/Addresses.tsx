
import { useState, useEffect } from 'react';
import ProfileLayout from '../../components/profile/ProfileLayout';
import { userApi } from '../../api/user';
import { storeApi } from '../../api/store';
import { Loader2, Plus, MapPin, Trash2, CheckCircle2, MoreVertical, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Addresses = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nepal',
    countryCode: 'NP',
    type: 'SHIPPING' as 'SHIPPING' | 'BILLING',
    isDefault: false
  });

  const fetchAddresses = async () => {
    try {
      const [addressData, countriesData] = await Promise.all([
        userApi.getAddresses(),
        storeApi.getCountries()
      ]);
      setAddresses(addressData);
      setCountries(countriesData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nepal',
      countryCode: 'NP',
      type: 'SHIPPING',
      isDefault: false
    });
    setEditingAddress(null);
  };

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      countryCode: address.countryCode || 'NP',
      type: address.type,
      isDefault: address.isDefault
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAddress) {
        await userApi.updateAddress(editingAddress.id, formData);
        toast.success('Address updated successfully');
      } else {
        await userApi.createAddress(formData);
        toast.success('Address added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await userApi.deleteAddress(id);
        toast.success('Address deleted successfully');
        fetchAddresses();
      } catch (error) {
        toast.error('Failed to delete address');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await userApi.setDefaultAddress(id);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  return (
    <ProfileLayout breadcrumbs={[{ label: 'My Account', path: '/dashboard' }, { label: 'Saved Addresses' }]}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Saved Addresses</h1>
          <p className="text-gray-500">Manage your shipping and billing addresses for faster checkout.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-4 bg-black text-white rounded-2xl font-bold tracking-wide uppercase hover:bg-gray-900 transition-all shadow-xl shadow-black/10 text-xs"
        >
          <Plus size={18} />
          Add Address
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-gray-300" size={40} />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
          <MapPin className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-medium">You haven't saved any addresses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-8 bg-white border-2 rounded-[32px] transition-all relative group ${
                address.isDefault ? 'border-black shadow-2xl shadow-black/5' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                 <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        address.type === 'SHIPPING' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                        {address.type}
                    </span>
                    {address.isDefault && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-600">
                            <CheckCircle2 size={12} />
                            Default
                        </span>
                    )}
                 </div>
                 <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(address)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-black transition-all">
                        <MoreVertical size={16} />
                    </button>
                    <button onClick={() => handleDelete(address.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                    </button>
                 </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 leading-tight mb-0.5">{address.fullName}</h3>
                  <p className="text-sm text-gray-400 font-medium">{address.phone}</p>
                </div>
                <div className="text-sm text-gray-500 leading-relaxed font-medium">
                  {address.addressLine1}
                  {address.addressLine2 && <span className="block">{address.addressLine2}</span>}
                  <span className="block">{address.city}, {address.state} {address.postalCode}</span>
                  <span className="block">{address.city}, {address.state} {address.postalCode}</span>
                  <span className="block">{address.country}</span>
                </div>
              </div>

              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="mt-6 w-full py-3 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-black hover:text-white hover:border-black transition-all"
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-serif font-bold italic">{editingAddress ? 'Edit' : 'Add New'} Address</h2>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all outline-none font-bold"
                      placeholder="e.g. Raju Nepal"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all outline-none font-bold"
                      placeholder="e.g. 9801234567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Address Line 1</label>
                  <input
                    type="text"
                    required
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all outline-none font-bold"
                    placeholder="Street address, P.O. box, company name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all outline-none font-bold"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Country</label>
                   <select
                     className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all outline-none font-bold appearance-none"
                     value={formData.countryCode || ''}
                     onChange={(e) => {
                       const selectedCountry = countries.find(c => c.code === e.target.value);
                       setFormData({
                         ...formData,
                         countryCode: e.target.value,
                         country: selectedCountry?.name || ''
                       });
                     }}
                   >
                     <option value="">Select Country</option>
                     {countries.map(c => (
                       <option key={c.code} value={c.code}>{c.name}</option>
                     ))}
                   </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">State</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black transition-all outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-8 py-4 border-y border-gray-100">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Address Type</label>
                        <div className="flex gap-4">
                            {['SHIPPING', 'BILLING'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({...formData, type: type as any})}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                        formData.type === type ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer pt-6">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded-lg accent-black cursor-pointer"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                        />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-900">Set as default</span>
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="py-5 bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 rounded-[24px] font-black uppercase tracking-widest transition-all text-xs"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="py-5 bg-black text-white hover:bg-accent rounded-[24px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/10 text-xs flex items-center justify-center gap-2"
                    >
                        {submitting && <Loader2 className="animate-spin" size={18} />}
                        {editingAddress ? 'Update' : 'Save'} Address
                    </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
};

export default Addresses;

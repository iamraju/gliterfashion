
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageBanner from '../components/common/PageBanner';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { ShieldCheck, Truck, CreditCard, ChevronRight, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/store');

const Checkout = () => {
  const { cart, totalItems, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [useProfileIdentity, setUseProfileIdentity] = useState(isAuthenticated);
  const [errors, setErrors] = useState<{ [key: string]: any }>({});

  const [formData, setFormData] = useState({
    // Personal Information (for guest or when not using profile)
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    // Shipping Address (address fields only)
    shippingAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nepal',
      countryCode: 'NP'
    },
    billingSameAsShipping: true,
    billingAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nepal',
      countryCode: 'NP'
    },
    paymentMethodId: '',
    shippingMethodId: '',
    notes: '',
    shippingNotes: '',
    paymentNotes: ''
  });

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  // ... (useEffect fetches remain same)

  // ... (validateForm logic remains same mostly, handle paymentProof if needed)

  // ... (handleInputChange remains same)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const selectedPayment = paymentMethods.find(m => m.id === formData.paymentMethodId);
    const isBankTransfer = selectedPayment?.title?.toLowerCase().includes('bank') || selectedPayment?.title?.toLowerCase().includes('transfer');

    if (isBankTransfer && !paymentProof) {
      toast.error('Please upload bank transfer voucher');
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Order?',
      text: "Are you ready to place your order?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Place Order',
      cancelButtonText: 'Review Details',
      confirmButtonColor: '#000000',
      cancelButtonColor: '#71717a',
      background: '#ffffff', // ... styles
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      // 1. Upload Proof if Bank Transfer
      let proofUrl = '';
      if (isBankTransfer && paymentProof) {
        const uploadData = new FormData();
        uploadData.append('proof', paymentProof);
        
        try {
          // Use the public/store upload endpoint
          const uploadRes = await axios.post(`${API_URL}/checkout/upload-proof`, uploadData, {
             headers: { 'Content-Type': 'multipart/form-data' }
          });
          proofUrl = uploadRes.data.url; // or filename/path
        } catch (uplErr) {
           console.error('Upload failed', uplErr);
           toast.error('Failed to upload voucher');
           setLoading(false);
           return;
        }
      }

      // ... (Rest of payload construction)
      const shippingAddressForBackend: any = {
        ...formData.shippingAddress,
        fullName: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim(),
        phone: formData.personalInfo.phone
      };

      let billingAddressForBackend: any = null;
      if (formData.billingSameAsShipping) {
        billingAddressForBackend = shippingAddressForBackend;
      } else {
        billingAddressForBackend = {
          ...formData.billingAddress,
          fullName: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim(),
          phone: formData.personalInfo.phone
        };
      }

      const payload = {
        guestEmail: !isAuthenticated || !useProfileIdentity ? formData.personalInfo.email : undefined,
        guestPhone: !isAuthenticated || !useProfileIdentity ? formData.personalInfo.phone : undefined,
        cartId: cart?.id,
        shippingAddress: shippingAddressForBackend,
        billingAddress: billingAddressForBackend,
        shippingMethodId: formData.shippingMethodId,
        paymentMethodId: formData.paymentMethodId,
        notes: formData.notes,
        shippingNotes: formData.shippingNotes,
        paymentNotes: formData.paymentNotes,
        paymentProof: proofUrl
      };

      const config = isAuthenticated ? {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      } : {};

      const response = await axios.post(`${API_URL}/checkout`, payload, config);
      const { order, paymentData } = response.data;
      
      // ... (Handle redirects mostly same, add Mollie case)
      if (paymentData && paymentData.type === 'esewa') {
         // ... esewa form submit
         const form = document.createElement("form");
         form.setAttribute("method", "POST");
         form.setAttribute("action", paymentData.actionUrl);
         form.setAttribute("target", "_self");
         for (const key in paymentData.params) {
           const hiddenField = document.createElement("input");
           hiddenField.setAttribute("type", "hidden");
           hiddenField.setAttribute("name", key);
           hiddenField.setAttribute("value", paymentData.params[key]);
           form.appendChild(hiddenField);
         }
         document.body.appendChild(form);
         form.submit();
         return;
      } else if (paymentData && paymentData.type === 'mollie') {
          window.location.href = paymentData.actionUrl;
          return;
      } else if (paymentData && paymentData.type === 'paypal') {
         window.location.href = paymentData.actionUrl;
         return;
      }

      setOrderData(order);
      setOrderComplete(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const [shipRes, payRes, countryRes] = await Promise.all([
          axios.get(`${API_URL}/shipping-methods`),
          axios.get(`${API_URL}/payment-methods`),
          axios.get(`${API_URL}/countries`)
        ]);
        setShippingMethods(shipRes.data);
        setPaymentMethods(payRes.data);
        setCountries(countryRes.data);
        
        // Set defaults if not set
        if (shipRes.data.length > 0) {
          setFormData(prev => ({ ...prev, shippingMethodId: shipRes.data[0].id }));
        }
        if (payRes.data.length > 0) {
          setFormData(prev => ({ ...prev, paymentMethodId: payRes.data[0].id }));
        }
      } catch (error) {
        console.error('Failed to fetch methods', error);
      }
    };
    fetchMethods();
  }, []);

  // Pre-fill if authenticated and identity selected
  useEffect(() => {
    if (isAuthenticated && user && useProfileIdentity) {
      const defaultAddr = user.addresses?.[0];

      setFormData(prev => ({
        ...prev,
        personalInfo: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || defaultAddr?.phone || ''
        },
        shippingAddress: {
          ...prev.shippingAddress,
          addressLine1: defaultAddr?.addressLine1 || '',
          addressLine2: defaultAddr?.addressLine2 || '',
          city: defaultAddr?.city || '',
          state: defaultAddr?.state || '',
          postalCode: defaultAddr?.postalCode || '',
          country: defaultAddr?.country || 'Nepal'
        }
      }));
    }
  }, [isAuthenticated, user, useProfileIdentity]);

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((acc: number, item: any) => {
    const price = parseFloat(item.variant?.price || item.priceAtAdd);
    return acc + (price * item.quantity);
  }, 0);
  
  
  const selectedShipping = shippingMethods.find(m => m.id === formData.shippingMethodId);
  const selectedPayment = paymentMethods.find(m => m.id === formData.paymentMethodId);

  const shipping = selectedShipping ? parseFloat(selectedShipping.charge) : 0;
  const paymentCharge = selectedPayment ? parseFloat(selectedPayment.charge) : 0;
  const tax = (subtotal + shipping + paymentCharge) * 0.13;
  const total = subtotal + shipping + tax + paymentCharge;

  const validateForm = () => {
    const newErrors: any = {};
    
    // Validate personal information (for guest or when not using profile)
    if (!isAuthenticated || !useProfileIdentity) {
      const pi = formData.personalInfo;
      const piErrors: any = {};
      if (!pi.firstName) piErrors.firstName = 'First name is required';
      if (!pi.lastName) piErrors.lastName = 'Last name is required';
      if (!pi.email) piErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(pi.email)) piErrors.email = 'Invalid email';
      if (!pi.phone) piErrors.phone = 'Phone is required';
      
      if (Object.keys(piErrors).length > 0) {
        newErrors.personalInfo = piErrors;
      }
    }

    // Validate shipping address (only address fields)
    const sa = formData.shippingAddress;
    const saErrors: any = {};
    if (!sa.addressLine1) saErrors.addressLine1 = 'Address is required';
    if (!sa.city) saErrors.city = 'City is required';
    if (!sa.state) saErrors.state = 'State is required';
    if (!sa.postalCode) saErrors.postalCode = 'Pincode is required';

    if (!formData.shippingMethodId) newErrors.shippingMethodId = 'Shipping method is required';
    if (!formData.paymentMethodId) newErrors.paymentMethodId = 'Payment method is required';

    if (Object.keys(saErrors).length > 0) {
      newErrors.shippingAddress = saErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (section: string, field: string, value: string) => {
    if (section === 'root') {
      setFormData({ ...formData, [field]: value });
      if (errors[field]) setErrors({ ...errors, [field]: '' });
    } else {
      setFormData({
        ...formData,
        [section]: { ...(formData as any)[section], [field]: value }
      });
      if (errors[section]?.[field]) {
        const newSectionErrors = { ...errors[section] };
        delete newSectionErrors[field];
        setErrors({ ...errors, [section]: newSectionErrors });
      }
    }
  };


  if (orderComplete) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-xl mx-auto bg-white p-12 rounded-[48px] shadow-2xl shadow-gray-100 border border-gray-50">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-4xl font-serif font-bold mb-4">Thank You!</h1>
            <p className="text-gray-500 mb-2">Your order <span className="text-black font-bold">#{orderData?.orderNumber}</span> has been placed.</p>
            <p className="text-gray-500 mb-10 text-sm">We've sent a confirmation email to {isAuthenticated ? user?.email : formData.personalInfo.email}.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <Link to="/products" className="bg-black text-white py-4 rounded-2xl font-bold hover:bg-accent transition-all duration-300">
                Continue Shopping
              </Link>
              <Link to={isAuthenticated ? "/orders" : "/"} className="bg-gray-50 text-gray-900 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300">
                {isAuthenticated ? 'View My Orders' : 'Back to Home'}
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (totalItems === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h2 className="text-3xl font-serif font-bold mb-6">Your bag is empty</h2>
          <Link to="/products" className="inline-block bg-black text-white px-10 py-4 rounded-2xl font-bold hover:bg-accent transition-all">
            Start Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageBanner 
        title="Checkout"
        subtitle="Securely complete your purchase."
        image="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop"
      />
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="flex items-center gap-3 mb-12 text-sm">
          <Link to="/cart" className="text-gray-400 hover:text-black">Bag</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="font-bold">Checkout</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-12">
            {/* Personal Information Section */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">1</div>
                <h2 className="text-2xl font-serif font-bold">Personal Information</h2>
              </div>

              {isAuthenticated ? (
                /* Member Identity Selection */
                <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Select Identity</p>
                  <label className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${useProfileIdentity ? 'bg-white border-accent shadow-md' : 'bg-transparent border-transparent grayscale opacity-60'}`}>
                    <input 
                      type="radio" 
                      className="mt-1 accent-accent" 
                      checked={useProfileIdentity} 
                      onChange={() => setUseProfileIdentity(true)} 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</span>
                        <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold uppercase">Member</span>
                      </div>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      {user?.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                    </div>
                  </label>
                  
                  <div className="mt-4 flex items-center gap-2 px-2">
                    <button 
                      type="button"
                      onClick={() => setUseProfileIdentity(false)}
                      className={`text-xs font-bold uppercase tracking-widest transition-colors ${!useProfileIdentity ? 'text-accent underline' : 'text-gray-400 hover:text-black'}`}
                    >
                      Enter different details
                    </button>
                  </div>
                  
                  {/* Show form if not using profile */}
                  {!useProfileIdentity && (
                    <div className="mt-6 pt-6 border-t border-gray-200/60 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">First Name</label>
                          <input
                            type="text"
                            className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                              errors.personalInfo?.firstName ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                            }`}
                            value={formData.personalInfo.firstName}
                            onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                          />
                          {errors.personalInfo?.firstName && <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-1">{errors.personalInfo.firstName}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Last Name</label>
                          <input
                            type="text"
                            className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                              errors.personalInfo?.lastName ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                            }`}
                            value={formData.personalInfo.lastName}
                            onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                          />
                          {errors.personalInfo?.lastName && <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-1">{errors.personalInfo.lastName}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                          <input
                            type="email"
                            className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                              errors.personalInfo?.email ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                            }`}
                            placeholder="email@example.com"
                            value={formData.personalInfo.email}
                            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                          />
                          {errors.personalInfo?.email && <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-1">{errors.personalInfo.email}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                          <input
                            type="tel"
                            className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                              errors.personalInfo?.phone ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                            }`}
                            placeholder="+977"
                            value={formData.personalInfo.phone}
                            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                          />
                          {errors.personalInfo?.phone && <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-1">{errors.personalInfo.phone}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest Personal Information Form */
                <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Guest Checkout</p>
                    <div className="text-xs font-bold text-gray-500">
                      Already have an account? <Link to="/auth" className="text-accent hover:underline uppercase tracking-widest ml-1">Sign In</Link>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">First Name</label>
                        <input
                          type="text"
                          className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                            errors.personalInfo?.firstName ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                          }`}
                          value={formData.personalInfo.firstName}
                          onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                        />
                        {errors.personalInfo?.firstName && <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-1">{errors.personalInfo.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Last Name</label>
                        <input
                          type="text"
                          className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                            errors.personalInfo?.lastName ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                          }`}
                          value={formData.personalInfo.lastName}
                          onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                        />
                        {errors.personalInfo?.lastName && <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-1">{errors.personalInfo.lastName}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                        <input
                          type="email"
                          className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                            errors.personalInfo?.email ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                          }`}
                          placeholder="email@example.com"
                          value={formData.personalInfo.email}
                          onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                        />
                        {errors.personalInfo?.email && <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-1">{errors.personalInfo.email}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                        <input
                          type="tel"
                          className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                            errors.personalInfo?.phone ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                          }`}
                          placeholder="+977"
                          value={formData.personalInfo.phone}
                          onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                        />
                        {errors.personalInfo?.phone && <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-1">{errors.personalInfo.phone}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200/60">
                    <p className="text-[10px] text-gray-400 italic">By checking out as a guest, you can also <Link to="/auth" className="text-accent underline">create an account</Link> later to track orders.</p>
                  </div>
                </div>
              )}
            </section>

            {/* Shipping Address */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">2</div>
                <h2 className="text-2xl font-serif font-bold">Shipping Address</h2>
              </div>
              <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Address Line 1</label>
                  <input
                    type="text"
                    className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                      errors.shippingAddress?.addressLine1 ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                    }`}
                    placeholder="Street name, apartment, etc."
                    value={formData.shippingAddress.addressLine1}
                    onChange={(e) => handleInputChange('shippingAddress', 'addressLine1', e.target.value)}
                  />
                  {errors.shippingAddress?.addressLine1 && <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-1">{errors.shippingAddress.addressLine1}</p>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2 md:col-span-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Country</label>
                     <div className="relative">
                       <select
                         className="w-full bg-white border-2 border-gray-100 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none appearance-none cursor-pointer"
                         value={formData.shippingAddress.countryCode || ''}
                         onChange={(e) => {
                           const selectedCountry = countries.find(c => c.code === e.target.value);
                           setFormData({
                             ...formData,
                             shippingAddress: {
                               ...formData.shippingAddress,
                               countryCode: e.target.value,
                               country: selectedCountry?.name || ''
                             }
                           });
                         }}
                       >
                         <option value="">Select Country</option>
                         {countries.map(c => (
                           <option key={c.code} value={c.code}>{c.name}</option>
                         ))}
                       </select>
                       <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={20} />
                     </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-gray-400">City</label>
                    <input
                      type="text"
                      className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                        errors.shippingAddress?.city ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                      }`}
                      value={formData.shippingAddress.city}
                      onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                    />
                    {errors.shippingAddress?.city && <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-1">{errors.shippingAddress.city}</p>}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">State</label>
                    <input
                      type="text"
                      className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                        errors.shippingAddress?.state ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                      }`}
                      value={formData.shippingAddress.state}
                      onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                    />
                    {errors.shippingAddress?.state && <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-1">{errors.shippingAddress.state}</p>}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Pincode</label>
                    <input
                      type="text"
                      className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                        errors.shippingAddress?.postalCode ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                      }`}
                      value={formData.shippingAddress.postalCode}
                      onChange={(e) => handleInputChange('shippingAddress', 'postalCode', e.target.value)}
                    />
                    {errors.shippingAddress?.postalCode && <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-1">{errors.shippingAddress.postalCode}</p>}
                  </div>
                </div>
                <div className="px-8 pb-8 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      formData.billingSameAsShipping ? 'bg-black border-black text-white' : 'bg-white border-gray-300 group-hover:border-black'
                    }`}>
                      {formData.billingSameAsShipping && <CheckCircle2 size={16} />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={formData.billingSameAsShipping}
                      onChange={(e) => setFormData({...formData, billingSameAsShipping: e.target.checked})}
                    />
                    <span className="font-bold text-gray-700">Billing address is same as shipping</span>
                  </label>

                  {!formData.billingSameAsShipping && (
                    <div className="mt-6 pt-6 border-t border-gray-200/60 space-y-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Country</label>
                         <div className="relative">
                           <select
                             className="w-full bg-white border-2 border-gray-100 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none appearance-none cursor-pointer"
                             value={formData.billingAddress.countryCode || ''}
                             onChange={(e) => {
                               const selectedCountry = countries.find(c => c.code === e.target.value);
                               setFormData({
                                 ...formData,
                                 billingAddress: {
                                   ...formData.billingAddress,
                                   countryCode: e.target.value,
                                   country: selectedCountry?.name || ''
                                 }
                               });
                             }}
                           >
                             <option value="">Select Country</option>
                             {countries.map(c => (
                               <option key={c.code} value={c.code}>{c.name}</option>
                             ))}
                           </select>
                           <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={20} />
                         </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Address Line 1</label>
                        <input
                          type="text"
                          className={`w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none ${
                            errors.billingAddress?.addressLine1 ? 'border-red-100 bg-red-50/20' : 'border-transparent'
                          }`}
                          placeholder="Street name, apartment, etc."
                          value={formData.billingAddress.addressLine1}
                          onChange={(e) => handleInputChange('billingAddress', 'addressLine1', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">City</label>
                          <input
                            type="text"
                            className="w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none border-transparent"
                            value={formData.billingAddress.city}
                            onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">State</label>
                          <input
                            type="text"
                            className="w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none border-transparent"
                            value={formData.billingAddress.state}
                            onChange={(e) => handleInputChange('billingAddress', 'state', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Pincode</label>
                          <input
                            type="text"
                            className="w-full bg-white border-2 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none border-transparent"
                            value={formData.billingAddress.postalCode}
                            onChange={(e) => handleInputChange('billingAddress', 'postalCode', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Shipping Method */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">{isAuthenticated ? '2' : '3'}</div>
                <h2 className="text-2xl font-serif font-bold">Shipping Method</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shippingMethods.map((method) => (
                  <label 
                    key={method.id}
                    className={`relative flex items-center gap-4 p-5 rounded-[24px] cursor-pointer border-2 transition-all ${
                      formData.shippingMethodId === method.id 
                        ? 'bg-white border-accent shadow-lg shadow-accent/5' 
                        : 'bg-gray-50/50 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="shippingMethod" 
                      className="hidden" 
                      checked={formData.shippingMethodId === method.id}
                      onChange={() => setFormData({...formData, shippingMethodId: method.id})}
                    />
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                       {method.imageUrl ? (
                         <img src={method.imageUrl} alt={method.title} className="w-full h-full object-cover" />
                       ) : (
                         <Truck size={24} className="text-gray-400" />
                       )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">{method.title}</span>
                        <span className="text-sm font-bold text-accent">रु. {parseFloat(method.charge).toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">
                        {method.deliveryTimeDays}d {method.deliveryTimeHours}h Delivery
                      </p>
                    </div>
                  </label>
                ))}
                {errors.shippingMethodId && <p className="text-xs font-bold text-red-500 uppercase tracking-widest md:col-span-2 ml-4">{errors.shippingMethodId}</p>}
              </div>
            </section>
            
            <div className="mt-4 space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Shipping Notes (Optional)</label>
               <textarea
                 className="w-full bg-white border-2 border-gray-100 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none h-24 resize-none"
                 placeholder="Special instructions for delivery..."
                 value={formData.shippingNotes}
                 onChange={(e) => handleInputChange('root', 'shippingNotes', e.target.value)}
               />
            </div>

            {/* Payment Method */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">{isAuthenticated ? '3' : '4'}</div>
                <h2 className="text-2xl font-serif font-bold">Payment Method</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <label 
                    key={method.id}
                    className={`relative flex items-center gap-4 p-5 rounded-[24px] cursor-pointer border-2 transition-all ${
                      formData.paymentMethodId === method.id 
                        ? 'bg-white border-accent shadow-lg shadow-accent/5' 
                        : 'bg-gray-50/50 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      className="hidden" 
                      checked={formData.paymentMethodId === method.id}
                      onChange={() => setFormData({...formData, paymentMethodId: method.id})}
                    />
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                       {method.imageUrl ? (
                         <img src={method.imageUrl} alt={method.title} className="w-full h-full object-cover" />
                       ) : (
                         <CreditCard size={24} className="text-gray-400" />
                       )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">{method.title}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">
                        {parseFloat(method.charge) > 0 ? `रु. ${parseFloat(method.charge)} Extra Fee` : 'No Extra Fee'}
                      </p>
                    </div>
                  </label>
                ))}
                {errors.paymentMethodId && <p className="text-xs font-bold text-red-500 uppercase tracking-widest md:col-span-2 ml-4">{errors.paymentMethodId}</p>}
              </div>
            </section>

             {/* Bank Transfer Voucher Upload */}
             {paymentMethods.find(m => m.id === formData.paymentMethodId)?.title.toLowerCase().includes('bank') && (
               <div className="mt-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl animate-in fade-in slide-in-from-top-4">
                   <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block flex items-center gap-2">
                     <CreditCard size={16} />
                     Upload Payment Voucher
                   </label>
                   <input 
                     type="file" 
                     accept="image/*"
                     onChange={handleFileChange} 
                     className="w-full bg-white text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-accent transition-all border border-gray-200 rounded-xl cursor-pointer"
                   />
                   <p className="text-[10px] text-gray-400 mt-3 font-bold uppercase tracking-widest">Please upload a screenshot or photo of your bank transfer.</p>
               </div>
             )}

            <div className="mt-4 space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Payment Notes (Optional)</label>
               <textarea
                 className="w-full bg-white border-2 border-gray-100 rounded-xl py-4 px-5 focus:ring-2 focus:ring-accent transition-all outline-none h-24 resize-none"
                 placeholder="Details about payment..."
                 value={formData.paymentNotes}
                 onChange={(e) => handleInputChange('root', 'paymentNotes', e.target.value)}
               />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-gray-100 border border-gray-50 sticky top-24">
              <h3 className="text-2xl font-serif font-bold mb-8 flex justify-between items-center">
                Review Bag <span className="text-xs font-sans font-bold bg-gray-100 px-3 py-1 rounded-full">{totalItems} Items</span>
              </h3>
              
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide mb-10">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-24 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                      <img 
                        src={item.variant?.product?.images?.find((i: any) => i.isPrimary)?.imageUrl || item.variant?.product?.images?.[0]?.imageUrl || "https://placehold.co/600x400?text=No+Photo"} 
                        alt={item.variant?.product?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    <div className="flex-1 py-1">
                      <h4 className="text-sm font-bold line-clamp-1 mb-1">{item.variant?.product?.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Qty: {item.quantity}</span>
                        <span className="font-bold">रु. {(parseFloat(item.variant?.price || item.priceAtAdd) * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100 mb-8">
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">रु. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Shipping</span>
                  <span className="font-bold text-gray-900">{shipping === 0 ? 'Free' : `रु. ${shipping.toLocaleString()}`}</span>
                </div>
                {paymentCharge > 0 && (
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Payment Fee</span>
                    <span className="font-bold text-gray-900">रु. {paymentCharge.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>VAT (13%)</span>
                  <span className="font-bold text-gray-900">रु. {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-4 text-xl">
                  <span className="font-serif font-bold">Total</span>
                  <span className="font-bold text-accent">रु. {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-5 rounded-[24px] font-bold hover:bg-accent transition-all duration-500 shadow-xl hover:shadow-accent/20 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Place Order</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
                <ShieldCheck size={16} className="text-green-500" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure & Encrypted Checkout</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Checkout;

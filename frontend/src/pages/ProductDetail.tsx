import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';
import PageBanner from '../components/common/PageBanner';
import ProductGrid from '../components/home/ProductGrid';
import { Star, Minus, Plus, ShoppingBag, Truck, ShieldCheck, Loader2, Heart } from 'lucide-react';
import { storeApi } from '../api/store';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Fetch related products when product is loaded
  useEffect(() => {
    if (product?.category?.slug) {
        const fetchRelated = async () => {
            try {
                console.log('Fetching related products for category:', product.category.slug);
                // Fetch more than needed to safely filter out current product and randomize
                const data = await storeApi.getProducts({ 
                    category: product.category.slug, 
                    limit: 12 // Increased limit for better randomization
                });
                console.log('Related products raw data:', data);
                
                // Filter out current product
                let related = (data.data || []).filter((p: any) => p.id !== product.id);
                console.log('Related products after filter:', related.length);
                
                // Shuffle array (Fisher-Yates shuffle)
                for (let i = related.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [related[i], related[j]] = [related[j], related[i]];
                }

                // Take first 5
                setRelatedProducts(related.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch related products", err);
            }
        };
        fetchRelated();
    }
  }, [product]);


  const handleAddToCart = async () => {
    // Check if all necessary attributes are selected
    const allAttributes = getAllAttributes();
    const newErrors: Record<string, string> = {};
    
    Object.keys(allAttributes).forEach(attrName => {
      if (!selectedAttributes[attrName]) {
        newErrors[attrName] = `Please select a ${attrName.toLowerCase()}`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Find the matching variant
    const variant = product.variants?.find((v: any) => {
      const variantAttrs = v.productVariantAttribute || v.attributes || [];
      return Object.entries(selectedAttributes).every(([attrName, value]) => 
        variantAttrs.some((a: any) => a.attribute.name === attrName && a.attributeValue.value === value)
      );
    }) || product.variants?.[0];

    if (!variant) {
      toast.error('Selected variant not available');
      return;
    }

    try {
      await addItem(variant.id, quantity);
      toast.success('Added to bag successfully!', {
        icon: '🛍️',
        style: {
          borderRadius: '16px',
          background: '#000',
          color: '#fff',
          fontWeight: 'bold'
        }
      });
    } catch (error) {
      toast.error('Failed to add to bag');
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await storeApi.getProduct(id);
        setProduct(data);
        
        // Set initial active image (primary or first)
        const primaryImg = data.images?.find((img: any) => img.isPrimary)?.imageUrl || data.images?.[0]?.imageUrl || "https://placehold.co/600x400?text=No+Photo";
        setActiveImage(primaryImg);
        
        // Don't auto-select attributes - let the user choose explicitly
        setSelectedAttributes({});
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-accent mb-4" size={48} />
          <p className="text-gray-500 animate-pulse font-medium">Loading premium details...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-500 mb-8">The piece you're looking for might have moved.</p>
          <Link to="/products" className="bg-black text-white px-8 py-3 rounded-lg font-bold">
            Back to Collection
          </Link>
        </div>
      </Layout>
    );
  }

  // Helper to get all attributes from variants
  function getAvailableAttributes(prod: any) {
    const attrs: Record<string, Set<string>> = {};
    prod.variants?.forEach((v: any) => {
      const variantAttrs = v.productVariantAttribute || v.attributes || [];
      variantAttrs.forEach((a: any) => {
        const name = a.attribute?.name;
        const val = a.attributeValue?.value;
        if (name && val) {
          if (!attrs[name]) attrs[name] = new Set();
          attrs[name].add(val);
        }
      });
    });
    
    const result: Record<string, string[]> = {};
    Object.keys(attrs).forEach(name => {
      result[name] = Array.from(attrs[name]);
    });
    return result;
  }

  function getAllAttributes() {
    return getAvailableAttributes(product);
  }

  const availableAttributes = getAllAttributes();

  const handleAttributeSelect = (attrName: string, value: string) => {
    setSelectedAttributes(prev => ({ ...prev, [attrName]: value }));
    // Clear error for this attribute if it exists
    if (errors[attrName]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[attrName];
        return newErrs;
      });
    }
  };



  return (
    <Layout>
      {product && (
        <Helmet>
          <title>{product.name} | Glitter Fashion</title>
          <meta name="description" content={product.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Buy ${product.name} at Glitter Fashion`} />
        </Helmet>
      )}
      <PageBanner 
        title={product?.category?.name || 'Shop'} 
        image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
        className="mb-8"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
            <Link to="/" className="hover:text-black transition-colors">Home</Link> / 
            <Link to="/products" className="hover:text-black transition-colors">Products</Link> / 
            <span className="text-black font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-20">
          {/* Image Gallery */}
          <div className="space-y-4">
             <div className="bg-gray-100 aspect-[3/4] overflow-hidden rounded-2xl relative shadow-sm">
                <img src={activeImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                {product.salePrice && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Sale</span>
                )}
             </div>
             <div className="grid grid-cols-4 gap-4">
               {product.images?.map((img: any) => (
                 <button 
                   key={img.id} 
                   className={`bg-gray-100 aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 ${activeImage === img.imageUrl ? 'border-black shadow-md' : 'border-transparent hover:border-gray-300'}`}
                   onClick={() => setActiveImage(img.imageUrl)}
                 >
                   <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                 </button>
               ))}
             </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <span className="text-accent font-bold uppercase tracking-widest text-xs mb-2">{product.category?.name}</span>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex flex-col">
                {product.salePrice ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-red-600">रु. {parseFloat(product.salePrice).toLocaleString()}</span>
                    <span className="text-xl text-gray-400 line-through">रु. {parseFloat(product.basePrice).toLocaleString()}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">रु. {parseFloat(product.basePrice).toLocaleString()}</span>
                )}
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex items-center text-yellow-500">
                <Star className="fill-current w-4 h-4" />
                <Star className="fill-current w-4 h-4" />
                <Star className="fill-current w-4 h-4" />
                <Star className="fill-current w-4 h-4" />
                <Star className="w-4 h-4" />
                <span className="text-gray-400 text-sm ml-2 font-medium">(4.8 / 120 reviews)</span>
              </div>
            </div>

            <div className="prose prose-sm text-gray-600 leading-relaxed mb-10 max-w-none">
              <div dangerouslySetInnerHTML={{ __html: product.description || "No description available for this premium piece." }} />
            </div>

            {/* Selectors */}
            <div className="space-y-8 mb-10">
              {Object.entries(availableAttributes).map(([attrName, values]) => (
                <div key={attrName} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="block text-sm font-bold uppercase tracking-widest text-gray-900">Select {attrName}</span>
                    {attrName === 'Size' && (
                      <button className="text-xs font-bold text-gray-400 underline hover:text-black">Size Guide</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {values.map(val => (
                      <button
                        key={val}
                        onClick={() => handleAttributeSelect(attrName, val)}
                        className={`min-w-[56px] h-auto min-h-[56px] px-4 py-2 flex items-center justify-center border-2 font-bold rounded-2xl transition-all duration-300 ${
                          selectedAttributes[attrName] === val 
                            ? 'bg-black text-white border-black shadow-lg scale-105' 
                            : 'bg-white text-gray-900 border-gray-100 hover:border-black'
                        } ${errors[attrName] ? 'border-red-200 bg-red-50/30' : ''}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  {errors[attrName] && (
                    <p className="text-xs font-bold text-red-600 animate-in fade-in slide-in-from-top-1">
                      {errors[attrName]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-10 pt-6 border-t border-gray-100">
               <div className="flex items-center bg-gray-50 rounded-2xl p-1">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white hover:shadow-md rounded-xl transition-all"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white hover:shadow-md rounded-xl transition-all"
                  >
                    <Plus size={18} />
                  </button>
               </div>
               <button 
                 onClick={handleAddToCart}
                 className="flex-1 bg-black text-white font-bold rounded-2xl hover:bg-accent transition-all duration-300 flex items-center justify-center gap-3 group shadow-xl hover:shadow-accent/20"
               >
                 <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
                 <span className="uppercase tracking-widest text-sm">Add to Shopping Bag</span>
               </button>
               
               <button 
                 onClick={() => {
                   if (!useAuthStore.getState().isAuthenticated) {
                     toast.error('Please login to save items');
                     return;
                   }
                   const inWishlist = useWishlistStore.getState().isInWishlist(product.id);
                   if (inWishlist) {
                     useWishlistStore.getState().removeFromWishlist(product.id);
                   } else {
                      useWishlistStore.getState().addToWishlist(product.id);
                   }
                 }}
                 className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${
                   useWishlistStore.getState().isInWishlist(product.id)
                     ? 'bg-red-50 border-red-200 text-red-500'
                     : 'border-gray-200 hover:border-black text-gray-400 hover:text-black'
                 }`}
               >
                 <Heart size={24} className={useWishlistStore.getState().isInWishlist(product.id) ? "fill-current" : ""} />
               </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-gray-100">
               <div className="flex gap-4">
                 <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6 text-gray-400" />
                 </div>
                 <div>
                   <h4 className="font-bold text-sm text-gray-900">Complimentary Shipping</h4>
                   <p className="text-xs text-gray-500 font-medium">On orders above रु. 5,000</p>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-gray-400" />
                 </div>
                 <div>
                   <h4 className="font-bold text-sm text-gray-900">Authentic & Secure</h4>
                   <p className="text-xs text-gray-500 font-medium">100% genuine with secure payments</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
            <div className="border-t border-gray-200 pt-16">
                <ProductGrid 
                    title="You May Also Like" 
                    subtitle="Curated picks just for you"
                    products={relatedProducts} 
                    viewAllLink={`/products?category=${product.category.slug}`}
                />
            </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;

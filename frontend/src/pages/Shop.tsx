import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';
import { ChevronDown, Loader2, Filter, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { storeApi } from '../api/store';
import PageBanner from '../components/common/PageBanner';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { CURRENCY_SYMBOL, formatCurrency } from '../utils/currency';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { parentSlug, childSlug } = useParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Derived state from URL Params
  const activeCategory = childSlug || parentSlug || 'All';
  const activeSort = searchParams.get('sort') || 'newest';
  const activeBrand = searchParams.get('brand') || 'All';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catData, brandData, attrData] = await Promise.all([
          storeApi.getCategories(),
          storeApi.getBrands(),
          storeApi.getAttributes()
        ]);
        setCategories(catData);
        setBrands(brandData);
        setAttributes(attrData);
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = {
          limit: 20,
          sort: activeSort,
          minPrice,
          maxPrice
        };
        if (activeCategory !== 'All') params.category = activeCategory;
        if (activeBrand !== 'All') params.brand = activeBrand;
        if (searchQuery) params.search = searchQuery;

        const response = await storeApi.getProducts(params);
        setProducts(response.data || []);
        setTotalProducts(response.pagination?.total || 0);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, activeSort, activeBrand, minPrice, maxPrice, searchQuery, searchParams]);

  const handleCategoryClick = (categorySlug: string, isParent: boolean, currentParentSlug?: string) => {
    if (categorySlug === 'All') {
      navigate('/products');
    } else if (isParent) {
      navigate(`/products/${categorySlug}`);
    } else {
      navigate(`/products/${currentParentSlug}/${categorySlug}`);
    }
    if (isMobileFilterOpen) setIsMobileFilterOpen(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const toggleAttribute = (attrSlug: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentValues = newParams.get(attrSlug)?.split(',').filter(Boolean) || [];
    
    if (currentValues.includes(value)) {
      const updated = currentValues.filter(v => v !== value);
      if (updated.length > 0) {
        newParams.set(attrSlug, updated.join(','));
      } else {
        newParams.delete(attrSlug);
      }
    } else {
      currentValues.push(value);
      newParams.set(attrSlug, currentValues.join(','));
    }
    setSearchParams(newParams);
  };

  const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
  ];

  const Sidebar = () => {
    const parentCategories = categories.filter(c => !c.parentId);
    
    return (
      <div className="space-y-8">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Categories</h3>
          <div className="flex flex-col space-y-2">
            <button 
              onClick={() => handleCategoryClick('All', false)}
              className={`text-sm text-left hover:text-accent transition-colors ${activeCategory === 'All' ? 'font-bold text-black' : 'text-gray-500'}`}
            >
              All Products
            </button>
            {parentCategories.map(cat => (
              <div key={cat.id} className="space-y-2">
                <button 
                  onClick={() => handleCategoryClick(cat.slug, true)}
                  className={`text-sm text-left hover:text-accent transition-colors ${(parentSlug === cat.slug) ? 'font-bold text-black' : 'text-gray-500'}`}
                >
                  {cat.name}
                </button>
                
                {parentSlug === cat.slug && (
                  <div className="pl-4 flex flex-col space-y-2 border-l border-gray-100 mt-2">
                    {cat.children?.map((child: any) => (
                      <button 
                        key={child.id}
                        onClick={() => handleCategoryClick(child.slug, false, cat.slug)}
                        className={`text-xs text-left hover:text-accent transition-colors ${childSlug === child.slug ? 'font-bold text-black' : 'text-gray-400'}`}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Brands</h3>
          <div className="flex flex-col space-y-2">
            <button 
              onClick={() => handleFilterChange('brand', 'All')}
              className={`text-sm text-left hover:text-accent transition-colors ${activeBrand === 'All' ? 'font-bold text-black' : 'text-gray-500'}`}
            >
              All Brands
            </button>
            {brands.map(brand => (
               <button 
                 key={brand.id}
                 onClick={() => handleFilterChange('brand', brand.slug || brand.name)}
                 className={`text-sm text-left hover:text-accent transition-colors ${activeBrand === (brand.slug || brand.name) ? 'font-bold text-black' : 'text-gray-500'}`}
               >
                 {brand.name}
               </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Price Range</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Min ({CURRENCY_SYMBOL})</label>
              <input 
                type="number" 
                placeholder="0" 
                value={minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Max ({CURRENCY_SYMBOL})</label>
              <input 
                type="number" 
                placeholder="100000" 
                value={maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Attributes */}
        {attributes.map(attr => (
          <div key={attr.id}>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">{attr.name}</h3>
            <div className="flex flex-wrap gap-2">
              {attr.values.map((val: any) => {
                const isActive = searchParams.get(attr.slug)?.split(',').includes(val.value);
                return (
                  <button 
                    key={val.id}
                    onClick={() => toggleAttribute(attr.slug, val.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg border transition-all truncate max-w-[120px]",
                      isActive 
                        ? "bg-black text-white border-black font-bold" 
                        : "border-gray-100 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {val.value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };



  // Determine active category name and parent name for display
  const getCategoryNames = () => {
    if (activeCategory === 'All') return { name: 'Premium Products', parent: null };
    
    // Safety check if categories aren't loaded yet
    const hasCategories = categories.length > 0;

    // 1. Try to find by parentSlug if it exists (most reliable for hierarchy)
    if (parentSlug) {
      const parentCat = hasCategories ? categories.find(c => c.slug === parentSlug) : null;
      // Fallback to title-cased slug if category object not found yet
      const parentName = parentCat ? parentCat.name : parentSlug.charAt(0).toUpperCase() + parentSlug.slice(1);
      
      const childName = (hasCategories && parentCat && parentCat.children)
        ? parentCat.children.find((c: any) => c.slug === childSlug)?.name 
        : (childSlug ? childSlug.charAt(0).toUpperCase() + childSlug.slice(1) : activeCategory);

      return { 
        name: childName || activeCategory, // Fallback
        parent: parentName, 
        parentSlug: parentSlug 
      };
    }

    // 2. No parentSlug in URL, check if activeCategory is a root category
    const rootCat = hasCategories ? categories.find(c => c.slug === activeCategory) : null;
    if (rootCat) return { name: rootCat.name, parent: null };

    // 3. Fallback: it might be a child category accessed directly(?) or just unknown
    // Try to find it in children of all categories to see if we can deduce a parent
    if (hasCategories) {
        for (const cat of categories) {
            if (cat.children) {
                const child = cat.children.find((c: any) => c.slug === activeCategory);
                if (child) return { name: child.name, parent: cat.name, parentSlug: cat.slug };
            }
        }
    }
    
    // 4. Last resort: just display the activeCategory slug/name
    return { name: activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1), parent: null };
  };

  const { name: displayCategoryName, parent: displayParentName, parentSlug: foundParentSlug } = getCategoryNames();
  
  // Construct title string
  const browserTitle = displayParentName 
    ? `Glitter Fashion | ${displayParentName} > ${displayCategoryName}`
    : `Glitter Fashion | ${displayCategoryName}`;

  return (
    <Layout>
      <Helmet>
        <title>{browserTitle}</title>
      </Helmet>
      <PageBanner 
        title={searchQuery ? `Search: "${searchQuery}"` : displayCategoryName}
        subtitle="Discover our curated collection of premium fashion pieces designed for the modern lifestyle."
      />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs 
          items={[
            { label: 'Products', path: '/products' },
            ...(displayParentName ? [{ label: displayParentName, path: `/products/${foundParentSlug}` }] : []),
            ...(activeCategory !== 'All' ? [{ label: displayCategoryName }] : [])
          ]} 
        />
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-100 gap-4">
               <button 
                 onClick={() => setIsMobileFilterOpen(true)}
                 className="lg:hidden flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full text-sm font-bold"
               >
                 <Filter size={14} /> Filters
               </button>

               <div className="flex items-center gap-4">
                 <span className="text-sm text-gray-500">{totalProducts} Products Found</span>
                 <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-black transition-colors">
                      Sort: {sortOptions.find(o => o.value === activeSort)?.label} <ChevronDown size={14} />
                    </button>
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      {sortOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleFilterChange('sort', option.value)}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${activeSort === option.value ? 'bg-gray-50 font-bold' : ''}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                 </div>
               </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="animate-spin text-accent mb-4" size={48} />
                <p className="text-gray-500 animate-pulse">Filtering premium pieces...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {products.map((product: any) => {
                  const primaryImage = product.images?.find((img: any) => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl || "https://placehold.co/600x400?text=No+Photo";
                  
                  return (
                    <Link key={product.id} to={`/product/${product.slug}`} className="group">
                      <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4 rounded-xl">
                        <img 
                          src={primaryImage} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/60 to-transparent pt-12">
                          <button className="w-full bg-white text-black py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-accent hover:text-black transition-colors">
                            Quick Add
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">{product.category?.name}</span>
                        <h3 className="text-base font-serif font-bold group-hover:text-accent transition-colors line-clamp-1">{product.name}</h3>
                        <p className="font-bold mt-1 text-sm">
                          {formatCurrency(product.basePrice)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="text-gray-400 text-lg">No products match your filters.</p>
                <button 
                  onClick={() => {
                    navigate('/products');
                    setSearchParams({});
                  }}
                  className="mt-4 text-accent font-bold underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      <div className={cn(
        "fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity duration-300",
        isMobileFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )} onClick={() => setIsMobileFilterOpen(false)}>
        <div 
          className={cn(
            "fixed inset-y-0 left-0 w-80 bg-white p-8 transition-transform duration-300",
            isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-serif font-bold">Filters</h2>
            <button onClick={() => setIsMobileFilterOpen(false)}><X size={24} /></button>
          </div>
          <Sidebar />
          <button 
            onClick={() => setIsMobileFilterOpen(false)}
            className="w-full bg-black text-white py-4 rounded-xl font-bold mt-8"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;

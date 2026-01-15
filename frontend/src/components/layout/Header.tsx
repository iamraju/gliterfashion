import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBasket, Search, Menu, X, User, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { storeApi } from '../../api/store';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

const Header = () => {
  const { totalItems, cart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await storeApi.getCategories();
        setAllCategories(categories);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  // Main navigation structure
  const mainNav = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products', hasDropdown: true },
    { name: 'Men', path: '/products/mens-fashion' },
    { name: 'Women', path: '/products/womens-fashion' },
    { name: 'Unisex', path: '/products/unisex-collections' },
  ];

  const parentCategories = allCategories.filter(cat => !cat.parentId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || isMenuOpen || activeDropdown ? "bg-white shadow-sm py-4" : "bg-transparent py-6"
      )}
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <div className="container mx-auto px-4 relative z-50">
        <div className="flex items-center">
          {/* Mobile Menu Button - keep on left for mobile */}
          <button 
            className="lg:hidden p-2 mr-4 hover:bg-black/5 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="mr-12">
            <img src="/logo.png" alt="Glitter logo" className="h-11 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10 flex-1">
            {mainNav.map((link) => (
              <div 
                key={link.name} 
                className="relative group py-2"
                onMouseEnter={() => link.hasDropdown ? setActiveDropdown(link.name) : setActiveDropdown(null)}
              >
                <Link 
                  to={link.path}
                  className={cn(
                    "text-sm font-bold transition-colors uppercase tracking-widest flex items-center gap-1 text-gray-900 hover:text-accent"
                  )}
                >
                  {link.name} {link.hasDropdown && <ChevronDown size={12} />}
                </Link>
              </div>
            ))}
          </nav>

          {/* Actions - remain on right */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 hover:bg-black/5 rounded-full transition-all duration-300 group"
            >
              <Search size={22} className="group-hover:text-accent transition-colors text-gray-900" />
            </button>
            {isAuthenticated ? (
              <div className="relative group/auth">
                <button className="hidden sm:flex p-2.5 hover:bg-black/5 rounded-full transition-all duration-300 group items-center gap-2">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black group-hover:bg-accent transition-colors">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-accent transition-colors">{user?.firstName}</span>
                </button>
                <div className="absolute top-full right-0 w-48 bg-white shadow-2xl rounded-2xl border border-gray-100 mt-2 opacity-0 invisible group-hover/auth:opacity-100 group-hover/auth:visible transition-all duration-300 origin-top-right overflow-hidden p-2">
                   <Link to="/dashboard" className="block w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-accent rounded-xl transition-all">My Dashboard</Link>
                   <Link to="/profile" className="block w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-accent rounded-xl transition-all">My Profile</Link>
                   <Link to="/orders" className="block w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-accent rounded-xl transition-all">My Orders</Link>
                   <button 
                    onClick={logout}
                    className="block w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all text-left"
                   >
                     Logout
                   </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="hidden sm:flex p-2.5 hover:bg-black/5 rounded-full transition-all duration-300 group items-center gap-2"
                title="Account"
              >
                <User size={22} className="group-hover:text-accent transition-colors text-gray-900" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-accent transition-colors">Sign In</span>
              </Link>
            )}
            
            <div 
              className="relative group"
              onMouseEnter={() => setIsCartOpen(true)}
              onMouseLeave={() => setIsCartOpen(false)}
            >
              <Link to="/cart" className="p-2.5 hover:bg-black/5 rounded-full transition-all duration-300 flex relative group">
                <ShoppingBasket size={22} className="group-hover:text-accent transition-colors text-gray-900" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Cart Dropdown Preview */}
              <div className={cn(
                "absolute top-full right-0 w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 mt-2 transition-all duration-300 origin-top-right overflow-hidden",
                isCartOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
              )}>
                <div className="p-5">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 border-b pb-3 flex justify-between">
                    Your Bag <span className="text-gray-400">({totalItems})</span>
                  </h3>
                  
                  {cart?.items?.length > 0 ? (
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                      {cart.items.slice(0, 3).map((item: any) => {
                        const product = item.variant?.product;
                        const primaryImage = product?.images?.find((img: any) => img.isPrimary)?.imageUrl || product?.images?.[0]?.imageUrl;
                        return (
                          <div key={item.id} className="flex gap-4 group/item">
                            <div className="w-16 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                              <img src={primaryImage} alt={product?.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                              <h4 className="text-xs font-bold line-clamp-1 group-hover/item:text-accent transition-colors">{product?.name}</h4>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Qty: {item.quantity}</p>
                              <p className="text-xs font-black mt-1">रु. {parseFloat(item.variant?.price || item.priceAtAdd).toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })}
                      {cart.items.length > 3 && (
                        <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest pt-2">
                          + {cart.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <ShoppingBasket size={32} className="mx-auto text-gray-100 mb-3" />
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Bag is empty</p>
                    </div>
                  )}

                  <div className="mt-6 space-y-3">
                    <Link to="/cart" className="block w-full bg-black text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-accent transition-all duration-300">
                      View Shopping Bag
                    </Link>
                    <Link to="/checkout" className="block w-full bg-gray-50 text-gray-900 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-gray-100 transition-all duration-300">
                      Checkout Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <div 
        className={cn(
          "absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl transition-all duration-300 overflow-hidden",
          activeDropdown === 'Products' ? "max-h-[600px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
        )}
      >
        <div className="container mx-auto px-4 py-12">
           <div className="grid grid-cols-4 gap-12">
             {parentCategories.map(parent => (
               <div key={parent.id} className="space-y-4">
                 <Link 
                   to={`/products/${parent.slug}`}
                   className="text-sm font-bold uppercase tracking-widest text-gray-900 hover:text-accent transition-colors pb-2 border-b border-gray-100 block"
                   onClick={() => setActiveDropdown(null)}
                 >
                   {parent.name}
                 </Link>
                 <div className="flex flex-col space-y-2">
                   {parent.children?.map((child: any) => (
                     <Link 
                       key={child.id}
                       to={`/products/${parent.slug}/${child.slug}`}
                       className="text-sm text-gray-500 hover:text-accent transition-colors"
                       onClick={() => setActiveDropdown(null)}
                     >
                       {child.name}
                     </Link>
                   ))}
                 </div>
               </div>
             ))}
             {/* Featured Item in Menu */}
             <div className="bg-gray-50 p-6 rounded-2xl flex flex-col justify-end min-h-[200px] relative overflow-hidden group">
               <div className="relative z-10">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">New Collection</p>
                 <h4 className="text-xl font-serif font-bold mb-4">Summer Luxury 2026</h4>
                 <Link 
                   to="/products" 
                   className="text-sm font-bold border-b border-black pb-1 hover:text-accent hover:border-accent transition-all"
                   onClick={() => setActiveDropdown(null)}
                 >
                   Discover Now
                 </Link>
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>
             </div>
           </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 bg-white z-40 lg:hidden transition-transform duration-300 pt-24 px-6",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <nav className="flex flex-col space-y-6">
          {mainNav.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className="text-2xl font-serif font-bold hover:text-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-8 border-t border-gray-100 space-y-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard"
                  className="flex items-center space-x-3 text-lg font-bold uppercase tracking-widest text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Dashboard
                </Link>
                <Link 
                  to="/profile"
                  className="flex items-center space-x-3 text-lg font-bold uppercase tracking-widest text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 text-lg font-bold uppercase tracking-widest text-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/auth"
                className="flex items-center space-x-3 text-xl font-black uppercase tracking-[0.2em] mb-4 bg-gray-50 p-4 rounded-xl hover:bg-accent hover:text-white transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={24} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>

      {/* Search Overlay */}
      <div className={cn(
        "fixed inset-0 bg-white z-[100] transition-all duration-500 flex flex-col items-center justify-center px-6",
        isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      )}>
        <button 
          onClick={() => setIsSearchOpen(false)}
          className="absolute top-10 right-10 p-4 hover:bg-gray-50 rounded-full transition-all group"
        >
          <X size={32} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <div className="w-full max-w-4xl">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">What are you looking for?</p>
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH PRODUCTS, COLLECTIONS, STYLES..."
              className="w-full bg-transparent border-b-2 border-gray-100 py-6 text-2xl lg:text-4xl font-serif font-bold text-center focus:outline-none focus:border-black transition-all placeholder:text-gray-200"
              autoFocus={isSearchOpen}
            />
            <button 
              type="submit"
              className="absolute right-0 bottom-6 p-2 hover:text-accent transition-colors"
            >
              <Search size={32} />
            </button>
          </form>
          
          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest py-2">Quick Search:</span>
             {['Denim', 'Summer', 'Accessories', 'New Arrivals'].map(term => (
               <button 
                key={term}
                onClick={() => {
                  setSearchQuery(term);
                  navigate(`/products?search=${term}`);
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="px-6 py-2 bg-gray-50 hover:bg-black hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
               >
                 {term}
               </button>
             ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;

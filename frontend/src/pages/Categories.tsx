import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { storeApi } from '../api/store';
import { Loader2, ArrowRight } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await storeApi.getCategories();
        // Only show parent categories at the top level
        setCategories(data.filter((cat: any) => !cat.parentId));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold text-center mb-4">Our Collections</h1>
          <p className="text-gray-500 text-center max-w-xl mx-auto">
            Explore our meticulously curated categories and find the perfect pieces for your wardrobe.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-accent mb-4" size={48} />
            <p className="text-gray-500 animate-pulse">Organizing our collections...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {categories.map((category) => (
              <div key={category.id} className="group">
                <Link to={`/products/${category.slug}`} className="block relative aspect-[4/5] overflow-hidden rounded-2xl mb-6 bg-gray-100">
                  <img 
                    src={category.imageUrl || "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h2 className="text-3xl font-serif font-bold mb-2">{category.name}</h2>
                    <span className="inline-flex items-center text-sm font-bold uppercase tracking-widest group-hover:text-accent transition-colors">
                      Browse Collection <ArrowRight size={14} className="ml-2" />
                    </span>
                  </div>
                </Link>
                
                {/* Sub-categories */}
                {category.children && category.children.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Sub-categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {category.children.map((child: any) => (
                        <Link 
                          key={child.id}
                          to={`/products/${category.slug}/${child.slug}`}
                          className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-sm hover:bg-black hover:text-white transition-all border border-gray-100"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Categories;

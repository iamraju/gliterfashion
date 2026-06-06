import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { storeApi } from '../../api/store';

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await storeApi.getCategories({ showInHomePage: true, rootOnly: true });
        // Map to display format if needed, but store data should have name/imageUrl
        setCategories(data.slice(0, 5).map((cat: any) => ({
             id: cat.id,
             name: cat.name,
             image: cat.imageUrl || "https://placehold.co/400x600?text=No+Image", 
             link: `/products?category=${cat.slug || cat.id}` // Link to shop page filtered by category
        })));
      } catch (error) {
        console.error("Failed to fetch featured categories", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-2">Browse by Category</h2>
            <p className="text-gray-500">Explore our curated selections</p>
          </div>
          <Link to="/categories" className="hidden md:flex items-center text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors">
            View All <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={category.link}
              className="group relative h-[400px] overflow-hidden block rounded-2xl"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${category.image})` }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
              
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="text-white/80 text-sm font-bold uppercase tracking-widest mb-2 block transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  Discover
                </span>
                <h3 className="text-2xl text-white font-serif font-bold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;

import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import HeroSlider from '../components/home/HeroSlider';
import FeaturedCategories from '../components/home/FeaturedCategories';
import ProductGrid from '../components/home/ProductGrid';
import Testimonials from '../components/home/Testimonials';
import { storeApi } from '../api/store';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Featured Products (limit 5)
        const featuredData = await storeApi.getProducts({ featured: true, limit: 5 });
        setFeaturedProducts(featuredData.data || []);

        // Fetch New Arrivals (limit 5, sort newest)
        const newData = await storeApi.getProducts({ sort: 'newest', limit: 5 });
        setNewArrivals(newData.data || []);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <HeroSlider />
      
      {/* Featured Products */}
      <div className="bg-white">
          <ProductGrid 
            title="Featured Collection" 
            subtitle="Handpicked styles just for you"
            products={featuredProducts}
            viewAllLink="/products?featured=true"
            loading={loading}
          />
      </div>

      {/* New Arrivals */}
      <div className="bg-gray-50/50">
          <ProductGrid 
            title="New Arrivals" 
            subtitle="Fresh looks for the new season"
            products={newArrivals}
            viewAllLink="/products?sort=newest"
            loading={loading}
          />
      </div>

      {/* Categories */}
      <FeaturedCategories />

      {/* Testimonials */}
      <Testimonials />
    </Layout>
  );
};

export default Home;

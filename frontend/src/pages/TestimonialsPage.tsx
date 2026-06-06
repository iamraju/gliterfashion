import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import PageBanner from '../components/common/PageBanner';
import { Helmet } from 'react-helmet-async';
import { Star, User, Loader2 } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  imageUrl?: string;
}

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        // Fetch all public testimonials
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/testimonials/public?active=true`);
        setTestimonials(res.data);
      } catch (error) {
        console.error('Failed to fetch testimonials');
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <Layout>
       <Helmet>
         <title>Reviews & Testimonials | Glitter Fashion</title>
       </Helmet>
       <PageBanner 
          title="Customer Reviews" 
          subtitle="Read what our community has to say about their Glitter Fashion experience."
          image="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop"
       />


       <div className="container mx-auto px-4 py-12 lg:py-24">
          <Breadcrumbs items={[{ label: 'Reviews & Testimonials' }]} />
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
               <Loader2 className="animate-spin text-gray-400 mb-4" size={32} />
               <p className="text-gray-500">Loading reviews...</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {testimonials.map((testimonial) => (
                 <div 
                   key={testimonial.id} 
                   className="bg-gray-50 p-8 rounded-[32px] hover:shadow-xl hover:bg-white hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-gray-100 flex flex-col h-full"
                 >
                   <div className="flex gap-1 mb-6 text-yellow-400">
                     {[...Array(5)].map((_, i) => (
                       <Star 
                         key={i} 
                         size={16} 
                         fill={i < testimonial.rating ? "currentColor" : "none"} 
                         className={i < testimonial.rating ? "" : "text-gray-300"}
                       />
                     ))}
                   </div>
                   
                   <blockquote className="text-gray-700 leading-relaxed mb-8 flex-1 italic text-lg">
                     "{testimonial.content}"
                   </blockquote>
                   
                   <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-200/50">
                     {testimonial.imageUrl ? (
                         <img 
                         src={testimonial.imageUrl} 
                         alt={testimonial.name} 
                         className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-sm"
                         />
                     ) : (
                         <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-white shadow-sm">
                             <User className="w-6 h-6 text-gray-400" />
                         </div>
                     )}
                     <div>
                       <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                       <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{testimonial.role}</div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          )}
       </div>
    </Layout>
  );
};

export default TestimonialsPage;

import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';
import PageBanner from '../components/common/PageBanner';

import Breadcrumbs from '../components/common/Breadcrumbs';
import { storeApi } from '../api/store';

const ContentPage = ({ title, children }: { title: string, children: React.ReactNode }) => {
  return (
    <Layout>
       <Helmet>
         <title>{title} | Glitter Fashion</title>
       </Helmet>
       <PageBanner 
          title={title}
          image="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
       />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Breadcrumbs items={[{ label: title }]} />
        <div className="prose prose-lg mx-auto prose-img:rounded-[32px] prose-img:my-10 prose-img:shadow-lg prose-p:mb-6 prose-p:leading-relaxed text-gray-600 prose-headings:font-serif">
          {children}
        </div>
      </div>
    </Layout>
  );
};

export const About = () => (
  <ContentPage title="Our Story">
    <p className="text-xl font-serif leading-relaxed text-gray-700 mb-8">
      Founded in 2026, Glitter Fashion was born from a desire to create a fashion destination 
      that bridges the gap between luxury aesthetics and everyday wearability.
    </p>
    <p className="mb-6">
      We believe that style is a personal expression, and our curated collections are designed to 
      help you tell your story. From sourcing the finest fabrics to collaborating with skilled artisans, 
      every piece in our store is a testament to quality.
    </p>
    <h3 className="text-2xl font-bold mt-8 mb-4">Our Mission</h3>
    <p>
      To empower individuals through fashion that is both sustainable and stylish, ensuring you look good 
      while doing good for the planet.
    </p>
  </ContentPage>
);

export const Contact = () => {
  const [loading, setLoading] = React.useState(false);
  const [settings, setSettings] = React.useState<any[]>([]);
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });

  const { submitContactForm, getPublicSettings } = storeApi;
  // Using require to avoid import issues if not exported yet, but ideally should be import.
  // Actually, import is better since I just updated the file.
  // Assuming implicit import available or I will fix if needed. 
  // Wait, I can't inject imports easily with replace. I'll use the existing import if possible or just use inline logic if I could...
  // But I need to fetch settings. 
  
  React.useEffect(() => {
    const fetchSettings = async () => {
        try {
            const data = await getPublicSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };
    fetchSettings();
  }, []);

  const getSetting = (key: string, fallback: string) => {
      const setting = settings.find(s => s.key.toLowerCase() === key.toLowerCase());
      return setting ? setting.value : fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContactForm(formData);
      alert('Message sent successfully!');
      setFormData({ fullName: '', email: '', phone: '', message: '' });
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
  <ContentPage title="Contact Us">
     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
       <div>
         <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
         <p className="mb-6 text-gray-600">
           Have a question or feedback? We'd love to hear from you. Fill out the form or reach out directly.
         </p>
         <div className="space-y-4">
           <div>
             <span className="block font-bold">Email</span>
             <a href={`mailto:${getSetting('supportEmail', 'support@glitterfashion.com')}`} className="text-accent hover:underline">
                {getSetting('supportEmail', 'support@glitterfashion.com')}
             </a>
           </div>
           <div>
             <span className="block font-bold">Phone</span>
             <a href={`tel:${getSetting('telephone', '+1 (555) 123-4567')}`} className="text-accent hover:underline">
                {getSetting('telephone', '+1 (555) 123-4567')}
             </a>
           </div>
           <div>
             <span className="block font-bold">Address</span>
             <p className="text-gray-600">{getSetting('address', '123 Fashion Ave, Design District, NY 10001')}</p>
           </div>
         </div>
       </div>
       <form className="space-y-4" onSubmit={handleSubmit}>
         <div>
           <label className="block text-sm font-bold mb-1">Full Name <span className="text-red-500">*</span></label>
           <input 
             type="text" 
             name="fullName"
             required
             value={formData.fullName}
             onChange={handleChange}
             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
             placeholder="Your Name" 
           />
         </div>
         <div>
           <label className="block text-sm font-bold mb-1">Email <span className="text-red-500">*</span></label>
           <input 
             type="email" 
             name="email"
             required
             value={formData.email}
             onChange={handleChange}
             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
             placeholder="Your Email" 
            />
         </div>
         <div>
           <label className="block text-sm font-bold mb-1">Phone</label>
           <input 
             type="tel" 
             name="phone"
             value={formData.phone}
             onChange={handleChange}
             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
             placeholder="Your Phone (Optional)" 
           />
         </div>
         <div>
           <label className="block text-sm font-bold mb-1">Message</label>
           <textarea 
             name="message"
             value={formData.message}
             onChange={handleChange}
             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none h-32" 
             placeholder="How can we help?"
           ></textarea>
         </div>
         <button 
           type="submit"
           disabled={loading}
           className="w-full bg-black text-white font-bold py-4 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
         >
           {loading ? 'Sending...' : 'Send Message'}
         </button>
       </form>
     </div>
  </ContentPage>
  );
};

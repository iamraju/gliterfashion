import React from 'react';
import Layout from '../components/layout/Layout';

const ContentPage = ({ title, children }: { title: string, children: React.ReactNode }) => {
  return (
    <Layout>
       <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">{title}</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="prose prose-lg mx-auto">
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

export const Contact = () => (
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
             <a href="mailto:support@glitterfashion.com" className="text-accent hover:underline">support@glitterfashion.com</a>
           </div>
           <div>
             <span className="block font-bold">Phone</span>
             <a href="tel:+15551234567" className="text-accent hover:underline">+1 (555) 123-4567</a>
           </div>
           <div>
             <span className="block font-bold">Address</span>
             <p className="text-gray-600">123 Fashion Ave, Design District, NY 10001</p>
           </div>
         </div>
       </div>
       <form className="space-y-4">
         <div>
           <label className="block text-sm font-bold mb-1">Name</label>
           <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" placeholder="Your Name" />
         </div>
         <div>
           <label className="block text-sm font-bold mb-1">Email</label>
           <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" placeholder="Your Email" />
         </div>
         <div>
           <label className="block text-sm font-bold mb-1">Message</label>
           <textarea className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none h-32" placeholder="How can we help?"></textarea>
         </div>
         <button className="w-full bg-black text-white font-bold py-4 rounded-lg hover:bg-gray-900 transition-colors">
           Send Message
         </button>
       </form>
     </div>
  </ContentPage>
);

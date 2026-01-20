import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, MapPin, Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/store';

const Footer = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pagesRes, settingsRes] = await Promise.all([
          axios.get(`${API_URL}/pages/public`),
          axios.get(`${API_URL}/settings/public`)
        ]);
        setPages(pagesRes.data);
        setSettings(settingsRes.data);
      } catch (error) {
        // quiet failure
      }
    };
    fetchData();
  }, []);

  const getSetting = (key: string) => settings.find(s => s.key === key)?.value || '';

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold tracking-tighter">
              GLITTER<span className="text-accent">.</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {getSetting('metaDescription') || "Elevating your style with premium fashion essentials. Designed for the modern individual who values quality and aesthetics."}
            </p>
            <div className="flex space-x-4">
              {getSetting('instagramUrl') && (
                <a href={getSetting('instagramUrl')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                  <Instagram size={18} />
                </a>
              )}
              {getSetting('facebookUrl') && (
                <a href={getSetting('facebookUrl')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                  <Facebook size={18} />
                </a>
              )}
              {getSetting('twitterUrl') && (
                <a href={getSetting('twitterUrl')} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                  <Twitter size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Products</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link to="/products/new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link to="/products/womens-fashion" className="hover:text-white transition-colors">Women</Link></li>
              <li><Link to="/products/mens-fashion" className="hover:text-white transition-colors">Men</Link></li>
              <li><Link to="/products/accessories" className="hover:text-white transition-colors">Accessories</Link></li>
              <li><Link to="/products?onSale=true" className="hover:text-white transition-colors">Sale</Link></li>
            </ul>
          </div>

          {/* Support / Dynamic Pages */}
          <div>
            <h4 className="font-bold text-lg mb-6">Information</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link to="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              {pages.map((page: any) => (
                 <li key={page.id}>
                    <Link to={`/pages/${page.slug}`} className="hover:text-white transition-colors">{page.title}</Link>
                 </li>
              ))}
              {pages.length === 0 && (
                <>
                  <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
                  <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6">Contact</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span>{getSetting('contactAddress') || '123 Fashion Ave, Design District, New York, NY'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} />
                <span>{getSetting('contactPhone') || '+1 (555) 123-4567'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} />
                <span>{getSetting('contactEmail') || getSetting('supportEmail') || 'support@glitterfashion.com'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {getSetting('siteName') || 'Glitter Fashion'}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {pages.map((page: any) => (
                <Link key={page.id} to={`/pages/${page.slug}`} className="hover:text-white cursor-pointer">{page.title}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

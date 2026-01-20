import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { Loader2 } from 'lucide-react';
import PageBanner from '../components/common/PageBanner';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/store';

interface Page {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

const PageDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await axios.get(`${API_URL}/pages/slug/${slug}`);
                setPage(res.data);
            } catch (err: any) {
                setError(err.response?.status === 404 ? 'Page not found' : 'Failed to load page');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-[50vh]">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            </Layout>
        );
    }

    if (error || !page) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-4xl font-serif font-bold mb-4">404</h1>
                    <p className="text-gray-500 text-lg mb-8">{error || 'Page not found'}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <PageBanner 
                title={page.title} 
                image="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
            />
            <div className="container mx-auto px-4 py-12 lg:py-20 max-w-4xl">
                <div 
                    className="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-black prose-a:font-bold prose-img:rounded-[32px] prose-img:my-12 prose-img:shadow-xl prose-p:mb-8 prose-p:leading-loose text-gray-600"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            </div>
        </Layout>
    );
};

export default PageDetail;

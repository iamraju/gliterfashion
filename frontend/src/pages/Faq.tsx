
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PageBanner from '../components/common/PageBanner';

interface Faq {
    id: string;
    question: string;
    answer: string;
    sortOrder: number;
}

const FaqPage: React.FC = () => {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/faqs/public?active=true`);
                setFaqs(res.data);
            } catch (error) {
                console.error('Failed to fetch FAQs');
            } finally {
                setIsLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <Layout>
             <PageBanner 
                title="Frequently Asked Questions"
                subtitle="Find answers to common questions about shipping, returns, and more."
                image="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop"
             />
             <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {isLoading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div 
                                    key={faq.id} 
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300"
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                                    >
                                        <span className="text-lg font-bold text-gray-900">{faq.question}</span>
                                        {openIndex === index ? (
                                            <ChevronUp className="w-5 h-5 text-brand-primary" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                    
                                    <div 
                                        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                                            openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default FaqPage;

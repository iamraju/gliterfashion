
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/backoffice';

interface Faq {
    id: string;
    question: string;
    answer: string;
    isActive: boolean;
    sortOrder: number;
}

const Faqs: React.FC = () => {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const res = await axios.get(`${API_URL}/faqs`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
            });
            setFaqs(res.data);
        } catch (error) {
            console.error('Failed to fetch FAQs');
        } finally {
            setIsLoading(false);
        }
    };

    const onDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Delete FAQ?',
            text: "This cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/faqs/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                });
                setFaqs(faqs.filter(f => f.id !== id));
                Swal.fire('Deleted!', 'FAQ has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete FAQ', 'error');
            }
        }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
                    <p className="text-gray-500 mt-1">Manage Frequently Asked Questions.</p>
                </div>
                <Link 
                  to="/faqs/new"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add FAQ</span>
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100/50">
                        <tr>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Question</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Sort Order</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {faqs.length === 0 ? (
                             <tr><td colSpan={4} className="p-8 text-center text-gray-400">No FAQs found.</td></tr>
                        ) : (
                            faqs.map(faq => (
                                <tr key={faq.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6 font-bold text-gray-900">{faq.question}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${faq.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {faq.isActive ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-gray-500">{faq.sortOrder}</td>
                                    <td className="p-6 flex justify-end gap-2">
                                        <Link to={`/faqs/edit/${faq.id}`} className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors" title="Edit">
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => onDelete(faq.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Faqs;

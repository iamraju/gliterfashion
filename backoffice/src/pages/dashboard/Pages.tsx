import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/backoffice';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
  updatedAt: string;
}

const PagesManager: React.FC = () => {
    const [pages, setPages] = useState<Page[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await axios.get(`${API_URL}/pages`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
            });
            setPages(res.data);
        } catch (error) {
            console.error('Failed to fetch pages');
        } finally {
             setIsLoading(false);
        }
    };

    const onDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Delete Page?',
            text: "This cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/pages/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                });
                setPages(pages.filter(p => p.id !== id));
                Swal.fire('Deleted!', 'Page has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete page', 'error');
            }
        }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
                    <p className="text-gray-500 mt-1">Manage static content pages like About Us, Privacy Policy.</p>
                </div>
                <Link 
                  to="/pages/new"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Page</span>
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100/50">
                        <tr>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pages.length === 0 ? (
                             <tr><td colSpan={4} className="p-8 text-center text-gray-400">No pages found. Create one!</td></tr>
                        ) : (
                            pages.map(page => (
                                <tr key={page.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6 font-bold text-gray-900">{page.title}</td>
                                    <td className="p-6 text-gray-500 text-sm font-mono text-gray-900">{page.slug}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${page.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {page.isActive ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-6 flex justify-end gap-2">
                                        <Link to={`/pages/edit/${page.id}`} className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors" title="Edit">
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => onDelete(page.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

export default PagesManager;

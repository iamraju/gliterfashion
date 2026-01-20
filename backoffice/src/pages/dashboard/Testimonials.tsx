
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/backoffice';

interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
    isActive: boolean;
}

const Testimonials: React.FC = () => {
    const [items, setItems] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get(`${API_URL}/testimonials`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
            });
            setItems(res.data);
        } catch (error) {
            console.error('Failed to fetch testimonials');
        } finally {
            setIsLoading(false);
        }
    };

    const onDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Delete?',
            text: "This cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/testimonials/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                });
                setItems(items.filter(i => i.id !== id));
                Swal.fire('Deleted!', 'Item has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete item', 'error');
            }
        }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
                    <p className="text-gray-500 mt-1">Manage customer reviews and testimonials.</p>
                </div>
                <Link 
                  to="/testimonials/new"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Testimonial</span>
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100/50">
                        <tr>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Name/Role</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Content</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 ? (
                             <tr><td colSpan={5} className="p-8 text-center text-gray-400">No testimonials found.</td></tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6">
                                        <div className="font-bold text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.role}</div>
                                    </td>
                                    <td className="p-6 text-sm text-gray-600 max-w-xs truncate">{item.content}</td>
                                    <td className="p-6">
                                        <div className="flex items-center text-yellow-400">
                                            <span className="font-bold text-gray-900 mr-1 text-sm">{item.rating}</span>
                                            <Star className="w-4 h-4 fill-current" />
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {item.isActive ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-6 flex justify-end gap-2">
                                        <Link to={`/testimonials/edit/${item.id}`} className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors" title="Edit">
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

export default Testimonials;

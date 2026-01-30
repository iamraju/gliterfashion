
import React, { useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/backoffice';

const TestimonialForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;
    const { register, handleSubmit, setValue } = useForm();

    useEffect(() => {
        if (id) {
            fetchItem(id);
        }
    }, [id]);

    const fetchItem = async (itemId: string) => {
        try {
            const res = await axios.get(`${API_URL}/testimonials/${itemId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
            });
            const data = res.data;
            setValue('name', data.name);
            setValue('role', data.role);
            setValue('content', data.content);
            setValue('rating', data.rating);
            setValue('isActive', data.isActive);
        } catch (error) {
            console.error('Failed to fetch testimonial');
        }
    };

    const onSubmit = async (data: any) => {
        const payload = { ...data, rating: parseInt(data.rating) };
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/testimonials/${id}`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                });
                Swal.fire('Success', 'Updated', 'success');
            } else {
                await axios.post(`${API_URL}/testimonials`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                });
                Swal.fire('Success', 'Created', 'success');
            }
            navigate('/testimonials');
        } catch (error: any) {
             Swal.fire('Error', error.response?.data?.message || 'Failed to save', 'error');
        }
    };

    return (
         <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4">
                    <Link to="/testimonials" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Testimonial' : 'New Testimonial'}</h1>
                </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-2xl">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Customer Name</label>
                            <input 
                                {...register('name', { required: 'Name is required' })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Role (e.g. Verified Buyer)</label>
                            <input 
                                {...register('role')}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                        <textarea 
                            {...register('content', { required: 'Content is required' })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 h-24"
                        />
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Rating (1-5)</label>
                            <input 
                                type="number"
                                max={5}
                                min={1}
                                {...register('rating')}
                                defaultValue={5}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200"
                            />
                        </div>
                        <div className="flex-1 pt-8">
                             <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" {...register('isActive')} defaultChecked className="w-5 h-5 text-brand-primary rounded" />
                                <span className="font-bold text-gray-700">Active</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="submit" className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors">
                            {isEditing ? 'Update' : 'Create'}
                        </button>
                        <button type="button" onClick={() => navigate('/testimonials')} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default TestimonialForm;

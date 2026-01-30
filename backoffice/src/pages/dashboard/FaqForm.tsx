
import { useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/backoffice';

const FaqForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        if (id) {
            fetchFaq(id);
        }
    }, [id]);

    const fetchFaq = async (faqId: string) => {
        try {
            const res = await axios.get(`${API_URL}/faqs/${faqId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
            });
            const data = res.data;
            setValue('question', data.question);
            setValue('answer', data.answer);
            setValue('sortOrder', data.sortOrder);
            setValue('isActive', data.isActive);
        } catch (error) {
            console.error('Failed to fetch FAQ');
        }
    };

    const onSubmit = async (data: any) => {
        const payload = { ...data, sortOrder: parseInt(data.sortOrder) }; // Ensure number
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/faqs/${id}`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                });
                Swal.fire('Success', 'FAQ updated', 'success');
            } else {
                await axios.post(`${API_URL}/faqs`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                });
                Swal.fire('Success', 'FAQ created', 'success');
            }
            navigate('/faqs');
        } catch (error: any) {
             Swal.fire('Error', error.response?.data?.message || 'Failed to save FAQ', 'error');
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4">
                    <Link to="/faqs" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit FAQ' : 'New FAQ'}</h1>
                </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-2xl">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Question</label>
                        <input 
                            {...register('question', { required: 'Question is required' })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200"
                        />
                        {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question.message as string}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Answer</label>
                        <textarea 
                            {...register('answer', { required: 'Answer is required' })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 h-32"
                        />
                        {errors.answer && <p className="text-red-500 text-xs mt-1">{errors.answer.message as string}</p>}
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Sort Order</label>
                            <input 
                                type="number"
                                {...register('sortOrder')}
                                defaultValue={0}
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
                        <button type="button" onClick={() => navigate('/faqs')} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FaqForm;

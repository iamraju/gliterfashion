import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useNavigate, useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/backoffice';

// Custom Upload Adapter for CKEditor
class MyUploadAdapter {
    loader: any;
    constructor(loader: any) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file
            .then((file: any) => new Promise((resolve, reject) => {
                const data = new FormData();
                data.append('upload', file);
                
                axios.post(`${API_URL}/upload`, data, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}` 
                    }
                })
                .then(response => {
                    resolve({
                        default: response.data.url
                    });
                })
                .catch(error => {
                    reject(error);
                });
            }));
    }
}

function uploadPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
        return new MyUploadAdapter(loader);
    };
}

const PageForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [editorData, setEditorData] = useState('');
    const isEditing = !!id;

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    
    // Watch title to auto-generate slug
    const titleValue = watch('title');

    useEffect(() => {
        if (id) {
            fetchPage(id);
        }
    }, [id]);

    // Auto-generate slug if creating new page
    useEffect(() => {
        if (!id && titleValue) {
            const slug = titleValue
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setValue('slug', slug);
        }
    }, [titleValue, id, setValue]);

    const fetchPage = async (pageId: string) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_URL}/pages/${pageId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
            });
            const page = res.data;
            setValue('title', page.title);
            setValue('slug', page.slug);
            setValue('isActive', page.isActive);
            setEditorData(page.content);
        } catch (error) {
            console.error('Failed to fetch page');
            Swal.fire('Error', 'Failed to fetch page details', 'error');
            navigate('/pages');
        } finally {
             setIsLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        // Append editor data to form data
        const payload = { ...data, content: editorData };

        try {
            if (isEditing) {
                await axios.put(`${API_URL}/pages/${id}`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                });
                Swal.fire('Success', 'Page updated successfully', 'success');
            } else {
                await axios.post(`${API_URL}/pages`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                });
                Swal.fire('Success', 'Page created successfully', 'success');
            }
            navigate('/pages');
        } catch (error: any) {
             Swal.fire('Error', error.response?.data?.message || 'Failed to save page', 'error');
        }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/pages" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Page' : 'Create New Page'}</h1>
                </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                    {/* Main Content Area (2/3) */}
                    <div className="lg:col-span-2 p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Page Title</label>
                            <input 
                                {...register('title', { required: 'Title is required' })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all font-medium"
                                placeholder="Enter page title"
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                            <div className="prose max-w-none">
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={editorData}
                                    config={{
                                        extraPlugins: [uploadPlugin],
                                        toolbar: [
                                            'heading', '|',
                                            'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
                                            'outdent', 'indent', '|',
                                            'imageresize', 'uploadImage', 'insertTable', 'mediaEmbed', '|',
                                            'undo', 'redo'
                                        ]
                                    }}
                                    onChange={(event, editor) => {
                                        const data = editor.getData();
                                        setEditorData(data);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (1/3) */}
                    <div className="p-8 space-y-6 bg-gray-50/50 h-full">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Slug</label>
                            <input 
                                {...register('slug', { required: 'Slug is required' })}
                                placeholder="page-url-slug"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-white placeholder-gray-400 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Unique identifier for the URL.</p>
                            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message as string}</p>}
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-brand-primary transition-colors">
                                <input type="checkbox" {...register('isActive')} className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary" />
                                <span className="font-bold text-gray-700">Publish Page</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-2 px-1">If unchecked, page will only be visible to admins.</p>
                        </div>

                        <div className="pt-8 mt-auto">
                            <div className="flex flex-col gap-3">
                                <button type="submit" className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors shadow-lg shadow-gray-900/10">
                                    {isEditing ? 'Update Page' : 'Create Page'}
                                </button>
                                <button type="button" onClick={() => navigate('/pages')} className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-white transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PageForm;

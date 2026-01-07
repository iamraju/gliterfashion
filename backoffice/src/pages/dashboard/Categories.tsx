import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  FolderTree, 
  Folder, 
  Loader2, 
  AlertCircle,
  X,
  CheckCircle2,
  Layers,
  Upload,
  Image as ImageIcon,
  ChevronDown
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { categoriesApi, type Category } from '../../api/categories';
import Input from '../../components/ui/Input';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parentId: z.string().uuid('Invalid parent category').optional().or(z.string().length(0)),
  imageUrl: z.string().optional().or(z.string().length(0)),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  gender: z.enum(['MEN', 'WOMEN', 'UNISEX']).nullable().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Tree state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      isActive: true,
      sortOrder: 0,
      gender: null,
    },
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleExpand = (categoryId: string) => {
    setExpanded(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      reset({
        name: category.name,
        description: category.description || '',
        parentId: category.parentId || '',
        imageUrl: category.imageUrl || '',
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        gender: category.gender,
      });
      setPreviewUrl(category.imageUrl || null);
    } else {
      setEditingCategory(null);
      reset({
        name: '',
        description: '',
        parentId: '',
        imageUrl: '',
        isActive: true,
        sortOrder: 0,
        gender: null,
      });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onSubmit = async (data: CategoryFormValues) => {
    setFormLoading(true);
    setFieldErrors({});
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.parentId) formData.append('parentId', data.parentId);
      // Convert boolean to actual boolean value
      formData.append('isActive', data.isActive ? 'true' : 'false');
      // Convert number to string but ensure it's a valid number
      formData.append('sortOrder', data.sortOrder.toString());
      if (data.gender) formData.append('gender', data.gender);

      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData);
      } else {
        await categoriesApi.create(formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      // Handle validation errors
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        const errors: Record<string, string> = {};
        err.response.data.details.forEach((detail: any) => {
          if (detail.field && detail.message) {
            errors[detail.field] = detail.message;
          }
        });
        setFieldErrors(errors);
        setError(err.response?.data?.error || 'Validation failed. Please check the form.');
      } else {
        setError(err.response?.data?.message || 'Action failed');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoriesApi.delete(id);
      setIsDeleting(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  // Helper to flatten categories for search or flat list display
  const flattenCategories = (cats: Category[]): Category[] => {
    let result: Category[] = [];
    cats.forEach(cat => {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        result = [...result, ...flattenCategories(cat.children)];
      }
    });
    return result;
  };

  // Helper to flatten categories with depth for dropdown
  const flattenCategoriesWithDepth = (cats: Category[], depth = 0): { category: Category; depth: number }[] => {
    let result: { category: Category; depth: number }[] = [];
    cats.forEach(cat => {
      result.push({ category: cat, depth });
      if (cat.children && cat.children.length > 0) {
        result = [...result, ...flattenCategoriesWithDepth(cat.children, depth + 1)];
      }
    });
    return result;
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    // If searching, search in flattened list
    if (searchQuery) {
      const all = flattenCategories(categories);
      return all.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Otherwise return tree structure (top level)
    return categories;
  }, [categories, searchQuery]);

  const getParentName = (parentId?: string) => {
    if (!parentId) return null;
    // We need to find in all categories
    const all = flattenCategories(categories);
    return all.find(c => c.id === parentId)?.name;
  };

  // Recursive generic row renderer
  const renderCategoryRow = (category: Category, depth: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expanded[category.id];

    return (
      <React.Fragment key={category.id}>
        <tr 
          className={cn(
            "hover:bg-gray-50/80 transition-colors group border-b border-gray-50 last:border-b-0",
            hasChildren && "cursor-pointer"
          )}
          onClick={(e) => {
            // Prevent toggling if clicking on action buttons
            if ((e.target as HTMLElement).closest('button')) return;
            if (hasChildren) toggleExpand(category.id);
          }}
        >
          <td className="px-6 py-4">
            <div className="flex items-center" style={{ paddingLeft: `${depth * 28}px` }}>
               {/* Indent connector lines could go here if desired */}
               <div className="mr-3 w-6 flex justify-center flex-shrink-0">
                 {hasChildren && (
                   <button 
                     type="button"
                     onClick={(e) => {
                       e.stopPropagation();
                       toggleExpand(category.id);
                     }}
                     className={cn(
                       "p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all",
                       isExpanded && "bg-gray-100 text-gray-600 transform rotate-180"
                     )}
                   >
                     <ChevronDown size={18} className={cn("transition-transform duration-200", !isExpanded && "transform -rotate-90")} />
                   </button>
                 )}
               </div>
               
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 overflow-hidden flex-shrink-0 mr-4 shadow-sm group-hover:shadow-md transition-all">
                {category.imageUrl ? (
                  <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                ) : (
                  <Folder className="w-6 h-6 opacity-70" />
                )}
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900 text-base group-hover:text-brand-primary transition-colors">
                    {category.name}
                  </span>
                  {hasChildren && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold border border-gray-200">
                      {category.children?.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            {category.parentId ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                <Layers className="w-3 h-3 mr-1.5 text-gray-400" />
                {getParentName(category.parentId)}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                Root
              </span>
            )}
          </td>
          <td className="px-6 py-4">
            <span className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm",
              category.isActive 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-gray-50 text-gray-500 border-gray-200"
            )}>
              <CheckCircle2 className={cn("w-3 h-3 mr-1.5", !category.isActive && "opacity-50")} />
              {category.isActive ? 'Active' : 'Hidden'}
            </span>
          </td>
          <td className="px-6 py-4">
            {category.gender ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                {category.gender}
              </span>
            ) : (
              <span className="text-gray-400 text-xs">-</span>
            )}
          </td>
          <td className="px-6 py-4">
            <span className="text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
              {category.sortOrder}
            </span>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(category);
                }}
                className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-all"
                title="Edit Category"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleting(category.id);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        {/* Render Children */}
        {hasChildren && isExpanded && category.children?.map(child => renderCategoryRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-500 text-sm mt-1">Organize your products with hierarchical categories</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-gray-50/50">
          <div className="relative group max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-light rounded-xl outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">
               {searchQuery ? filteredCategories.length : flattenCategories(categories).length} 
            </span> categories found
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-gray-500 font-medium">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderTree className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No categories found matching your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {searchQuery 
                  ? filteredCategories.map(cat => renderCategoryRow(cat, 0)) /* Show flat list when searching */
                  : filteredCategories.map(cat => renderCategoryRow(cat, 0)) /* Show tree - internal recursion in renderCategoryRow handles children */
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Image Area */}
                <div className="lg:col-span-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                       Category Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                      <label
                        htmlFor="image-upload"
                        className={cn(
                          "flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all overflow-hidden",
                          previewUrl && "border-blue-200 bg-blue-50/30"
                        )}
                      >
                        {previewUrl ? (
                          <div className="relative group w-full h-full">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center p-4 text-center">
                            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center mb-3">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">Click to upload</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.imageUrl && (
                      <p className="text-xs text-red-600 mt-1">{errors.imageUrl.message}</p>
                    )}
                  </div>
                </div>

                {/* Right Column: Inputs */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-1">
                    <Input
                      {...register('name')}
                      label="Name"
                      placeholder="e.g. Mens Fashion"
                      error={errors.name?.message}
                    />
                  </div>
                  
                  <div className="sm:col-span-1 space-y-1.5 hidden-scrollbar">
                    <label className="block text-sm font-medium text-gray-700 ml-1">
                      Parent Category
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors">
                        <Layers className="h-5 w-5" />
                      </div>
                      <select
                        {...register('parentId')}
                        className="appearance-none block w-full pl-11 pr-10 py-3 border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all sm:text-sm bg-white hover:border-gray-400"
                      >
                        <option value="">None (Root Category)</option>
                        {flattenCategoriesWithDepth(categories)
                          .filter(item => item.category.id !== editingCategory?.id)
                          .map(item => (
                            <option key={item.category.id} value={item.category.id}>
                              {'\u00A0\u00A0\u00A0'.repeat(item.depth)}
                              {item.depth > 0 ? '└─ ' : ''}
                              {item.category.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <Input
                      type="number"
                      {...register('sortOrder', { valueAsNumber: true })}
                      label="Sort Order"
                      placeholder="0"
                      error={errors.sortOrder?.message || fieldErrors.sortOrder}
                    />
                  </div>

                   <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 ml-1">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm hover:border-gray-400 resize-none"
                      placeholder="Brief description of the category..."
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <input
                        type="checkbox"
                        id="isActive"
                        {...register('isActive')}
                        className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer"
                      />
                      <div className="ml-3">
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">
                          Active Status
                        </label>
                        <p className="text-xs text-gray-500">
                          If unchecked, this category will be hidden from the storefront.
                        </p>
                      </div>
                    </div>
                     {fieldErrors.isActive && (
                        <p className="text-xs text-red-600 ml-1 mt-1">{fieldErrors.isActive}</p>
                      )}
                  </div>
                  
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      Gender (Optional)
                    </label>
                    <select
                      {...register('gender')}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all sm:text-sm bg-white hover:border-gray-400"
                    >
                      <option value="">None (Universal)</option>
                      <option value="MEN">Men</option>
                      <option value="WOMEN">Women</option>
                      <option value="UNISEX">Unisex</option>
                    </select>
                  </div>

                </div>
              </div>

              <div className="pt-8 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 px-4 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-secondary rounded-xl shadow-lg shadow-brand-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingCategory ? 'Update Category' : 'Create Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleting && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsDeleting(null)} />
          <div className="bg-white rounded-3xl w-full max-sm shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-gray-500 text-sm">
                This will delete the category. Make sure it has no products or sub-categories assigned.
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex items-center space-x-3">
              <button
                onClick={() => setIsDeleting(null)}
                className="flex-1 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(isDeleting)}
                className="flex-1 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-100 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium text-sm">{error}</p>
          <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

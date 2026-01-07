import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle,
  X,
  Tag,
  List
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { attributesApi, type Attribute } from '../../api/attributes';
import Input from '../../components/ui/Input';

const attributeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  values: z.array(z.object({
    value: z.string().min(1, 'Value cannot be empty')
  })),
});

type AttributeFormValues = z.infer<typeof attributeSchema>;

const AttributesPage: React.FC = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      values: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "values"
  });

  // Watch name to auto-generate slug
  const watchedName = watch('name');

  useEffect(() => {
    if (watchedName && !editingAttribute) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', slug);
    }
  }, [watchedName, editingAttribute, setValue]);

  const fetchAttributes = async () => {
    setIsLoading(true);
    try {
      const data = await attributesApi.getAll();
      setAttributes(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch attributes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleOpenModal = (attribute?: Attribute) => {
    if (attribute) {
      setEditingAttribute(attribute);
      reset({
        name: attribute.name,
        slug: attribute.slug,
        values: attribute.values?.map(v => ({ value: v.value })) || [],
      });
    } else {
      setEditingAttribute(null);
      reset({
        name: '',
        slug: '',
        values: [],
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: AttributeFormValues) => {
    setFormLoading(true);
    setError(null);
    try {
      const formattedData = {
        name: data.name,
        slug: data.slug,
        values: data.values.map(v => v.value),
      };

      if (editingAttribute) {
        await attributesApi.update(editingAttribute.id, formattedData);
      } else {
        await attributesApi.create(formattedData);
      }
      setIsModalOpen(false);
      fetchAttributes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await attributesApi.delete(id);
      setIsDeleting(null);
      fetchAttributes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const filteredAttributes = attributes.filter(attr => 
    attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attr.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Attributes</h1>
          <p className="text-gray-500 text-sm mt-1">Manage variations like color, size, and material</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Attribute
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-gray-50/50">
          <div className="relative group max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
            <input
              type="text"
              placeholder="Search attributes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-light rounded-xl outline-none transition-all text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-gray-500 font-medium">Loading attributes...</p>
          </div>
        ) : filteredAttributes.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No attributes found</p>
            {searchQuery && <p className="text-gray-400 text-sm mt-1">Try adjusting your search terms</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Attribute Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Values</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAttributes.map((attr) => (
                  <tr key={attr.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 mr-3">
                          <Tag className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-gray-900">{attr.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 border border-gray-200">
                        {attr.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {attr.values?.slice(0, 3).map((val) => (
                          <span key={val.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100 font-medium">
                            {val.value}
                          </span>
                        ))}
                        {(attr.values?.length || 0) > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200 font-medium">
                            +{attr.values.length - 3} more
                          </span>
                        )}
                        {(!attr.values || attr.values.length === 0) && (
                          <span className="text-gray-400 text-xs italic">No values</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(attr)}
                          className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsDeleting(attr.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAttribute ? 'Edit Attribute' : 'Create Attribute'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="space-y-4">
                <Input
                  {...register('name')}
                  label="Attribute Name"
                  placeholder="e.g. Color, Size"
                  error={errors.name?.message}
                />
                
                <Input
                  {...register('slug')}
                  label="Slug"
                  placeholder="e.g. color"
                  error={errors.slug?.message}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Values</label>
                    <button
                      type="button"
                      onClick={() => append({ value: '' })}
                      className="text-sm text-brand-primary font-semibold hover:text-brand-secondary"
                    >
                      + Add Value
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Input
                          {...register(`values.${index}.value` as const)}
                          placeholder="Value (e.g. Red)"
                          error={errors.values?.[index]?.value?.message}
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl self-start mt-[1px]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {fields.length === 0 && (
                      <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <List className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No values added yet</p>
                        <button
                          type="button"
                          onClick={() => append({ value: '' })}
                          className="mt-2 text-sm text-brand-primary font-medium hover:underline"
                        >
                          Add first value
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
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
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingAttribute ? 'Update' : 'Create')}
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Attribute?</h3>
              <p className="text-gray-500 text-sm">
                This will permanently remove this attribute and all its values.
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
        <div className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right duration-300 z-50">
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

export default AttributesPage;

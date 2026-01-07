import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  Upload,
  X,
  Layers,
  RefreshCw,
  Check
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { productsApi } from '../../api/products';
import { categoriesApi, type Category } from '../../api/categories';
import { attributesApi, type Attribute } from '../../api/attributes';
import Input from '../../components/ui/Input';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// --- Types & Schemas ---

const variantSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  stockQuantity: z.number().min(0, 'Stock must be non-negative'),
  barcode: z.string().optional().nullable(),
  attributes: z.array(z.object({
    attributeId: z.string(),
    attributeValueId: z.string(),
    attributeName: z.string().optional(), // Helper for UI
    valueName: z.string().optional(), // Helper for UI
  }))
});

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  basePrice: z.number().min(0, 'Price must be positive'),
  salePrice: z.number().min(0, 'Sale price must be positive').optional().nullable(),
  sku: z.string().min(1, 'SKU is required'),
  status: z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED']),
  hasVariants: z.boolean(),
  variants: z.array(variantSchema).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);
  const [backendVariantError, setBackendVariantError] = useState<string | null>(null);
  
  // Image handling
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string; isPrimary: boolean; attributeValueId?: string | null }[]>([]);
  const [newImageMetadata, setNewImageMetadata] = useState<{ isPrimary: boolean; attributeValueId?: string | null }[]>([]);

  // Variant Configuration State
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({}); // attrId -> [valueIds]

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'DRAFT',
      hasVariants: false,
      basePrice: 0,
      variants: [],
    },
  });

  const { fields: variantFields, replace: replaceVariants } = useFieldArray({
    control,
    name: 'variants',
  });

  const hasVariants = watch('hasVariants');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [catsData, attrsData] = await Promise.all([
          categoriesApi.getAll(),
          attributesApi.getAll(),
        ]);
        setCategories(catsData);
        setAvailableAttributes(attrsData);

        if (isEditMode && id) {
          const product = await productsApi.getById(id);
          // Populate form
          setValue('name', product.name);
          setValue('description', product.description || '');
          setValue('categoryId', product.categoryId);
          setValue('basePrice', Number(product.basePrice));
          setValue('salePrice', product.salePrice ? Number(product.salePrice) : null);
          setValue('sku', product.sku);
          setValue('status', product.status);
          
          if (product.images) {
            setExistingImages(product.images.map((img: any) => ({
              id: img.id,
              url: img.imageUrl,
              isPrimary: img.isPrimary,
              attributeValueId: img.attributeValueId
            })));
          }

          if (product.variants && product.variants.length > 0) {
            setValue('hasVariants', true);
            // Map existing variants to form state
            const mappedVariants = product.variants.map(v => ({
              sku: v.sku,
              barcode: v.barcode || '',
              price: Number(v.price),
              stockQuantity: v.stockQuantity,
              attributes: (v.attributes || []).map((a: any) => ({
                attributeId: a.attributeId,
                attributeValueId: a.attributeValueId,
                attributeName: a.attribute?.name || '',
                valueName: a.attributeValue?.value || ''
              }))
            }));
            replaceVariants(mappedVariants);

            // Extract selected attributes and values for the generation UI
            const initialAttributeIds = new Set<string>();
            const initialValues: Record<string, string[]> = {};

            product.variants.forEach(v => {
              (v.attributes || []).forEach((attr: any) => {
                initialAttributeIds.add(attr.attributeId);
                if (!initialValues[attr.attributeId]) {
                  initialValues[attr.attributeId] = [];
                }
                if (!initialValues[attr.attributeId].includes(attr.attributeValueId)) {
                  initialValues[attr.attributeId].push(attr.attributeValueId);
                }
              });
            });

            setSelectedAttributeIds(Array.from(initialAttributeIds));
            setSelectedValues(initialValues);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to update data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, isEditMode, setValue]);

  // Image Upload Handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
      
      const newMeta = files.map((_, index) => ({ 
        isPrimary: selectedImages.length === 0 && existingImages.length === 0 && index === 0,
        attributeValueId: null 
      }));
      setNewImageMetadata(prev => [...prev, ...newMeta]);
    }
  };

  const removeSelectedImage = (index: number) => {
    URL.revokeObjectURL(previewImages[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setNewImageMetadata(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (id: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
  };

  const getAllSelectedValues = () => {
    const values: { id: string, name: string, attrName: string }[] = [];
    selectedAttributeIds.forEach(attrId => {
      const attr = availableAttributes.find(a => a.id === attrId);
      if (attr) {
        const selectedValueIds = selectedValues[attrId] || [];
        selectedValueIds.forEach(valId => {
           const val = attr.values.find(v => v.id === valId);
           if (val) {
             values.push({ id: val.id, name: val.value, attrName: attr.name });
           }
        });
      }
    });
    return values;
  };

  const updateExistingImageMeta = (imgId: string, attrValueId: string | null) => {
    setExistingImages(prev => prev.map(img => 
      img.id === imgId ? { ...img, attributeValueId: attrValueId } : img
    ));
  };

  const updateNewImageMeta = (index: number, attrValueId: string | null) => {
    setNewImageMetadata(prev => prev.map((meta, i) => 
      i === index ? { ...meta, attributeValueId: attrValueId } : meta
    ));
  };

  const setAsPrimary = (type: 'existing' | 'new', identifier: string | number) => {
    // Clear primary from existing
    setExistingImages(prev => prev.map(img => ({
      ...img,
      isPrimary: type === 'existing' && img.id === identifier
    })));

    // Clear primary from new
    setNewImageMetadata(prev => prev.map((meta, i) => ({
      ...meta,
      isPrimary: type === 'new' && i === identifier
    })));
  };

  const flattenCategories = (cats: Category[], depth = 0): { id: string; name: string; depth: number }[] => {
    let result: { id: string; name: string; depth: number }[] = [];
    cats.forEach(cat => {
      result.push({ id: cat.id, name: cat.name, depth });
      if (cat.children && cat.children.length > 0) {
        result = [...result, ...flattenCategories(cat.children, depth + 1)];
      }
    });
    return result;
  };

  // Variant Generation Logic
  const handleAttributeToggle = (attrId: string) => {
    if (selectedAttributeIds.includes(attrId)) {
      setSelectedAttributeIds(prev => prev.filter(id => id !== attrId));
      const newValues = { ...selectedValues };
      delete newValues[attrId];
      setSelectedValues(newValues);
    } else {
      setSelectedAttributeIds(prev => [...prev, attrId]);
    }
  };

  const handleValueToggle = (attrId: string, valueId: string) => {
    setSelectedValues(prev => {
      const current = prev[attrId] || [];
      if (current.includes(valueId)) {
        return { ...prev, [attrId]: current.filter(id => id !== valueId) };
      } else {
        return { ...prev, [attrId]: [...current, valueId] };
      }
    });
  };

  const generateVariants = () => {
    if (selectedAttributeIds.length === 0) return;

    // Get selected attributes objects to access names
    const attrs = selectedAttributeIds.map(id => availableAttributes.find(a => a.id === id)).filter(Boolean) as Attribute[];
    
    // Check for empty value selections
    const emptyAttributes = attrs.filter(attr => !selectedValues[attr.id] || selectedValues[attr.id].length === 0);
    if (emptyAttributes.length > 0) {
      setError(`Please select at least one value for: ${emptyAttributes.map(a => a.name).join(', ')}`);
      return;
    }

    // Prepare arrays of values for Cartesian product
    // We store object { attrId, valueId, attrName, valueName }
    const valueArrays = attrs.map(attr => {
      const selectedForThis = selectedValues[attr.id] || [];
      return selectedForThis.map(vId => {
        const valObj = attr.values.find(v => v.id === vId);
        return {
          attributeId: attr.id,
          attributeValueId: vId,
          attributeName: attr.name,
          valueName: valObj?.value || ''
        };
      });
    });

    // Cartesian product helper
    const cartesian = (arrays: any[]): any[][] => {
      return arrays.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())), [[]]);
    };

    const combinations = cartesian(valueArrays);
    const baseSku = getValues('sku') || 'SKU';
    const basePrice = getValues('basePrice') || 0;
    const currentVariants = getValues('variants') || [];

    const newVariants = combinations.map((combo: any[]) => {
      // combo is array of { attributeId, attributeValueId, attributeName, valueName }
      
      // Look for an existing variant with the exact same attribute combination
      const existingVariant = currentVariants.find(v => {
        if (v.attributes.length !== combo.length) return false;
        return v.attributes.every(attr => 
          combo.some(c => c.attributeId === attr.attributeId && c.attributeValueId === attr.attributeValueId)
        );
      });

      if (existingVariant) {
        return {
          ...existingVariant,
          attributes: combo // Ensure readable names are updated if needed
        };
      }

      const suffix = combo.map(c => c.valueName).join('-').toUpperCase();
      return {
        sku: `${baseSku}-${suffix}`,
        barcode: '',
        price: basePrice,
        stockQuantity: 0,
        attributes: combo
      };
    });

    replaceVariants(newVariants);
  };

  const onSubmit = async (data: ProductFormValues, saveAndClose = false) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: any = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        sku: data.sku,
        status: data.status,
      };

      if (data.hasVariants && data.variants) {
         payload.variants = data.variants.map(v => ({
           sku: v.sku,
           barcode: v.barcode || null,
           price: v.price,
           stockQuantity: v.stockQuantity,
           attributes: v.attributes.map(a => ({
             attributeId: a.attributeId,
             attributeValueId: a.attributeValueId
           }))
         }));
      }

      const formData = new FormData();
      // Append all scalar fields
      Object.keys(payload).forEach(key => {
        if (key === 'variants') {
           formData.append('variants', JSON.stringify(payload.variants)); 
        } else if (payload[key] !== undefined && payload[key] !== null) {
          formData.append(key, payload[key].toString());
        }
      });

      // Append images
      selectedImages.forEach((file) => {
        formData.append('images', file);
      });

      // Append image metadata for NEW images
      const normalizedNewMeta = newImageMetadata.map(meta => ({
          isPrimary: meta.isPrimary,
          attributeValueId: meta.attributeValueId
      }));
      formData.append('imageMetadata', JSON.stringify(normalizedNewMeta));

      // Append EXISTING images with their metadata
      const imagesPayload = existingImages.map(img => ({
          imageUrl: img.url.split('/').pop(), // filename
          isPrimary: img.isPrimary,
          attributeValueId: img.attributeValueId
      }));
      formData.append('images', JSON.stringify(imagesPayload));

       if (isEditMode && id) {
        await productsApi.update(id, formData);
        if (saveAndClose) {
          navigate('/products');
        } else {
          // If we stay on page, we might want to refresh data or just show success
          setError(null);
          // Optional: re-load data or show a success toast
        }
      } else {
        const product = await productsApi.create(formData);
        if (saveAndClose) {
          navigate('/products');
        } else {
          // If it was a create and we stay, we should navigate to the edit page of the new product
          navigate(`/products/edit/${product.id}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to save product';
      
      // If error is variant related, set specific variant error and a generic top-level error
      if (errorMessage.includes('barcode') || errorMessage.includes('SKU') || errorMessage.includes('variant')) {
        setBackendVariantError(errorMessage);
        setError('There are errors while saving the product');
      } else {
        setError(errorMessage);
        setBackendVariantError(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-none mx-auto space-y-6 pb-12">
       {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/products" className="p-2 hover:bg-white rounded-xl text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditMode ? 'Update product details and inventory' : 'Create a new product listing'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/products"
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-white text-brand-primary border border-brand-primary/20 font-semibold rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save
              </>
            )}
          </button>
          <button
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Save & Close
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center space-x-2 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Basic Details</h3>
            
            <Input
              {...register('name')}
              label="Product Name"
              placeholder="e.g. Classic Cotton T-Shirt"
              error={errors.name?.message}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 ml-1">
                Description
              </label>
               <div className="prose-sm max-w-none">
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <CKEditor
                          editor={ClassicEditor as any}
                          data={field.value || ''}
                          onChange={(_, editor) => {
                              const data = editor.getData();
                              field.onChange(data);
                          }}
                          config={{
                            toolbar: [
                              'heading',
                              '|',
                              'bold',
                              'italic',
                              'link',
                              'bulletedList',
                              'numberedList',
                              '|',
                              'outdent',
                              'indent',
                              '|',
                              'blockQuote',
                              'insertTable',
                              'mediaEmbed',
                              'undo',
                              'redo'
                            ]
                          }}
                      />
                    )}
                />
               </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Product Images</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Image Upload Button */}
              <div className="relative aspect-square">
                 <input
                  type="file"
                  id="product-images"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <label
                  htmlFor="product-images"
                  className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-all text-gray-400 hover:text-brand-primary hover:border-brand-primary/50"
                >
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs font-semibold">Upload</span>
                </label>
              </div>

               {/* Existing Images */}
               {existingImages.map((img) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                   <div className="aspect-square">
                     <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                   </div>
                   <button
                     type="button"
                     onClick={() => removeExistingImage(img.id)}
                     className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                   >
                     <X className="w-4 h-4" />
                   </button>
                   {img.isPrimary ? (
                     <div className="absolute top-1 left-1 px-2 py-0.5 bg-brand-primary/90 text-white text-[10px] font-bold rounded z-10">
                       Primary
                     </div>
                   ) : (
                     <button
                       type="button"
                       onClick={() => setAsPrimary('existing', img.id)}
                       className="absolute top-1 left-1 px-2 py-0.5 bg-white/80 text-gray-600 text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-white"
                     >
                       Set Primary
                     </button>
                   )}
                   <div className="p-2">
                     <select 
                       className="w-full text-[10px] border-none bg-white rounded p-1 focus:ring-1 focus:ring-brand-primary"
                       value={img.attributeValueId || ''}
                       onChange={(e) => updateExistingImageMeta(img.id, e.target.value || null)}
                     >
                       <option value="">Global Image</option>
                       {getAllSelectedValues().map(v => (
                         <option key={v.id} value={v.id}>{v.attrName}: {v.name}</option>
                       ))}
                     </select>
                   </div>
                 </div>
              ))}

              {/* New Previews */}
               {previewImages.map((url, idx) => (
                 <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                   <div className="aspect-square">
                     <img src={url} alt="Preview" className="w-full h-full object-cover" />
                   </div>
                   <button
                     type="button"
                     onClick={() => removeSelectedImage(idx)}
                     className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                   >
                     <X className="w-4 h-4" />
                   </button>
                   {newImageMetadata[idx]?.isPrimary ? (
                     <div className="absolute top-1 left-1 px-2 py-0.5 bg-brand-primary/90 text-white text-[10px] font-bold rounded z-10">
                       Primary
                     </div>
                   ) : (
                     <button
                       type="button"
                       onClick={() => setAsPrimary('new', idx)}
                       className="absolute top-1 left-1 px-2 py-0.5 bg-white/80 text-gray-600 text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-white"
                     >
                       Set Primary
                     </button>
                   )}
                   <div className="p-2">
                     <select 
                       className="w-full text-[10px] border-none bg-white rounded p-1 focus:ring-1 focus:ring-brand-primary"
                       value={newImageMetadata[idx]?.attributeValueId || ''}
                       onChange={(e) => updateNewImageMeta(idx, e.target.value || null)}
                     >
                       <option value="">Global Image</option>
                       {getAllSelectedValues().map(v => (
                         <option key={v.id} value={v.id}>{v.attrName}: {v.name}</option>
                       ))}
                     </select>
                   </div>
                 </div>
               ))}
            </div>
            <p className="text-xs text-gray-500">
              Supported formats: JPG, PNG. Recommended size: 1000x1000px.
            </p>
          </div>

          {/* Variants Configuration */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">Product Variants</h3>
                    <p className="text-sm text-gray-500">Manage size, color, and other options</p>
                </div>
                <label className="flex items-center space-x-3 cursor-pointer bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all hover:border-brand-primary/30">
                    <input
                      type="checkbox"
                      {...register('hasVariants')}
                      className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary transition-all"
                    />
                     <span className="text-sm font-semibold text-gray-900">Enable Variants</span>
                </label>
              </div>

               {hasVariants && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                        {/* Attribute & Value Selection */}
                        <div className="md:col-span-3 space-y-6">
                            {/* Attribute Selection */}
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700 flex items-center">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] mr-2">1</span>
                                    Select Attributes
                                </label>
                                <div className="flex flex-wrap gap-2.5">
                                {availableAttributes.map(attr => (
                                    <button
                                    key={attr.id}
                                    type="button"
                                    onClick={() => handleAttributeToggle(attr.id)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                                        selectedAttributeIds.includes(attr.id)
                                        ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20 scale-[1.02]'
                                        : 'bg-white text-gray-600 border-gray-100 hover:border-brand-primary/30 hover:bg-brand-light/20'
                                    }`}
                                    >
                                    {attr.name}
                                    </button>
                                ))}
                                </div>
                            </div>

                            {/* Values Selection */}
                            {selectedAttributeIds.length > 0 && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                <label className="block text-sm font-bold text-gray-700 flex items-center">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] mr-2">2</span>
                                    Select Values
                                </label>
                                <div className="space-y-3">
                                    {selectedAttributeIds.map(attrId => {
                                    const attr = availableAttributes.find(a => a.id === attrId);
                                    if (!attr) return null;
                                    return (
                                        <div key={attr.id} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/80">
                                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{attr.name}</span>
                                        <div className="flex flex-wrap gap-2">
                                            {attr.values.map(val => (
                                            <button
                                                key={val.id}
                                                type="button"
                                                onClick={() => handleValueToggle(attr.id, val.id)}
                                                className={`px-4 py-2 rounded-xl text-sm transition-all font-medium ${
                                                selectedValues[attr.id]?.includes(val.id)
                                                    ? 'bg-white shadow-sm ring-2 ring-brand-primary text-brand-primary'
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-primary/30'
                                                }`}
                                            >
                                                {val.value}
                                            </button>
                                            ))}
                                        </div>
                                        </div>
                                    );
                                    })}
                                </div>
                                </div>
                            )}
                        </div>

                        {/* Sticky Generation Sidebar */}
                        <div className="md:sticky md:top-4 bg-brand-light/30 border-2 border-brand-primary/10 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-brand-primary">
                                <RefreshCw className={`w-6 h-6 ${selectedAttributeIds.length > 0 ? 'animate-spin-slow' : ''}`} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Update Table</h4>
                                <p className="text-[11px] text-gray-500 mt-1">Regenerate current combinations or add new ones</p>
                            </div>
                            <button
                                type="button"
                                onClick={generateVariants}
                                disabled={selectedAttributeIds.length === 0}
                                className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
                            >
                                <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                Populate Table
                            </button>
                            {selectedAttributeIds.length > 0 && (
                                <div className="inline-flex items-center text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-brand-primary/10">
                                    Changes Detected
                                </div>
                            )}
                        </div>
                     </div>

                   {/* Variants Table Header */}
                   {variantFields.length > 0 && (
                     <div className="border-t border-gray-100 pt-6">
                        <label className="block text-sm font-bold text-gray-700 flex items-center mb-4">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] mr-2">3</span>
                            Manage Variants ({variantFields.length})
                        </label>

                         {/* Variant Specific Errors */}
                         {backendVariantError ? (
                           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
                             <div className="p-2 bg-red-100 rounded-xl">
                               <X className="w-4 h-4 text-red-600" />
                             </div>
                             <div>
                               <p className="text-sm font-bold text-red-900">Variant Issue Detected</p>
                               <p className="text-sm text-red-700 mt-1">{backendVariantError}</p>
                             </div>
                           </div>
                         ) : null}
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 font-medium text-gray-500">Variant</th>
                              <th className="px-4 py-3 font-medium text-gray-500 w-48">SKU</th>
                              <th className="px-4 py-3 font-medium text-gray-500 w-48">Barcode (UPC/EAN)</th>
                              <th className="px-4 py-3 font-medium text-gray-500 w-24">Price</th>
                              <th className="px-4 py-3 font-medium text-gray-500 w-32">Stock</th>
                              <th className="px-4 py-3 font-medium text-gray-500 w-10"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {variantFields.map((field, index) => (
                              <tr key={field.id} className="group bg-white hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {field.attributes.map((attr, idx) => (
                                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {attr.attributeName}: {attr.valueName}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                      {...register(`variants.${index}.sku`)}
                                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm text-gray-900 placeholder-gray-400 relative z-10 pointer-events-auto"
                                      placeholder="SKU"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                   <input
                                    type="number"
                                    step="0.01"
                                    {...register(`variants.${index}.price`, { valueAsNumber: true })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm text-gray-900 placeholder-gray-400 relative z-10 pointer-events-auto"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                   <input
                                    type="number"
                                    {...register(`variants.${index}.stockQuantity`, { valueAsNumber: true })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm text-gray-900 placeholder-gray-400 relative z-10 pointer-events-auto"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                      {...register(`variants.${index}.barcode`)}
                                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm text-gray-900 placeholder-gray-400 relative z-10 pointer-events-auto"
                                      placeholder="Barcode"
                                    />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {/* <button type="button" onClick={() => removeVariant(index)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button> */}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                   )}
                 </div>
               )}
            </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Organization</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 ml-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all sm:text-sm bg-white hover:border-gray-400"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </select>
              </div>

               <div className="space-y-1.5 hidden-scrollbar">
                <label className="block text-sm font-medium text-gray-700 ml-1">
                  Category
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors">
                    <Layers className="h-5 w-5" />
                  </div>
                  <select
                    {...register('categoryId')}
                    className="appearance-none block w-full pl-11 pr-10 py-3 border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all sm:text-sm bg-white hover:border-gray-400"
                  >
                    <option value="">Select Category</option>
                    {flattenCategories(categories).map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {'\u00A0\u00A0\u00A0'.repeat(cat.depth)}
                        {cat.depth > 0 ? '└─ ' : ''}
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                 {errors.categoryId && (
                  <p className="text-xs text-red-600 ml-1">{errors.categoryId.message}</p>
                )}
              </div>
            </div>
          </div>
          
           {/* Pricing & Inventory - Moved Here */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Pricing & Inventory</h3>
            
            <div className="space-y-4">
              <Input
                type="number"
                 step="0.01"
                {...register('basePrice', { valueAsNumber: true })}
                label="Base Price"
                placeholder="0.00"
                error={errors.basePrice?.message}
              />
              <Input
                type="number"
                 step="0.01"
                {...register('salePrice', { valueAsNumber: true })}
                label="Sale Price"
                placeholder="0.00"
                error={errors.salePrice?.message}
              />
              <Input
                {...register('sku')}
                label="SKU (Stock Keeping Unit)"
                placeholder="e.g. SHT-001"
                error={errors.sku?.message}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductForm;

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2,
  Package,
  Check,
  X,
  AlertCircle,
  Save,
  Layers,
  Eye,
  EyeOff,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Bubble Waffle',
  'Add-On',
  'The Big Hero Bread',
  'Fruitella',
  'Croissants',
  'Bun & Choco',
  'Melt-In Moments'
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: CATEGORIES[0],
    description: '',
    image: '',
    availability: true
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    console.log('AdminProducts mounted successfully');
    return () => console.log('AdminProducts unmounting');
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/admin/all');
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Title safe string validation
    const title = String(formData.title || '').trim();
    if (!title) {
      toast.error('Product title is required');
      return;
    }

    // Price must be a number, do not call trim on it
    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Price must be a valid number greater than 0');
      return;
    }

    const payload = {
      title: title,
      price: priceNum,
      category: String(formData.category || '').trim(),
      description: String(formData.description || '').trim(),
      image: String(formData.image || '').trim(),
      availability: Boolean(formData.availability)
    };

    setSubmitLoading(true);
    try {
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, payload);
        if (res.data.success) {
          setProducts(prev => prev.map(p => p._id === editingProduct._id ? res.data.product : p));
          toast.success('Product updated! ✨');
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data.success) {
          setProducts([res.data.product, ...products]);
          toast.success('New dessert created! 🍰');
        }
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', price: '', category: CATEGORIES[0], description: '', image: '', availability: true });
    setEditingProduct(null);
    setIsPanelOpen(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description || '',
      image: product.image || '',
      availability: product.availability
    });
    setIsPanelOpen(true);
  };

  const toggleAvailability = async (id) => {
    try {
      const res = await api.put(`/products/${id}/toggle`);
      if (res.data.success) {
        setProducts(prev => prev.map(p => p._id === id ? { ...p, availability: res.data.newAvailability } : p));
        toast.success(res.data.newAvailability ? 'Dessert is now visible' : 'Dessert is hidden');
      }
    } catch (err) {
      toast.error('Status toggle failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        if (res.data.softDeleted) {
          setProducts(prev => prev.map(p => p._id === id ? { ...p, availability: false } : p));
          toast('Hidden instead of deleted (has order history)', { icon: '🛡️' });
        } else {
          setProducts(prev => prev.filter(p => p._id !== id));
          toast.success('Product deleted permanently');
        }
      }
    } catch (err) {
      toast.error('Delete operation failed');
    }
  };

  if (loading) return (
    <AdminLayout>
       <div className="flex flex-col gap-10">
          <div className="h-20 bg-white rounded-3xl animate-pulse" />
          <div className="h-[600px] bg-white rounded-[3rem] animate-pulse" />
       </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div className="space-y-1">
           <h1 className="text-4xl font-playfair font-extrabold text-slate-950">Catalog Management</h1>
           <p className="text-gray-400 font-medium">Create, update and manage your dessert menu availability.</p>
        </div>
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all shadow-2xl shadow-slate-900/10 active:scale-95 group"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" /> New Dessert
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Products Table Area */}
        <div className={`${isPanelOpen ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500`}>
           <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                          <th className="px-10 py-8">#</th>
                          <th className="px-10 py-8">Dessert Content</th>
                          <th className="px-10 py-8">Financials</th>
                          <th className="px-10 py-8">Visibility</th>
                          <th className="px-10 py-8">Performance</th>
                          <th className="px-10 py-8 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {products.map((product, index) => (
                         <tr key={product._id} className={`group hover:bg-gray-50 transition-colors ${!product.availability ? 'bg-gray-50/50 grayscale-[0.3]' : ''}`}>
                            <td className="px-10 py-8 text-gray-300 font-bold text-xs">{index + 1}</td>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform duration-500">
                                     {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : '🍰'}
                                  </div>
                                  <div>
                                     <p className="font-black text-slate-900 leading-tight group-hover:text-amber-600 transition-colors">{product.title}</p>
                                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{product.category}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <p className="text-xl font-bold text-slate-950">₹{product.price}</p>
                               <p className="text-[9px] text-gray-300 font-black uppercase mt-1">Retail Price</p>
                            </td>
                            <td className="px-10 py-8">
                               <button 
                                 onClick={() => toggleAvailability(product._id)}
                                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                    product.availability 
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                 }`}
                               >
                                  {product.availability ? <Eye size={12} /> : <EyeOff size={12} />}
                                  {product.availability ? 'Public' : 'Hidden'}
                               </button>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl w-fit">
                                  <Layers size={14} /> {product.orderCount || 0} Sold
                               </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                               <div className="flex justify-end gap-3">
                                  <button onClick={() => handleEdit(product)} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-blue-500 hover:border-blue-500 rounded-2xl transition-all shadow-sm">
                                     <Edit2 size={18} />
                                  </button>
                                  <button onClick={() => handleDelete(product._id, product.title)} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-500 rounded-2xl transition-all shadow-sm">
                                     <Trash2 size={18} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Right Form Panel */}
        {isPanelOpen && (
           <div className="lg:col-span-4 animate-in slide-in-from-right duration-500 sticky top-32">
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-10 space-y-10">
                 <div className="flex justify-between items-center">
                    <div>
                       <h2 className="text-2xl font-playfair font-extrabold text-slate-950">{editingProduct ? 'Edit Product' : 'New Dessert'}</h2>
                       <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Details & Media</p>
                    </div>
                    <button onClick={resetForm} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                       <X size={20} />
                    </button>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Product Title *</label>
                       <input 
                         required
                         value={formData.title}
                         onChange={(e) => setFormData({...formData, title: e.target.value})}
                         className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/5 transition-all font-bold text-slate-950"
                         placeholder="E.g. Strawberry Croissant"
                       />
                       <p className="text-[10px] text-gray-300 font-bold text-right">{formData.title.length}/200</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Price (₹) *</label>
                          <input 
                            required
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/5 transition-all font-bold text-slate-950"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Category *</label>
                          <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/5 transition-all font-bold text-slate-950 cursor-pointer appearance-none"
                          >
                             {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Image Media URL</label>
                       <div className="relative group">
                          <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input 
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/5 transition-all font-medium text-slate-950"
                            placeholder="https://..."
                          />
                       </div>
                       {formData.image && formData.image.startsWith('http') && (
                          <div className="mt-4 rounded-2xl overflow-hidden border-4 border-gray-50 aspect-video bg-gray-50 flex items-center justify-center">
                             <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                          </div>
                       )}
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Description ({formData.description.length}/500)</label>
                       <textarea 
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-medium resize-none min-h-[120px]"
                          placeholder="Describe the flavors..."
                       />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                       <div>
                          <p className="text-sm font-bold text-slate-900">Visibility Status</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Public Ordering</p>
                       </div>
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, availability: !formData.availability})}
                         className={`w-14 h-7 rounded-full relative transition-all duration-300 ${formData.availability ? 'bg-emerald-500' : 'bg-gray-300'}`}
                       >
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${formData.availability ? 'left-8' : 'left-1'}`} />
                       </button>
                    </div>

                    <div className="flex flex-col gap-4">
                       <button 
                         type="submit" 
                         disabled={submitLoading}
                         className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-bold text-lg hover:bg-amber-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-slate-900/10 group active:scale-95"
                       >
                          {submitLoading ? <Loader2 className="animate-spin" /> : <Save size={24} className="group-hover:scale-110 transition-transform" />}
                          {editingProduct ? 'Update Dessert' : 'Create Dessert'}
                       </button>
                       <button 
                         type="button"
                         onClick={resetForm}
                         className="w-full py-4 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-all"
                       >
                          Clear Changes
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        )}
      </div>
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2,
  Package,
  ImageIcon,
  Check,
  X,
  AlertCircle,
  Save,
  Layers,
  IndianRupee,
  Eye,
  EyeOff
} from 'lucide-react';

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
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: '' });

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
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title || formData.title.length < 2 || formData.title.length > 200) errors.title = 'Title must be 2-200 chars';
    if (!formData.price || isNaN(formData.price) || formData.price < 1 || formData.price > 10000) errors.price = 'Price must be 1-10,000';
    if (!formData.category) errors.category = 'Category is required';
    if (formData.description && formData.description.length > 500) errors.description = 'Max 500 chars';
    if (formData.image && !formData.image.startsWith('http')) errors.image = 'Must be a valid URL';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, formData);
        if (res.data.success) {
          setProducts(prev => prev.map(p => p._id === editingProduct._id ? res.data.product : p));
          alert('Product updated!');
        }
      } else {
        const res = await api.post('/products', formData);
        if (res.data.success) {
          setProducts([res.data.product, ...products]);
          alert('Product created!');
        }
      }
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', price: '', category: CATEGORIES[0], description: '', image: '', availability: true });
    setEditingProduct(null);
    setFormErrors({});
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
      }
    } catch (err) {
      alert('Toggle failed');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete(`/products/${deleteModal.productId}`);
      if (res.data.success) {
        if (res.data.softDeleted) {
          setProducts(prev => prev.map(p => p._id === deleteModal.productId ? { ...p, availability: false } : p));
          alert('Product has orders, so it was hidden instead of deleted.');
        } else {
          setProducts(prev => prev.filter(p => p._id !== deleteModal.productId));
          alert('Product deleted permanently.');
        }
      }
      setDeleteModal({ isOpen: false, productId: null, productName: '' });
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-amber-600" size={48} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-slate-900">Products Menu</h1>
          <p className="text-slate-500 mt-2">Manage your dessert offerings and availability.</p>
        </div>
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group"
        >
          <Plus size={24} className="transition-transform group-hover:rotate-90" /> Add New Dessert
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Products List */}
        <div className={`transition-all duration-500 ${isPanelOpen ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-8 py-6">Product</th>
                    <th className="px-8 py-6">Category</th>
                    <th className="px-8 py-6">Price</th>
                    <th className="px-8 py-6">Stats</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map((product) => (
                    <tr key={product._id} className={`hover:bg-slate-50 transition-colors ${!product.availability ? 'bg-slate-50/50 grayscale-[0.5]' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={product.image} alt={product.title} className="w-14 h-14 rounded-2xl object-cover border border-slate-100" />
                          <span className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{product.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">{product.category}</td>
                      <td className="px-8 py-6 font-bold text-slate-900">₹{product.price}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit">
                          <Layers size={12} /> {product.orderCount || 0} Orders
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => toggleAvailability(product._id)}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            product.availability 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {product.availability ? <Eye size={12} /> : <EyeOff size={12} />}
                          {product.availability ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(product)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => setDeleteModal({ isOpen: true, productId: product._id, productName: product.title })} 
                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
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

        {/* Side Form Panel */}
        {isPanelOpen && (
          <div className="lg:col-span-4 animate-in slide-in-from-right duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 sticky top-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-playfair font-bold text-slate-900">
                  {editingProduct ? 'Edit Product' : 'New Dessert'}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Title</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 ${formErrors.title ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="E.g. Strawberry Croissant"
                  />
                  {formErrors.title && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{formErrors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Price (₹)</label>
                    <input 
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 ${formErrors.price ? 'border-red-500' : 'border-slate-200'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Image URL</label>
                  <input 
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 ${formErrors.image ? 'border-red-500' : 'border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Description ({formData.description.length}/500)</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 h-24 resize-none ${formErrors.description ? 'border-red-500' : 'border-slate-200'}`}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="text-xs font-bold text-slate-600">Available to customers?</span>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, availability: !formData.availability})}
                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.availability ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.availability ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={submitLoading}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitLoading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        title="Delete Product?"
        message={`Are you sure you want to delete "${deleteModal.productName}"? This action cannot be undone unless the product has order history, in which case it will be hidden.`}
        confirmText="Yes, Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
      />
    </AdminLayout>
  );
}


import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils/math';
// Add missing Package icon import
import { Plus, Trash2, Edit2, Check, X, Package } from 'lucide-react';

interface ProductManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, setProducts }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const DEFAULT_DISCOUNT_VAL = 8.39;

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    code: '',
    name: '',
    packagingSize: 1,
    basePrice: 0,
    defaultDiscount: DEFAULT_DISCOUNT_VAL
  });

  const handleSave = () => {
    if (!formData.name || !formData.code) return;

    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
      setEditingId(null);
    } else {
      setProducts(prev => [...prev, { ...formData, id: Date.now().toString() }]);
      setIsAdding(false);
    }
    
    setFormData({ 
      code: '', 
      name: '', 
      packagingSize: 1, 
      basePrice: 0, 
      defaultDiscount: DEFAULT_DISCOUNT_VAL 
    });
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData({ ...p });
    setIsAdding(false);
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 mb-2 px-1">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Inventory Management</h2>
          <div className="flex gap-2">
             <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#7A2B83] text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-[#7A2B83]/30 border-b-4 border-black/10 active:scale-95 transition-all"
            >
              <Plus size={14} strokeWidth={3} className="text-[#F9E219]" /> New Product
            </button>
          </div>
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-[#7A2B83]/10 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-[#7A2B83] uppercase tracking-widest text-sm">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Product Name</label>
                <input 
                placeholder="e.g. Acephate 1kg"
                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-bold focus:border-[#7A2B83] focus:ring-4 focus:ring-[#7A2B83]/10 shadow-inner"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Stock Code</label>
                <input 
                    placeholder="75150"
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold focus:border-[#7A2B83] shadow-inner"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Pkg Size</label>
                <input 
                    type="number"
                    placeholder="10"
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold focus:border-[#7A2B83] shadow-inner"
                    value={formData.packagingSize || ''}
                    onChange={e => setFormData({ ...formData, packagingSize: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Base Price</label>
                <input 
                    type="number"
                    placeholder="3800"
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold focus:border-[#7A2B83] shadow-inner"
                    value={formData.basePrice || ''}
                    onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Default %</label>
                <input 
                    type="number"
                    placeholder="8.39"
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold focus:border-[#7A2B83] shadow-inner"
                    value={formData.defaultDiscount || ''}
                    onChange={e => setFormData({ ...formData, defaultDiscount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="w-full bg-[#7A2B83] text-white font-black py-4 rounded-2xl shadow-xl hover:bg-[#68246f] transition-all flex items-center justify-center gap-2 uppercase tracking-widest border-b-4 border-black/20"
          >
            <Check size={20} strokeWidth={3} className="text-[#F9E219]" /> {editingId ? 'Update Item' : 'Create Product'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] shadow-inner">
            <Package size={56} className="mx-auto mb-4 text-[#7A2B83] opacity-5" />
            <p className="font-black uppercase text-xs tracking-widest text-slate-400">Inventory Empty</p>
          </div>
        ) : (
          products.map(p => (
            <div key={p.id} className="bg-white p-5 rounded-[2rem] border-2 border-slate-100 shadow-lg flex items-center justify-between group hover:border-[#7A2B83]/20 transition-all">
              <div className="flex-1">
                <p className="font-black text-slate-800 uppercase tracking-tight">{p.name}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[9px] px-2.5 py-1 bg-[#F9E219] rounded-full font-black text-[#7A2B83] border border-[#7A2B83]/10">{p.code}</span>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Box: {p.packagingSize}</span>
                  <span className="text-[10px] text-[#7A2B83] font-black uppercase tracking-tighter">{formatCurrency(p.basePrice)}</span>
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-md">{p.defaultDiscount}% off</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => startEdit(p)} className="p-3 text-slate-400 hover:text-[#7A2B83] bg-slate-50 hover:bg-[#F9E219]/20 rounded-xl transition-all shadow-sm">
                  <Edit2 size={16} strokeWidth={3} />
                </button>
                <button onClick={() => deleteProduct(p.id)} className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl transition-all shadow-sm">
                  <Trash2 size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductManager;

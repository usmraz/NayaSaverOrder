import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils/math';
import { Plus, Trash2, Edit2, Check, X, Package, Search, RotateCcw } from 'lucide-react';

interface ProductManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

interface ProductFormProps {
  title: string;
  isEdit?: boolean;
  formData: Omit<Product, 'id'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<Product, 'id'>>>;
  onSave: () => void;
  onCancel: () => void;
}

// Defining this outside prevents React from re-creating the component type on every render
const ProductForm: React.FC<ProductFormProps> = ({ title, isEdit, formData, setFormData, onSave, onCancel }) => (
  <div className={`p-6 rounded-[2.5rem] border-2 shadow-2xl space-y-5 transition-all animate-in zoom-in-95 duration-200 ${
    isEdit 
      ? 'bg-[#7A2B83]/5 dark:bg-[#7A2B83]/20 border-[#7A2B83] dark:border-[#F9E219]/40' 
      : 'bg-white dark:bg-[#1A0B1E] border-[#7A2B83]/10 dark:border-slate-800'
  }`}>
    <div className="flex justify-between items-center">
      <h3 className="font-black text-[#7A2B83] dark:text-[#F9E219] uppercase tracking-widest text-sm">{title}</h3>
      <button 
        onClick={onCancel} 
        className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-900 rounded-xl transition-all"
      >
        <X size={20} />
      </button>
    </div>
    <div className="space-y-4">
      <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Product Identity</label>
          <input 
            placeholder="Product Name"
            className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:border-[#7A2B83] shadow-inner"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">System Code</label>
          <input 
              placeholder="Code"
              className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold focus:border-[#7A2B83] dark:text-white shadow-inner"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Units/Box</label>
          <input 
              type="number"
              placeholder="Qty"
              className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold focus:border-[#7A2B83] dark:text-white shadow-inner"
              value={formData.packagingSize || ''}
              onChange={e => setFormData({ ...formData, packagingSize: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Base Price (PKR)</label>
          <input 
              type="number"
              placeholder="Price"
              className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold focus:border-[#7A2B83] dark:text-white shadow-inner"
              value={formData.basePrice || ''}
              onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Default Disc %</label>
          <input 
              type="number"
              placeholder="Disc %"
              className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold focus:border-[#7A2B83] dark:text-white shadow-inner"
              value={formData.defaultDiscount || ''}
              onChange={e => setFormData({ ...formData, defaultDiscount: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <button 
        onClick={onCancel}
        className="w-full bg-slate-100 dark:bg-slate-900 text-slate-500 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px]"
      >
        Discard
      </button>
      <button 
        onClick={onSave}
        className="w-full bg-[#7A2B83] text-white font-black py-4 rounded-2xl shadow-xl hover:bg-[#68246f] transition-all flex items-center justify-center gap-2 uppercase tracking-widest border-b-4 border-black/20"
      >
        <Check size={18} strokeWidth={3} className="text-[#F9E219]" /> {isEdit ? 'Save Changes' : 'Add Product'}
      </button>
    </div>
  </div>
);

const ProductManager: React.FC<ProductManagerProps> = ({ products, setProducts }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const DEFAULT_DISCOUNT_VAL = 8.39;

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    code: '',
    name: '',
    packagingSize: 1,
    basePrice: 0,
    defaultDiscount: DEFAULT_DISCOUNT_VAL
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleSave = () => {
    if (!formData.name || !formData.code) return;

    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
      setEditingId(null);
    } else {
      setProducts(prev => [...prev, { ...formData, id: Date.now().toString() }]);
      setIsAdding(false);
    }
    
    resetForm();
  };

  const resetForm = () => {
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

  const cancelEditOrAdd = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Search and Action Bar */}
      <div className="sticky top-20 z-40 bg-white/80 dark:bg-[#0B010C]/80 backdrop-blur-md p-4 -mx-4 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em] flex items-center gap-2">
              <Package size={18} className="text-[#7A2B83] dark:text-[#F9E219]" />
              Inventory Master
            </h2>
            <button 
              onClick={() => {
                setIsAdding(true);
                setEditingId(null);
                resetForm();
              }}
              className="bg-[#7A2B83] text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-[#7A2B83]/20 border-b-4 border-black/10 active:scale-95 transition-all"
            >
              <Plus size={14} strokeWidth={3} className="text-[#F9E219]" /> New Entry
            </button>
          </div>

          <div className="relative">
            <input 
              type="text"
              placeholder="Filter products by name or code..."
              className="w-full p-4 pl-12 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold placeholder-slate-400 focus:border-[#7A2B83] transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#7A2B83]"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <ProductForm 
            title="Create New Product" 
            formData={formData} 
            setFormData={setFormData} 
            onSave={handleSave} 
            onCancel={cancelEditOrAdd} 
          />
        </div>
      )}

      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-[#1A0B1E] border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3.5rem] shadow-inner">
            <Package size={56} className="mx-auto mb-4 text-[#7A2B83] opacity-5" />
            <p className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-400">
              {searchTerm ? 'No matches found' : 'Inventory is empty'}
            </p>
          </div>
        ) : (
          filteredProducts.map(p => (
            <div key={p.id}>
              {editingId === p.id ? (
                <div className="my-4">
                  <ProductForm 
                    title={`Modifying: ${p.name}`} 
                    isEdit 
                    formData={formData} 
                    setFormData={setFormData} 
                    onSave={handleSave} 
                    onCancel={cancelEditOrAdd} 
                  />
                </div>
              ) : (
                <div className="bg-white dark:bg-[#1A0B1E] p-5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-lg flex items-center justify-between group hover:border-[#7A2B83]/30 transition-all hover:shadow-xl">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight truncate text-sm">{p.name}</p>
                      {searchTerm && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())) && (
                        <div className="h-1.5 w-1.5 rounded-full bg-[#F9E219] animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 overflow-hidden">

  <span className="text-[9px] px-2 py-0.5 bg-[#F9E219] rounded-full font-black text-[#7A2B83] whitespace-nowrap">
    {p.code}
  </span>

  <span className="text-[10px] text-slate-400 font-black whitespace-nowrap">
    {p.packagingSize}U
  </span>

  <span className="text-[10px] text-[#7A2B83] dark:text-[#F9E219] font-black whitespace-nowrap">
    {formatCurrency(p.basePrice)}
  </span>

  <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md whitespace-nowrap">
    {p.defaultDiscount}%
  </span>

</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEdit(p)} 
                      className="p-3.5 text-slate-400 dark:text-slate-500 hover:text-[#7A2B83] bg-slate-50 dark:bg-slate-900 rounded-2xl transition-all border-2 border-transparent hover:border-[#7A2B83]/20"
                      title="Edit Product"
                    >
                      <Edit2 size={18} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => deleteProduct(p.id)} 
                      className="p-3.5 text-slate-400 dark:text-slate-500 hover:text-red-500 bg-slate-50 dark:bg-slate-900 rounded-2xl transition-all border-2 border-transparent hover:border-red-500/20"
                      title="Delete Product"
                    >
                      <Trash2 size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductManager;
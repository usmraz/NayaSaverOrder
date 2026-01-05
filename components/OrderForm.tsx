
import React, { useState, useMemo, useEffect } from 'react';
import { Product, OrderItem } from '../types';
import { unitsToCartons, calculateDiscount, calculateItemNet, formatCurrency } from '../utils/math';
import { Search, Plus, Trash2, Edit2, CheckCircle2, ShoppingBag, Package, BadgeDollarSign, AlertCircle, RotateCcw, Percent, Info } from 'lucide-react';

interface OrderFormProps {
  products: Product[];
  orderItems: OrderItem[];
  onUpdateOrder: (item: OrderItem) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ products, orderItems, onUpdateOrder, onRemoveItem, onClearAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [discountStr, setDiscountStr] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (orderItems.length === 0) {
      handleResetForm();
    }
  }, [orderItems.length]);

  const handleResetForm = () => {
    setSelectedProductId('');
    setQuantity('');
    setUnitPrice('');
    setDiscountStr('');
    setSearchTerm('');
    setEditingItemId(null);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOrderAmount = useMemo(() => {
    return orderItems.reduce((sum, item) => 
      sum + calculateItemNet(item.price, item.quantity, item.discount), 0
    );
  }, [orderItems]);

  const handleSelectProduct = (p: Product) => {
    setSelectedProductId(p.id);
    setUnitPrice(p.basePrice.toString());
    setDiscountStr(''); 
    setQuantity('');
    setSearchTerm(p.name);
  };

  const currentSelectedProduct = products.find(p => p.id === selectedProductId);

  const quantityAnalysis = useMemo(() => {
    if (!quantity || !currentSelectedProduct || quantity.trim() === '') {
      return { isValid: false, finalValue: 0, message: null, isAdjusted: false };
    }

    const rawUnits = parseFloat(quantity);
    if (isNaN(rawUnits)) {
      return { isValid: false, finalValue: 0, message: 'Please enter a valid number' };
    }

    const pkgSize = currentSelectedProduct.packagingSize;
    const targetCartons = Math.max(1, Math.round(rawUnits / pkgSize));
    const finalValue = targetCartons * pkgSize;
    const isAdjusted = Math.abs(rawUnits - finalValue) > 0.001;

    let message = null;
    if (rawUnits <= 0) {
      message = `Minimum order is 1 carton (${finalValue} units).`;
    } else if (isAdjusted) {
      message = `Snapping to ${targetCartons} full cartons (${finalValue} units).`;
    }

    return { isValid: true, finalValue, message, isAdjusted };
  }, [quantity, currentSelectedProduct]);

  const isQuantityValid = quantityAnalysis.isValid;
  const isPriceValid = useMemo(() => {
    const val = parseFloat(unitPrice);
    return !isNaN(val) && val >= 0;
  }, [unitPrice]);

  const effectiveDiscount = useMemo(() => {
    if (!currentSelectedProduct) return 0;
    return calculateDiscount(discountStr, currentSelectedProduct.defaultDiscount);
  }, [currentSelectedProduct, discountStr]);

  const handleQuantityBlur = () => {
    if (quantity !== '' && quantityAnalysis.isValid) {
      setQuantity(quantityAnalysis.finalValue.toString());
    }
  };

  const handleAddToOrder = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product || !isQuantityValid || !isPriceValid) return;
    onUpdateOrder({
      id: product.id,
      product,
      quantity: quantityAnalysis.finalValue,
      price: parseFloat(unitPrice),
      discount: effectiveDiscount
    });
    handleResetForm();
  };

  const startEdit = (item: OrderItem) => {
    setEditingItemId(item.id);
    setQuantity(item.quantity.toString());
    setUnitPrice(item.price.toString());
    setDiscountStr(item.discount.toString());
    setSelectedProductId(item.id);
  };

  const saveEdit = (item: OrderItem) => {
    if (!isQuantityValid || !isPriceValid) return;
    const finalQty = quantityAnalysis.finalValue;
    const finalDiscount = calculateDiscount(discountStr, item.product.defaultDiscount);
    onUpdateOrder({
      ...item,
      quantity: finalQty,
      price: parseFloat(unitPrice),
      discount: finalDiscount
    });
    setEditingItemId(null);
    handleResetForm();
  };

  const liveNetAmount = useMemo(() => {
    if (!currentSelectedProduct || !isQuantityValid || !isPriceValid) return 0;
    return calculateItemNet(parseFloat(unitPrice), quantityAnalysis.finalValue, effectiveDiscount);
  }, [currentSelectedProduct, isQuantityValid, isPriceValid, quantityAnalysis, unitPrice, effectiveDiscount]);

  return (
    <div className="space-y-8 lg:space-y-12 transition-all">
      <section className="bg-white dark:bg-[#1A0B1E] p-6 lg:p-10 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 shadow-xl overflow-visible transition-colors">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black text-[#7A2B83] dark:text-[#F9E219] uppercase flex items-center gap-2 tracking-[0.2em]">
              <Search size={18} strokeWidth={3} className="text-[#F9E219] fill-[#7A2B83]/10" /> 
              {selectedProductId ? 'Configuration' : 'Select Product'}
            </h2>
            {selectedProductId && (
                <button 
                    onClick={handleResetForm}
                    className="text-[10px] font-black text-slate-400 hover:text-red-500 flex items-center gap-1 uppercase tracking-widest transition-all bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full"
                >
                    <RotateCcw size={12} /> Clear
                </button>
            )}
        </div>

        <div className={`grid grid-cols-1 ${selectedProductId ? 'lg:grid-cols-12 lg:gap-12' : ''} gap-8`}>
          <div className={`${selectedProductId ? 'lg:col-span-5' : 'col-span-full'}`}>
            <div className="relative mb-6">
              <input 
                type="text"
                placeholder="Search by code or name..."
                className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold placeholder-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-[#7A2B83] transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && !selectedProductId && filteredProducts.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-2 border-[#7A2B83]/10 dark:border-slate-700 shadow-2xl rounded-2xl mt-2 z-40 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 ring-1 ring-black/5">
                  {filteredProducts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="w-full text-left px-5 py-4 hover:bg-[#F9E219]/20 transition-colors text-sm flex justify-between items-center group"
                    >
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 dark:text-slate-100 group-hover:text-[#7A2B83] uppercase tracking-tight">{p.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">{p.code}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-[#7A2B83] bg-[#F9E219] px-2 py-0.5 rounded-full mb-1">Box: {p.packagingSize}</span>
                        <span className="text-[10px] font-bold text-emerald-600">{p.defaultDiscount}% off</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedProductId && currentSelectedProduct && (
              <div className="bg-[#7A2B83]/5 dark:bg-[#7A2B83]/20 p-6 rounded-[2rem] border-2 border-[#7A2B83]/10 dark:border-[#7A2B83]/30 shadow-inner animate-in fade-in slide-in-from-left-4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#7A2B83]/60 dark:text-[#F9E219]/60 uppercase tracking-[0.2em] mb-2">Specifications</span>
                    <h3 className="font-black text-slate-900 dark:text-white text-2xl leading-tight uppercase tracking-tight">{currentSelectedProduct.name}</h3>
                    <div className="flex items-center gap-3 mt-4">
                        <span className="bg-[#F9E219] text-[#7A2B83] text-[10px] font-black px-3 py-1 rounded-full border border-[#7A2B83]/10 uppercase tracking-widest">
                          {currentSelectedProduct.code}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-tight">
                          Box: {currentSelectedProduct.packagingSize} Units
                        </span>
                    </div>
                </div>
              </div>
            )}
          </div>

          {selectedProductId && currentSelectedProduct && (
            <div className="lg:col-span-7 space-y-6 lg:border-l lg:border-slate-100 dark:lg:border-slate-800 lg:pl-10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-2 ml-1 uppercase tracking-widest">Units Required</label>
                  <div className="relative">
                    <input 
                      type="number"
                      placeholder="0"
                      className={`w-full p-4 rounded-2xl border-2 transition-all shadow-sm text-lg font-black ${
                        quantityAnalysis.isAdjusted 
                          ? 'border-amber-300 bg-amber-50 text-amber-900 ring-4 ring-amber-500/10' 
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white'
                      }`}
                      value={quantity}
                      onBlur={handleQuantityBlur}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    {quantityAnalysis.message && (
                      <div className="flex items-start gap-1.5 mt-2 ml-1 text-[10px] font-black uppercase text-amber-600 animate-in slide-in-from-top-1">
                        <AlertCircle size={12} strokeWidth={3} className="mt-0.5 shrink-0" />
                        <span>{quantityAnalysis.message}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-2 ml-1 uppercase tracking-widest">Unit Price (PKR)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-lg font-black focus:bg-white dark:focus:bg-slate-900 focus:border-[#7A2B83] transition-all shadow-sm"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-3 px-1">
                  <label className="text-[10px] font-black text-[#7A2B83] dark:text-[#F9E219] uppercase tracking-widest flex items-center gap-1.5">
                    <Percent size={14} strokeWidth={3} /> Discount Adjust
                  </label>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Base: {currentSelectedProduct.defaultDiscount}%</span>
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="e.g. +2.5 or 15"
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-700 dark:text-emerald-400 text-lg font-black focus:border-emerald-500 shadow-sm"
                    value={discountStr}
                    onChange={(e) => setDiscountStr(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase">Final:</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-100 dark:border-emerald-900">
                      {effectiveDiscount}%
                    </span>
                  </div>
                </div>
              </div>

              {isQuantityValid && isPriceValid && (
                <div className="bg-[#7A2B83] p-6 rounded-[2rem] border-4 border-[#F9E219]/30 flex items-center justify-between shadow-2xl animate-in zoom-in-95 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#F9E219] p-3 rounded-2xl text-[#7A2B83]">
                      <BadgeDollarSign size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#F9E219] uppercase tracking-[0.2em] mb-1">Net Item Amount</span>
                      <span className="text-2xl font-black text-white tracking-tight">{formatCurrency(liveNetAmount)}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToOrder}
                disabled={!isQuantityValid || !isPriceValid}
                className="w-full bg-[#7A2B83] text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 disabled:opacity-30 transition-all hover:bg-[#68246f] shadow-xl text-lg uppercase tracking-widest border-b-4 border-black/20 active:scale-[0.98]"
              >
                <Plus size={24} strokeWidth={4} className="text-[#F9E219]" /> 
                {editingItemId ? 'Update Record' : 'Add to Order'}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end px-4 border-b-2 border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Summary ({orderItems.length})</h2>
            {orderItems.length > 0 && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payable Total</span>
                <span className="text-3xl font-black text-[#7A2B83] dark:text-[#F9E219] tracking-tighter leading-none">{formatCurrency(totalOrderAmount)}</span>
              </div>
            )}
        </div>
        
        {orderItems.length === 0 ? (
          <div className="text-center py-20 text-slate-300 dark:text-slate-700 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3.5rem] bg-white dark:bg-[#1A0B1E]">
            <ShoppingBag size={64} className="mx-auto mb-6 opacity-5" />
            <p className="font-black uppercase text-xs tracking-[0.3em] text-slate-400">Empty List</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            {orderItems.map(item => {
              const netAmount = calculateItemNet(item.price, item.quantity, item.discount);
              const isEditing = editingItemId === item.id;
              
              return (
                <div key={item.id} className={`bg-white dark:bg-[#1A0B1E] p-7 rounded-[3rem] border-2 transition-all relative flex flex-col ${isEditing ? 'border-[#7A2B83] shadow-2xl ring-4 ring-[#7A2B83]/5 scale-[1.02] z-20' : 'border-slate-100 dark:border-slate-800 shadow-lg'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-black text-slate-900 dark:text-white leading-tight truncate text-lg uppercase tracking-tight">{item.product.name}</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{item.product.code} • {item.product.packagingSize}u Box</p>
                    </div>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <button onClick={() => saveEdit(item)} className="p-3.5 rounded-2xl text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-200 dark:border-emerald-800 shadow-sm"><CheckCircle2 size={22} /></button>
                      ) : (
                        <>
                          <button onClick={() => startEdit(item)} className="p-3.5 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 hover:text-[#7A2B83] rounded-2xl transition-all border-2 border-slate-100 dark:border-slate-800"><Edit2 size={20} /></button>
                          <button onClick={() => onRemoveItem(item.id)} className="p-3.5 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 hover:text-red-600 rounded-2xl transition-all border-2 border-slate-100 dark:border-slate-800"><Trash2 size={20} /></button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-inner flex-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Units</span>
                      <span className="font-black text-slate-800 dark:text-white text-lg">{item.quantity}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-[#7A2B83] dark:text-[#F9E219] uppercase tracking-widest mb-1">Cartons</span>
                      <span className="font-black text-[#7A2B83] text-2xl bg-[#F9E219] px-4 py-1.5 rounded-2xl shadow-sm">
                        {unitsToCartons(item.quantity, item.product.packagingSize)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Disc</span>
                      <span className="font-black text-emerald-600 text-lg">{item.discount}%</span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between items-center px-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(netAmount)}</span>
                  </div>

                  {isEditing && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[2px] rounded-[3rem] flex items-center justify-center pointer-events-none">
                      <div className="bg-[#7A2B83] text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl animate-bounce">
                        <Info size={16} className="text-[#F9E219]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Editing Mode</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default OrderForm;


import React, { useState, useMemo, useEffect } from 'react';
import { Product, OrderItem } from '../types';
import { unitsToCartons, calculateDiscount, calculateItemNet, formatCurrency } from '../utils/math';
import { Search, Plus, Trash2, Edit2, CheckCircle2, ShoppingBag, Package, BadgeDollarSign, AlertCircle, XCircle, RotateCcw, Percent } from 'lucide-react';

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
  const [confirmClear, setConfirmClear] = useState(false);

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

  const handleClearTrigger = () => {
    if (confirmClear) {
      onClearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
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
    setDiscountStr(''); // Keep empty to indicate using Base Discount initially
    setQuantity('');
    setSearchTerm(p.name);
  };

  const isQuantityValid = useMemo(() => {
    const val = parseFloat(quantity);
    return !isNaN(val) && val > 0;
  }, [quantity]);

  const isPriceValid = useMemo(() => {
    const val = parseFloat(unitPrice);
    return !isNaN(val) && val >= 0;
  }, [unitPrice]);

  const currentSelectedProduct = products.find(p => p.id === selectedProductId);

  const effectiveDiscount = useMemo(() => {
    if (!currentSelectedProduct) return 0;
    return calculateDiscount(discountStr, currentSelectedProduct.defaultDiscount);
  }, [currentSelectedProduct, discountStr]);

  const handleAddToOrder = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product || !isQuantityValid || !isPriceValid) return;

    onUpdateOrder({
      id: product.id,
      product,
      quantity: parseFloat(quantity),
      price: parseFloat(unitPrice),
      discount: effectiveDiscount
    });

    handleResetForm();
  };

  const startEdit = (item: OrderItem) => {
    setEditingItemId(item.id);
    setQuantity(item.quantity.toString());
    setUnitPrice(item.price.toString());
    // For editing, show absolute value initially
    setDiscountStr(item.discount.toString());
  };

  const saveEdit = (item: OrderItem) => {
    if (!isQuantityValid || !isPriceValid) return;
    const finalDiscount = calculateDiscount(discountStr, item.product.defaultDiscount);
    onUpdateOrder({
      ...item,
      quantity: parseFloat(quantity),
      price: parseFloat(unitPrice),
      discount: finalDiscount
    });
    setEditingItemId(null);
    setQuantity('');
    setUnitPrice('');
    setDiscountStr('');
  };

  const liveNetAmount = useMemo(() => {
    if (!currentSelectedProduct || !isQuantityValid || !isPriceValid) return 0;
    return calculateItemNet(parseFloat(unitPrice), parseFloat(quantity), effectiveDiscount);
  }, [currentSelectedProduct, quantity, unitPrice, effectiveDiscount, isQuantityValid, isPriceValid]);

  return (
    <div className="space-y-6">
      <section className="bg-white p-5 rounded-[2.5rem] border-2 border-slate-100 shadow-xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-black text-[#7A2B83] uppercase flex items-center gap-2 tracking-widest">
            <Search size={16} strokeWidth={3} className="text-[#F9E219] fill-[#7A2B83]/10" /> Select Product
            </h2>
            {selectedProductId && (
                <button 
                    onClick={handleResetForm}
                    className="text-[10px] font-black text-slate-400 hover:text-[#7A2B83] flex items-center gap-1 uppercase tracking-tighter transition-all"
                >
                    <RotateCcw size={12} /> Reset Draft
                </button>
            )}
        </div>
        <div className="relative mb-3">
          <input 
            type="text"
            placeholder="Search code or name..."
            className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-bold placeholder-slate-400 focus:bg-white focus:border-[#7A2B83] focus:ring-4 focus:ring-[#7A2B83]/10 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && !selectedProductId && filteredProducts.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border-2 border-[#7A2B83]/10 shadow-2xl rounded-2xl mt-2 z-40 max-h-72 overflow-y-auto divide-y divide-slate-100 ring-1 ring-black/5">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className="w-full text-left px-5 py-4 hover:bg-[#F9E219]/20 transition-colors text-sm flex justify-between items-center group"
                >
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900 group-hover:text-[#7A2B83] uppercase tracking-tight">{p.name}</span>
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
          <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-[#7A2B83]/5 p-5 rounded-3xl border-2 border-[#7A2B83]/10 flex items-center justify-between shadow-inner">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#7A2B83]/60 uppercase tracking-widest mb-1">SELECTED ITEM</span>
                    <span className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">{currentSelectedProduct.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 font-bold uppercase">{currentSelectedProduct.code}</span>
                </div>
                <button onClick={() => setSelectedProductId('')} className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-2xl transition-all shadow-sm">
                    <Trash2 size={20} />
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1.5 ml-1 uppercase tracking-widest">Units Required</label>
                <input 
                  type="number"
                  placeholder="0"
                  min="0"
                  step="any"
                  className={`w-full p-4 rounded-2xl border-2 ${!isQuantityValid && quantity !== '' ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-100 bg-slate-50 text-slate-900'} text-base font-black focus:bg-white focus:border-[#7A2B83] focus:ring-4 focus:ring-[#7A2B83]/10 transition-all shadow-sm`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                {quantity && isQuantityValid ? (
                   <p className="text-[10px] text-[#7A2B83] font-black mt-2 ml-1 flex items-center gap-1 uppercase">
                      <Package size={12} className="text-[#F9E219] fill-[#7A2B83]" /> {unitsToCartons(parseFloat(quantity) || 0, currentSelectedProduct.packagingSize)} cartons
                   </p>
                ) : quantity !== '' && !isQuantityValid ? (
                   <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 flex items-center gap-1">
                      <AlertCircle size={12} /> Must be positive
                   </p>
                ) : null}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 block mb-1.5 ml-1 uppercase tracking-widest">Unit Price (PKR)</label>
                <input 
                  type="number"
                  placeholder="0"
                  min="0"
                  step="any"
                  className={`w-full p-4 rounded-2xl border-2 ${!isPriceValid && unitPrice !== '' ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-100 bg-slate-50 text-slate-900'} text-base font-black focus:bg-white focus:border-[#7A2B83] focus:ring-4 focus:ring-[#7A2B83]/10 transition-all shadow-sm`}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-[2rem] border-2 border-slate-100">
                <div className="flex justify-between items-center mb-2 px-1">
                  <label className="text-[10px] font-black text-[#7A2B83] uppercase tracking-widest flex items-center gap-1.5">
                    <Percent size={14} /> Discount Adjustment
                  </label>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Base: {currentSelectedProduct.defaultDiscount}%</span>
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Type +5, -2, or 15%"
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 bg-white text-emerald-700 text-lg font-black focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                    value={discountStr}
                    onChange={(e) => setDiscountStr(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase">Effective:</span>
                    <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                      {effectiveDiscount}%
                    </span>
                  </div>
                </div>
                {discountStr && (
                   <p className="text-[9px] text-slate-500 font-bold mt-2 ml-1 flex items-center gap-1 italic uppercase">
                      {discountStr.startsWith('+') || discountStr.startsWith('-') 
                        ? `${currentSelectedProduct.defaultDiscount}% ${discountStr.startsWith('+') ? '+' : ''}${discountStr} = ${effectiveDiscount}%`
                        : `Overriding default with ${effectiveDiscount}%`}
                   </p>
                )}
            </div>

            {isQuantityValid && isPriceValid && (
              <div className="bg-[#7A2B83] p-6 rounded-[2rem] border-4 border-[#F9E219]/30 flex items-center justify-between animate-in zoom-in-95 duration-200 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="bg-[#F9E219] p-3 rounded-2xl text-[#7A2B83] shadow-lg shadow-black/20">
                    <BadgeDollarSign size={28} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#F9E219] uppercase tracking-[0.2em] mb-1 leading-none">Net Item Total</span>
                    <span className="text-2xl font-black text-white leading-none tracking-tight">
                      {formatCurrency(liveNetAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToOrder}
              disabled={!isQuantityValid || !isPriceValid || !selectedProductId}
              className="w-full bg-[#7A2B83] text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 disabled:opacity-30 transition-all hover:bg-[#68246f] shadow-xl shadow-[#7A2B83]/30 active:scale-[0.98] text-lg uppercase tracking-widest border-b-4 border-black/20"
            >
              <Plus size={24} strokeWidth={4} className="text-[#F9E219]" /> Add To Purchase List
            </button>
          </div>
        )}
      </section>

      <section className="space-y-4 pt-2">
        <div className="flex justify-between items-center px-2">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               Summary ({orderItems.length})
            </h2>
            {orderItems.length > 0 && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Payable</span>
                <span className="text-2xl font-black text-[#7A2B83] tracking-tighter leading-none">{formatCurrency(totalOrderAmount)}</span>
              </div>
            )}
        </div>
        
        {orderItems.length === 0 ? (
          <div className="text-center py-20 text-slate-300 border-4 border-dashed border-slate-100 rounded-[3rem] bg-white shadow-inner">
            <ShoppingBag size={56} className="mx-auto mb-4 opacity-5" />
            <p className="font-black uppercase text-xs tracking-[0.2em] text-slate-400">List Empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderItems.map(item => {
              const netAmount = calculateItemNet(item.price, item.quantity, item.discount);
              return (
                <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-black text-slate-900 leading-tight truncate text-base uppercase tracking-tight">{item.product.name}</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{item.product.code} • Box {item.product.packagingSize}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {editingItemId === item.id ? (
                        <button 
                          onClick={() => saveEdit(item)} 
                          className={`p-3.5 rounded-2xl transition-all active:scale-90 border-2 ${isQuantityValid && isPriceValid ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed'}`}
                        >
                          <CheckCircle2 size={20} />
                        </button>
                      ) : (
                        <>
                          <button onClick={() => startEdit(item)} className="p-3.5 text-slate-400 bg-slate-50 hover:text-[#7A2B83] hover:bg-[#F9E219]/20 rounded-2xl transition-all active:scale-90 border-2 border-slate-100">
                            <Edit2 size={20} />
                          </button>
                          <button onClick={() => onRemoveItem(item.id)} className="p-3.5 text-slate-400 bg-slate-50 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90 border-2 border-slate-100">
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingItemId === item.id ? (
                    <div className="grid grid-cols-2 gap-4 mt-5 bg-[#7A2B83]/5 p-5 rounded-3xl border-2 border-[#7A2B83]/10 animate-in zoom-in-95 duration-200">
                      <div>
                        <span className="text-[10px] font-black text-[#7A2B83]/60 block mb-1.5 ml-1 uppercase tracking-widest">UNITS</span>
                        <input 
                          type="number"
                          min="0"
                          step="any"
                          className={`w-full p-3.5 text-sm rounded-2xl border-2 ${!isQuantityValid ? 'border-red-300 bg-red-50 text-red-900' : 'border-[#7A2B83]/20 text-slate-900 bg-white'} font-black shadow-sm focus:ring-4 focus:ring-[#7A2B83]/10`}
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-[#7A2B83]/60 block mb-1.5 ml-1 uppercase tracking-widest">PRICE</span>
                        <input 
                          type="number"
                          min="0"
                          step="any"
                          className={`w-full p-3.5 text-sm rounded-2xl border-2 ${!isPriceValid ? 'border-red-300 bg-red-50 text-red-900' : 'border-[#7A2B83]/20 text-slate-900 bg-white'} font-black shadow-sm focus:ring-4 focus:ring-[#7A2B83]/10`}
                          value={unitPrice}
                          onChange={(e) => setUnitPrice(e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] font-black text-[#7A2B83]/60 block mb-1.5 ml-1 uppercase tracking-widest">DISC ADJUSTMENT (+/-/=)</span>
                        <input 
                          type="text"
                          className="w-full p-3.5 text-sm rounded-2xl border-2 border-[#7A2B83]/20 font-black text-emerald-700 bg-white shadow-sm focus:ring-4 focus:ring-emerald-500/10"
                          value={discountStr}
                          onChange={(e) => setDiscountStr(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mt-5 bg-slate-50 p-5 rounded-3xl border-2 border-slate-100 shadow-inner">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Quantity</span>
                          <span className="font-black text-slate-800 text-base">{item.quantity} Units</span>
                          <span className="text-[10px] font-black text-slate-400 mt-0.5">{formatCurrency(item.price)}/u</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black text-[#7A2B83] uppercase tracking-widest mb-1 leading-none">Cartons</span>
                          <span className="font-black text-[#7A2B83] text-xl bg-[#F9E219] px-3 py-1 rounded-xl shadow-sm">
                            {unitsToCartons(item.quantity, item.product.packagingSize)}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Discount</span>
                          <span className="font-black text-emerald-600 text-base">{item.discount}%</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Total</span>
                        <span className="text-base font-black text-slate-900">{formatCurrency(netAmount)}</span>
                      </div>
                    </>
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

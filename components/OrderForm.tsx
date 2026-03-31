import React, { useState, useMemo } from 'react';
import { Product, OrderItem } from '../types';
import { unitsToCartons, calculateDiscount, calculateItemNet, formatCurrency } from '../utils/math';
import { Search, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

interface OrderFormProps {
products: Product[];
orderItems: OrderItem[];
onUpdateOrder: (item: OrderItem) => void;
onRemoveItem: (id: string) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
products,
orderItems,
onUpdateOrder,
onRemoveItem
}) => {

const [searchTerm, setSearchTerm] = useState('');
const [selectedProductId, setSelectedProductId] = useState('');
const [quantity, setQuantity] = useState('');
const [price, setPrice] = useState('');
const [discountStr, setDiscountStr] = useState('');
const [editingId, setEditingId] = useState<string | null>(null);

const filteredProducts = products.filter(p =>
p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
p.code.toLowerCase().includes(searchTerm.toLowerCase())
);

const selectedProduct = products.find(p => p.id === selectedProductId);

const discount = useMemo(() => {
if (!selectedProduct) return 0;
return calculateDiscount(discountStr, selectedProduct.defaultDiscount);
}, [discountStr, selectedProduct]);

const total = useMemo(() => {
return orderItems.reduce((sum, i) =>
sum + calculateItemNet(i.price, i.quantity, i.discount), 0
);
}, [orderItems]);

const handleSelect = (p: Product) => {
setSelectedProductId(p.id);
setPrice(p.basePrice.toString());
setQuantity('');
setDiscountStr('');
setSearchTerm(p.name);
};

const handleAdd = () => {
if (!selectedProduct) return;

const qty = parseFloat(quantity);
const pr = parseFloat(price);

if (isNaN(qty) || isNaN(pr)) return;

onUpdateOrder({
  id: selectedProduct.id,
  product: selectedProduct,
  quantity: qty,
  price: pr,
  discount: discount
});

setQuantity('');
setDiscountStr('');
setSelectedProductId('');
setSearchTerm('');


};

return ( <div className="space-y-4">

  {/* SEARCH */}
  <div className="bg-white dark:bg-[#1A0B1E] p-3 rounded-2xl shadow-md border">
    <input
      placeholder="Search product..."
      className="w-full p-2 rounded-xl text-sm border"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />

    {searchTerm && filteredProducts.length > 0 && (
      <div className="mt-2 bg-white dark:bg-slate-900 border rounded-xl shadow-lg max-h-40 overflow-auto">
        {filteredProducts.map(p => (
          <div
            key={p.id}
            onClick={() => handleSelect(p)}
            className="px-3 py-2 text-sm hover:bg-[#F9E219]/20 cursor-pointer"
          >
            {p.name} ({p.code})
          </div>
        ))}
      </div>
    )}
  </div>

  {/* INPUT */}
  {selectedProduct && (
    <div className="bg-white dark:bg-[#1A0B1E] p-3 rounded-2xl shadow-md border space-y-2">

      <div className="text-xs font-black text-[#7A2B83]">
        {selectedProduct.name}
      </div>

      <div className="grid grid-cols-3 gap-2">

        <input
          placeholder="Qty"
          className="p-2 rounded-xl border text-sm"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <input
          placeholder="Price"
          className="p-2 rounded-xl border text-sm"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Disc"
          className="p-2 rounded-xl border text-sm"
          value={discountStr}
          onChange={(e) => setDiscountStr(e.target.value)}
        />

      </div>

      <button
        onClick={handleAdd}
        className="w-full bg-[#7A2B83] text-white py-2 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md"
      >
        <Plus size={16} /> Add
      </button>

    </div>
  )}

  {/* TOTAL */}
  <div className="text-right text-sm font-black text-[#7A2B83]">
    Total: {formatCurrency(total)}
  </div>

  {/* ITEMS */}
  <div className="space-y-3">

    {orderItems.map(item => {
      const net = calculateItemNet(item.price, item.quantity, item.discount);

      return (
        <div key={item.id} className="bg-white dark:bg-[#1A0B1E] p-3 rounded-2xl shadow-md border">

          {/* TOP */}
          <div className="flex justify-between items-start mb-2">

            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {item.product.name}
              </div>
              <div className="text-[10px] text-slate-400">
                {item.product.code}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => onRemoveItem(item.id)}>
                <Trash2 size={16} />
              </button>
            </div>

          </div>

          {/* MID */}
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-2 rounded-xl">

            <div className="text-center">
              <div className="text-[9px]">Units</div>
              <div className="text-sm font-black">{item.quantity}</div>
            </div>

            <div className="text-center">
              <div className="text-[9px]">CTN</div>
              <div className="bg-[#F9E219] text-[#7A2B83] px-2 rounded text-sm font-black">
                {unitsToCartons(item.quantity, item.product.packagingSize)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-[9px]">Disc</div>
              <div className="text-sm font-black text-emerald-600">
                {item.discount}%
              </div>
            </div>

          </div>

          {/* BOTTOM */}
          <div className="flex justify-between mt-2 text-sm font-black">
            <span>Subtotal</span>
            <span>{formatCurrency(net)}</span>
          </div>

        </div>
      );
    })}

  </div>

</div>


);
};

export default OrderForm;
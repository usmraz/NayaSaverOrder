import React, { useState, useMemo, useEffect } from 'react';
import { Product, OrderItem } from '../types';
import { unitsToCartons, calculateDiscount, calculateItemNet, formatCurrency } from '../utils/math';
import { Search, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

interface OrderFormProps {
products: Product[];
orderItems: OrderItem[];
onUpdateOrder: (item: OrderItem) => void;
onRemoveItem: (id: string) => void;
onClearAll: () => void;
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
const [unitPrice, setUnitPrice] = useState('');
const [discountStr, setDiscountStr] = useState('');
const [editingItemId, setEditingItemId] = useState<string | null>(null);

const filteredProducts = products.filter(p =>
p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
p.code.toLowerCase().includes(searchTerm.toLowerCase())
);

const currentProduct = products.find(p => p.id === selectedProductId);

const effectiveDiscount = useMemo(() => {
if (!currentProduct) return 0;
return calculateDiscount(discountStr, currentProduct.defaultDiscount);
}, [discountStr, currentProduct]);

const handleSelectProduct = (p: Product) => {
setSelectedProductId(p.id);
setUnitPrice(p.basePrice.toString());
setDiscountStr('');
setQuantity('');
setSearchTerm(p.name);
};

const handleAdd = () => {
if (!currentProduct) return;

const qty = parseFloat(quantity);
const price = parseFloat(unitPrice);

if (isNaN(qty) || isNaN(price)) return;

onUpdateOrder({
  id: currentProduct.id,
  product: currentProduct,
  quantity: qty,
  price: price,
  discount: effectiveDiscount
});

setQuantity('');
setDiscountStr('');
setSelectedProductId('');
setSearchTerm('');


};

const total = useMemo(() => {
return orderItems.reduce((sum, i) =>
sum + calculateItemNet(i.price, i.quantity, i.discount), 0
);
}, [orderItems]);

return ( <div className="space-y-4">

  {/* SEARCH */}
  <div className="bg-white dark:bg-[#1A0B1E] p-3 rounded-lg border">
    <input
      placeholder="Search product..."
      className="w-full p-2 rounded border text-sm"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />

    {searchTerm && filteredProducts.length > 0 && (
      <div className="mt-2 border rounded max-h-40 overflow-auto">
        {filteredProducts.map(p => (
          <div
            key={p.id}
            onClick={() => handleSelectProduct(p)}
            className="px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer"
          >
            {p.name} ({p.code})
          </div>
        ))}
      </div>
    )}
  </div>

  {/* INPUT ROW */}
  {currentProduct && (
    <div className="bg-white dark:bg-[#1A0B1E] p-3 rounded-lg border space-y-2">

      <div className="text-xs font-bold">{currentProduct.name}</div>

      <div className="grid grid-cols-3 gap-2">
        <input
          placeholder="Qty"
          className="p-2 border rounded text-sm"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          placeholder="Price"
          className="p-2 border rounded text-sm"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
        />
        <input
          placeholder="Disc"
          className="p-2 border rounded text-sm"
          value={discountStr}
          onChange={(e) => setDiscountStr(e.target.value)}
        />
      </div>

      <button
        onClick={handleAdd}
        className="w-full bg-purple-700 text-white py-2 rounded text-sm"
      >
        Add
      </button>

    </div>
  )}

  {/* TOTAL */}
  <div className="text-right text-sm font-bold">
    Total: {formatCurrency(total)}
  </div>

  {/* ORDER ITEMS */}
  <div className="space-y-2">

    {orderItems.map(item => {
      const net = calculateItemNet(item.price, item.quantity, item.discount);

      return (
        <div key={item.id} className="bg-slate-900 text-white p-2 rounded flex justify-between items-center">

          <div className="flex items-center gap-2">
            <div className="bg-purple-700 px-2 py-1 text-[10px] rounded">
              {unitsToCartons(item.quantity, item.product.packagingSize)} CTN
            </div>

            <div>
              <div className="text-xs">{item.product.name}</div>
              <div className="text-[10px] text-gray-400">
                {item.product.packagingSize}u @ {item.price} -{item.discount}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs">{formatCurrency(net)}</span>

            <button onClick={() => onRemoveItem(item.id)}>
              <Trash2 size={14} />
            </button>
          </div>

        </div>
      );
    })}

  </div>

</div>


);
};

export default OrderForm;

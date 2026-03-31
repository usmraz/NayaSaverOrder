
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, OrderItem, ViewType, SavedOrder, SavedOrderItem } from './types';
import ProductManager from './components/ProductManager';
import OrderForm from './components/OrderForm';
import SummaryView from './components/SummaryView';
import HistoryView from './components/HistoryView';
import { BrandLogo } from './components/BrandLogo';
import { calculateItemNet } from './utils/math';
import { ShoppingBag, Package, ClipboardList, Trash2, History, Download, Sun, Moon } from 'lucide-react';

const STORAGE_KEY_PRODUCTS = 'cartonflow_products_v3';
const STORAGE_KEY_ORDER = 'cartonflow_order';
const STORAGE_KEY_HISTORY = 'cartonflow_history_v2';
const STORAGE_KEY_THEME = 'cartonflow_theme';


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('ORDER');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return saved === 'dark';
  });
  
  const [products, setProducts] = useState<Product[]>(() => {
  const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }
  return [];
});
  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ORDER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [orderHistory, setOrderHistory] = useState<SavedOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(orderItems));
  }, [orderItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(orderHistory));
  }, [orderHistory]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const addOrUpdateOrderItem = useCallback((item: OrderItem) => {
    setOrderItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? item : i);
      }
      return [...prev, item];
    });
  }, []);

  const handleVoiceOrder = useCallback((items: { codeOrName: string; quantity: number }[]) => {
    let summary = [];
    for (const voiceItem of items) {
      const product = products.find(p => 
        p.code.toLowerCase() === voiceItem.codeOrName.toLowerCase() || 
        p.name.toLowerCase().includes(voiceItem.codeOrName.toLowerCase())
      );

      if (product) {
        addOrUpdateOrderItem({
          id: product.id,
          product,
          quantity: voiceItem.quantity,
          price: product.basePrice,
          discount: product.defaultDiscount
        });
        summary.push(`${voiceItem.quantity} units of ${product.name}`);
      }
    }
    return summary.length > 0 ? `Added: ${summary.join(', ')}` : "I couldn't find those products in the catalog.";
  }, [products, addOrUpdateOrderItem]);

  const removeOrderItem = (id: string) => {
    setOrderItems(prev => prev.filter(i => i.id !== id));
  };

  const handleClearOrder = () => {
    setOrderItems([]);
    setShowClearConfirm(false);
  };

  const saveToHistory = useCallback((outcome: string) => {
    const totalAmount = orderItems.reduce((sum, item) => 
      sum + calculateItemNet(item.price, item.quantity, item.discount), 0
    );

    const detailedItems: SavedOrderItem[] = orderItems.map(item => ({
      name: item.product.name,
      code: item.product.code,
      quantity: item.quantity,
      discount: item.discount,
      netAmount: calculateItemNet(item.price, item.quantity, item.discount)
    }));

    setOrderHistory(prev => [
      {
        id: Date.now().toString(),
        timestamp: Date.now(),
        outcomeString: outcome,
        itemCount: orderItems.length,
        totalAmount: totalAmount,
        items: detailedItems
      },
      ...prev
    ].slice(0, 100));
  }, [orderItems]);

  const deleteHistoryItem = (id: string) => {
    setOrderHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    if (confirm('Clear all order history?')) {
      setOrderHistory([]);
    }
  };

  return (

  <div className="min-h-screen pb-16 max-w-md lg:max-w-6xl mx-auto bg-white dark:bg-[#1A0B1E]/40 shadow-lg relative overflow-x-hidden transition-colors duration-300">

<header className="sticky top-0 z-50 bg-[#7A2B83] text-white px-3 py-2 shadow-lg border-b-2 border-[#F9E219]">
  <div className="flex justify-between items-center max-w-5xl mx-auto">
    
    <div className="flex items-center gap-2">
      <div className="bg-white p-1 rounded-lg shadow border border-[#F9E219]/20">
        <BrandLogo className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-sm font-black uppercase leading-none">Naya Sawera</h1>
        <p className="text-[#F9E219] text-[8px] font-black uppercase tracking-wide">Order Setup</p>
      </div>
    </div>

    <div className="flex items-center gap-1.5">
      
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
      >
        {isDarkMode ? <Sun size={16} className="text-[#F9E219]" /> : <Moon size={16} />}
      </button>

      {deferredPrompt && (
        <button 
          onClick={handleInstallClick}
          className="flex items-center gap-1 bg-[#F9E219] text-[#7A2B83] px-2 py-1 rounded-full text-[8px] font-black uppercase"
        >
          <Download size={12} /> Install
        </button>
      )}

      {activeView === 'ORDER' ? (
        <div className="flex gap-1">
          {showClearConfirm && (
            <button 
              onClick={handleClearOrder}
              className="bg-white text-[#7A2B83] px-2 py-0.5 rounded-full text-[8px] font-black"
            >
              Confirm
            </button>
          )}
          <button 
            type="button"
            onClick={() => {
              if (orderItems.length > 0) setShowClearConfirm(!showClearConfirm);
            }}
            className={`p-1.5 rounded-lg ${
              orderItems.length > 0 
                ? 'bg-[#F9E219] text-[#7A2B83]' 
                : 'bg-white/20 opacity-50'
            }`}
            disabled={orderItems.length === 0}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : activeView === 'HISTORY' ? (
        <button 
          type="button"
          onClick={clearHistory}
          className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500"
        >
          <Trash2 size={16} />
        </button>
      ) : null}

    </div>
  </div>
</header>

<main className="p-3 lg:p-6 max-w-6xl mx-auto" onClick={() => showClearConfirm && setShowClearConfirm(false)}>
  
  {activeView === 'ORDER' && (
    <OrderForm 
      products={products}
      orderItems={orderItems}
      onUpdateOrder={addOrUpdateOrderItem}
      onRemoveItem={removeOrderItem}
    />
  )}

  {activeView === 'SUMMARY' && (
    <SummaryView 
      orderItems={orderItems}
      onBack={() => setActiveView('ORDER')}
      onSaveToHistory={saveToHistory}
    />
  )}

  {activeView === 'HISTORY' && (
    <HistoryView 
      history={orderHistory}
      onDelete={deleteHistoryItem}
    />
  )}

  {activeView === 'PRODUCTS' && (
    <ProductManager 
      products={products}
      setProducts={setProducts}
    />
  )}

</main>

<nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[96%] max-w-sm bg-slate-900 text-white rounded-xl p-1.5 flex justify-around items-center shadow-lg z-50">
  
  <button 
    onClick={() => setActiveView('ORDER')}
    className={`flex flex-col items-center p-2 rounded-lg ${activeView === 'ORDER' ? 'bg-[#7A2B83]' : 'text-slate-400'}`}
  >
    <ShoppingBag size={16} />
    <span className="text-[8px] mt-0.5 font-black uppercase">Order</span>
  </button>

  <button 
    onClick={() => setActiveView('SUMMARY')}
    className={`flex flex-col items-center p-2 rounded-lg ${activeView === 'SUMMARY' ? 'bg-[#7A2B83]' : 'text-slate-400'}`}
  >
    <ClipboardList size={16} />
    <span className="text-[8px] mt-0.5 font-black uppercase">Summary</span>
  </button>

  <button 
    onClick={() => setActiveView('HISTORY')}
    className={`flex flex-col items-center p-2 rounded-lg ${activeView === 'HISTORY' ? 'bg-[#7A2B83]' : 'text-slate-400'}`}
  >
    <History size={16} />
    <span className="text-[8px] mt-0.5 font-black uppercase">History</span>
  </button>

  <button 
    onClick={() => setActiveView('PRODUCTS')}
    className={`flex flex-col items-center p-2 rounded-lg ${activeView === 'PRODUCTS' ? 'bg-[#7A2B83]' : 'text-slate-400'}`}
  >
    <Package size={16} />
    <span className="text-[8px] mt-0.5 font-black uppercase">Products</span>
  </button>

</nav>

  </div>
);
};
export default App;

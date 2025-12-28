
import React, { useState, useEffect, useCallback } from 'react';
import { Product, OrderItem, ViewType, SavedOrder, SavedOrderItem } from './types';
import ProductManager from './components/ProductManager';
import OrderForm from './components/OrderForm';
import SummaryView from './components/SummaryView';
import HistoryView from './components/HistoryView';
import VoiceAssistant from './components/VoiceAssistant';
import { BrandLogo } from './components/BrandLogo';
import { calculateItemNet } from './utils/math';
import { ShoppingBag, Package, ClipboardList, Trash2, History, AlertTriangle } from 'lucide-react';

const STORAGE_KEY_PRODUCTS = 'cartonflow_products_v3';
const STORAGE_KEY_ORDER = 'cartonflow_order';
const STORAGE_KEY_HISTORY = 'cartonflow_history_v2';

const INITIAL_IMAGE_PRODUCTS: Product[] = [
  { id: 'p1', code: '23814', name: 'Actara WG 24gm', packagingSize: 100, basePrice: 500, defaultDiscount: 8.39 },
  { id: 'p2', code: '71900', name: 'Acephate 5kg', packagingSize: 3, basePrice: 16000, defaultDiscount: 8.39 },
  { id: 'p3', code: '75150', name: 'Acephate 1kg', packagingSize: 10, basePrice: 3800, defaultDiscount: 8.39 },
  { id: 'p4', code: '65788', name: 'AMPLIGO', packagingSize: 20, basePrice: 2800, defaultDiscount: 8.39 },
  { id: 'p5', code: '73285', name: 'Bifenthrin lt', packagingSize: 12, basePrice: 3000, defaultDiscount: 8.39 },
  { id: 'p6', code: '72069', name: 'Buprofezin 5kg', packagingSize: 3, basePrice: 6200, defaultDiscount: 8.39 },
  { id: 'p7', code: '36583', name: 'Cartap Hydrochloride', packagingSize: 1, basePrice: 2200, defaultDiscount: 8.39 },
  { id: 'p8', code: '70646', name: 'Chlorpyrifos', packagingSize: 12, basePrice: 2500, defaultDiscount: 8.39 },
  { id: 'p9', code: '49600', name: 'Curacron 500 EC 1 Lt', packagingSize: 12, basePrice: 3300, defaultDiscount: 8.39 },
  { id: 'p10', code: '69031', name: 'Dumei 50% WG', packagingSize: 20, basePrice: 4500, defaultDiscount: 8.39 },
  { id: 'p11', code: '70029', name: 'Elestel Neo', packagingSize: 20, basePrice: 3700, defaultDiscount: 8.39 },
  { id: 'p12', code: '76471', name: 'Imidacloprid 20 SL 500 ml', packagingSize: 20, basePrice: 2000, defaultDiscount: 8.39 },
  { id: 'p13', code: '87833', name: 'Incipio 120ml', packagingSize: 20, basePrice: 4300, defaultDiscount: 8.39 },
  { id: 'p14', code: '51889', name: 'Karate 025 EC 250 ml', packagingSize: 20, basePrice: 950, defaultDiscount: 8.39 },
  { id: 'p15', code: '51886', name: 'Karate 025 EC 1 Lt', packagingSize: 12, basePrice: 3400, defaultDiscount: 8.39 },
  { id: 'p16', code: '52432', name: 'Knockout 25SP 100 gm', packagingSize: 30, basePrice: 1100, defaultDiscount: 8.39 },
  { id: 'p17', code: '65583', name: 'Major 60% WDG', packagingSize: 30, basePrice: 1000, defaultDiscount: 8.39 },
  { id: 'p18', code: '35276', name: 'Match 050 EC 200 ml', packagingSize: 20, basePrice: 900, defaultDiscount: 8.39 },
  { id: 'p19', code: '35274', name: 'Match 050 EC 1 Lt', packagingSize: 12, basePrice: 3700, defaultDiscount: 8.39 },
  { id: 'p20', code: '68438', name: 'Plenum 50 wg 120 gm', packagingSize: 30, basePrice: 1500, defaultDiscount: 8.39 },
  { id: 'p21', code: '42140', name: 'Plenum 50 WG 80 gm', packagingSize: 60, basePrice: 800, defaultDiscount: 8.39 },
  { id: 'p22', code: '71360', name: 'Polo 500 SC 200 ml', packagingSize: 20, basePrice: 1550, defaultDiscount: 8.39 },
  { id: 'p23', code: '71391', name: 'Polo 500 SC 1 Lt', packagingSize: 12, basePrice: 7300, defaultDiscount: 8.39 },
  { id: 'p24', code: '49536', name: 'Polytrin C 440 EC 500 ml', packagingSize: 20, basePrice: 2000, defaultDiscount: 8.39 },
  { id: 'p25', code: '49534', name: 'Polytrin C 440 EC 1 Lt', packagingSize: 12, basePrice: 3800, defaultDiscount: 8.39 },
  { id: 'p26', code: '61815', name: 'Proclaim 019 Ec 200 ml', packagingSize: 20, basePrice: 1300, defaultDiscount: 8.39 },
  { id: 'p27', code: '61814', name: 'Proclaim 019 EC 1 Lt', packagingSize: 12, basePrice: 5700, defaultDiscount: 8.39 },
  { id: 'p28', code: '65572', name: 'Pyriproxifen 108 EC 1 Lt', packagingSize: 12, basePrice: 3500, defaultDiscount: 8.39 },
  { id: 'p29', code: '88217', name: 'Simodis 280ml', packagingSize: 20, basePrice: 5500, defaultDiscount: 8.39 },
  { id: 'p30', code: '62112', name: 'Solvigo 108 SC 500 ml', packagingSize: 20, basePrice: 2100, defaultDiscount: 8.39 },
  { id: 'p31', code: '63719', name: 'Solvigo 108 SC 1 Lt', packagingSize: 12, basePrice: 4000, defaultDiscount: 8.39 },
  { id: 'p32', code: '64387', name: 'Transform', packagingSize: 20, basePrice: 1150, defaultDiscount: 8.39 },
  { id: 'p33', code: '52582', name: 'Virtako 0.6 GR 4 Kg', packagingSize: 4, basePrice: 1550, defaultDiscount: 8.39 },
  { id: 'p34', code: '68437', name: 'Virtako 0.6 GR 8 Kg', packagingSize: 2, basePrice: 2950, defaultDiscount: 8.39 },
  { id: 'p35', code: '65648', name: 'Virtako 40 WG 40 gm', packagingSize: 60, basePrice: 1250, defaultDiscount: 8.39 },
  { id: 'p36', code: '71000', name: 'Virtako 40 WG 80 gm', packagingSize: 30, basePrice: 2400, defaultDiscount: 8.39 },
  { id: 'p37', code: '52206', name: 'Voliam Flexi 300 SC 80 ml', packagingSize: 20, basePrice: 1250, defaultDiscount: 8.39 },
  { id: 'p38', code: '52672', name: 'Ally Max 28.6% SG 42 gm', packagingSize: 10, basePrice: 3300, defaultDiscount: 8.39 },
  { id: 'p39', code: '58825', name: 'Ally Max 28.6% SG 14 gm', packagingSize: 120, basePrice: 1150, defaultDiscount: 8.39 },
  { id: 'p40', code: '69118', name: 'APIRO FORTE 160ML', packagingSize: 20, basePrice: 1800, defaultDiscount: 8.39 },
  { id: 'p41', code: '45060', name: 'Axial XL 050 EC 330 ml', packagingSize: 20, basePrice: 1650, defaultDiscount: 8.39 },
  { id: 'p42', code: '45059', name: 'Axial XL 050 EC 1 Lt', packagingSize: 12, basePrice: 4700, defaultDiscount: 8.39 },
  { id: 'p43', code: '63048', name: 'BROMOXYNIL + MCPA 1 Lt', packagingSize: 12, basePrice: 3650, defaultDiscount: 8.39 },
  { id: 'p44', code: '42468', name: 'Dual Gold 800 ml', packagingSize: 12, basePrice: 3200, defaultDiscount: 8.39 },
  { id: 'p45', code: '42465', name: 'Dual Gold 5 Lt', packagingSize: 4, basePrice: 19000, defaultDiscount: 8.39 },
  { id: 'p46', code: '64837', name: 'GENGWEI 1 LT', packagingSize: 12, basePrice: 2300, defaultDiscount: 8.39 },
  { id: 'p47', code: '69937', name: 'Glyphosate 480 SL', packagingSize: 12, basePrice: 2000, defaultDiscount: 8.39 },
  { id: 'p48', code: '62847', name: 'Gramoxone 1 Lt', packagingSize: 12, basePrice: 900, defaultDiscount: 8.39 },
  { id: 'p49', code: '42898', name: 'Logran 16 gm', packagingSize: 20, basePrice: 600, defaultDiscount: 8.39 },
  { id: 'p50', code: '71355', name: 'Pendimethalin', packagingSize: 12, basePrice: 1500, defaultDiscount: 8.39 },
  { id: 'p51', code: '20587', name: 'Primextra Gold 400 ml', packagingSize: 20, basePrice: 850, defaultDiscount: 8.39 },
  { id: 'p52', code: '41132', name: 'Primextra Gold 800 ml', packagingSize: 12, basePrice: 1050, defaultDiscount: 8.39 },
  { id: 'p53', code: '68367', name: 'Ricer 60 OD 250ml', packagingSize: 20, basePrice: 700, defaultDiscount: 8.39 },
  { id: 'p54', code: '68599', name: 'Ricer 60 OD Lt', packagingSize: 12, basePrice: 2400, defaultDiscount: 8.39 },
  { id: 'p55', code: '36412', name: 'Rifit 400 ml', packagingSize: 20, basePrice: 1300, defaultDiscount: 8.39 },
  { id: 'p56', code: '42954', name: 'Topik 120 gm', packagingSize: 20, basePrice: 700, defaultDiscount: 8.39 },
  { id: 'p57', code: '63759', name: 'FUSILADE 800 ml', packagingSize: 12, basePrice: 1500, defaultDiscount: 8.39 },
  { id: 'p58', code: '64944', name: 'SULFOSULFURON 13.5 gm', packagingSize: 20, basePrice: 550, defaultDiscount: 8.39 },
  { id: 'p59', code: '66499', name: 'Winsta 30% WP 100gm', packagingSize: 20, basePrice: 850, defaultDiscount: 8.39 },
  { id: 'p60', code: '71630', name: 'Winsta 30% WP 90gm', packagingSize: 50, basePrice: 1400, defaultDiscount: 8.39 },
  { id: 'p61', code: '73449', name: 'Walter Super', packagingSize: 20, basePrice: 1350, defaultDiscount: 8.39 },
  { id: 'p62', code: '63591', name: 'Amistar Top 200ml', packagingSize: 20, basePrice: 1550, defaultDiscount: 8.39 },
  { id: 'p63', code: '64391', name: 'Amistar Top 600 ml', packagingSize: 12, basePrice: 4400, defaultDiscount: 8.39 },
  { id: 'p64', code: '64148', name: 'Copper Oxychloride 50 WP', packagingSize: 20, basePrice: 1750, defaultDiscount: 8.39 },
  { id: 'p65', code: '64943', name: 'Dragon 400 gm', packagingSize: 20, basePrice: 1400, defaultDiscount: 8.39 },
  { id: 'p66', code: '68454', name: 'Miravis Duo 200SC 200ml', packagingSize: 20, basePrice: 1700, defaultDiscount: 8.39 },
  { id: 'p67', code: '67617', name: 'Miravis Duo 200SC 400ml', packagingSize: 20, basePrice: 3300, defaultDiscount: 8.39 },
  { id: 'p68', code: '87071', name: 'Revus Start Pepite', packagingSize: 30, basePrice: 2950, defaultDiscount: 8.39 },
  { id: 'p69', code: '70526', name: 'Orondis Opti 40.6 SC 400ml', packagingSize: 20, basePrice: 1600, defaultDiscount: 8.39 },
  { id: 'p70', code: '36572', name: 'Revus 240 ml', packagingSize: 20, basePrice: 2500, defaultDiscount: 8.39 },
  { id: 'p71', code: '64782', name: 'Revus 960 ml', packagingSize: 20, basePrice: 9400, defaultDiscount: 8.39 },
  { id: 'p72', code: '63155', name: 'Scholar Lt', packagingSize: 12, basePrice: 7000, defaultDiscount: 8.39 },
  { id: 'p73', code: '60713', name: 'Score 250 ml', packagingSize: 20, basePrice: 1800, defaultDiscount: 8.39 },
  { id: 'p74', code: '27731', name: 'Thiovit Jet 1 Kg', packagingSize: 10, basePrice: 1150, defaultDiscount: 8.39 },
  { id: 'p75', code: '64002', name: 'Thiovit Jet 8 Kg', packagingSize: 2, basePrice: 8500, defaultDiscount: 8.39 },
  { id: 'p76', code: '57402', name: 'Folio Gold 1 Lt', packagingSize: 12, basePrice: 1600, defaultDiscount: 8.39 },
  { id: 'p77', code: '61280', name: 'Tilt 200 ml', packagingSize: 20, basePrice: 1100, defaultDiscount: 8.39 },
  { id: 'p78', code: '64424', name: 'Tilt 1 Lt', packagingSize: 12, basePrice: 4800, defaultDiscount: 8.39 },
  { id: 'p79', code: '17769', name: 'Topas 250 ml', packagingSize: 20, basePrice: 1800, defaultDiscount: 8.39 },
  { id: 'p80', code: '17768', name: 'Topas 1 Lt', packagingSize: 12, basePrice: 6500, defaultDiscount: 8.39 },
  { id: 'p81', code: '65941', name: 'Apron Maxx', packagingSize: 20, basePrice: 350, defaultDiscount: 8.39 },
  { id: 'p82', code: '40185', name: 'Celest 100 FS 1 Lt', packagingSize: 20, basePrice: 3400, defaultDiscount: 8.39 },
  { id: 'p83', code: '76440', name: 'Cruiser 350 FS 100 ml', packagingSize: 20, basePrice: 1100, defaultDiscount: 8.39 },
  { id: 'p84', code: '54561', name: 'Dividend Star 036 FS 50 ml', packagingSize: 20, basePrice: 350, defaultDiscount: 8.39 },
  { id: 'p85', code: '43747', name: 'Dynasty CST 125 FS 30 ml', packagingSize: 20, basePrice: 400, defaultDiscount: 8.39 },
  { id: 'p86', code: '68706', name: 'Vibrance Duo 050FS', packagingSize: 20, basePrice: 1150, defaultDiscount: 8.39 },
  { id: 'p87', code: '40077', name: 'Cultar 250 SC Lt', packagingSize: 12, basePrice: 4500, defaultDiscount: 8.39 },
  { id: 'p88', code: '51462', name: 'Enrich 2 kg', packagingSize: 4, basePrice: 650, defaultDiscount: 8.39 },
  { id: 'p89', code: '88779', name: 'Enrich 8 kg', packagingSize: 2, basePrice: 4500, defaultDiscount: 8.39 },
  { id: 'p90', code: '52186', name: 'Granubor 3 Kg', packagingSize: 4, basePrice: 800, defaultDiscount: 8.39 },
  { id: 'p91', code: '80280', name: 'Isabion 500ml', packagingSize: 20, basePrice: 2000, defaultDiscount: 8.39 },
  { id: 'p92', code: '80279', name: 'Isabion lt', packagingSize: 12, basePrice: 3900, defaultDiscount: 8.39 },
  { id: 'p93', code: '64867', name: 'Naya Zinc Plus 3 Kg', packagingSize: 5, basePrice: 2500, defaultDiscount: 8.81 },
  { id: 'p94', code: '63662', name: 'Quantis 800 ml', packagingSize: 12, basePrice: 1600, defaultDiscount: 8.39 },
  { id: 'p95', code: '41975', name: 'Solubor 1 Kg', packagingSize: 4, basePrice: 750, defaultDiscount: 8.39 },
  { id: 'p96', code: '64385', name: 'Naya NPK 1 Kg', packagingSize: 10, basePrice: 1100, defaultDiscount: 8.39 },
  { id: 'p97', code: '64386', name: 'Naya NPK 8 Kg', packagingSize: 8, basePrice: 6000, defaultDiscount: 8.39 },
  { id: 'p98', code: '72454', name: 'Naya Potash 5lt', packagingSize: 4, basePrice: 8800, defaultDiscount: 8.39 },
  { id: 'p99', code: '62904', name: 'Naya Potash 1 Lt', packagingSize: 12, basePrice: 1750, defaultDiscount: 8.39 },
  { id: 'p100', code: '65269', name: 'Promix 1 Lt', packagingSize: 12, basePrice: 1200, defaultDiscount: 8.39 },
  { id: 'p101', code: '90293', name: 'Naya Sop', packagingSize: 1, basePrice: 11500, defaultDiscount: 8.39 },
  { id: 'p102', code: '75378', name: 'ICON', packagingSize: 100, basePrice: 650, defaultDiscount: 8.39 },
  { id: 'p103', code: '75323', name: 'Klerat', packagingSize: 40, basePrice: 800, defaultDiscount: 8.39 },
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('ORDER');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length < INITIAL_IMAGE_PRODUCTS.length) return INITIAL_IMAGE_PRODUCTS;
        return parsed;
      } catch (e) {
        return INITIAL_IMAGE_PRODUCTS;
      }
    }
    return INITIAL_IMAGE_PRODUCTS;
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(orderItems));
  }, [orderItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(orderHistory));
  }, [orderHistory]);

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
    <div className="min-h-screen pb-24 max-w-lg mx-auto bg-white shadow-2xl relative overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-[#7A2B83] text-white px-4 py-4 shadow-xl border-b-4 border-[#F9E219]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-lg border-2 border-[#F9E219]/20">
                <BrandLogo className="h-9 w-9" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none uppercase">Naya Sawera</h1>
              <p className="text-[#F9E219] text-[9px] font-black uppercase tracking-[0.2em] mt-1">Purchase Order Setup</p>
            </div>
          </div>
          {activeView === 'ORDER' ? (
            <div className="flex gap-2">
                {showClearConfirm && (
                    <button 
                        onClick={handleClearOrder}
                        className="bg-white text-[#7A2B83] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border-2 border-[#F9E219]"
                    >
                        Confirm?
                    </button>
                )}
                <button 
                    type="button"
                    onClick={() => {
                        if (orderItems.length > 0) setShowClearConfirm(!showClearConfirm);
                    }}
                    className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                    orderItems.length > 0 
                        ? (showClearConfirm ? 'bg-red-500 text-white' : 'bg-[#F9E219] text-[#7A2B83] shadow-lg active:scale-95') 
                        : 'bg-white/20 cursor-not-allowed opacity-50'
                    }`}
                    disabled={orderItems.length === 0}
                >
                    <Trash2 size={20} />
                </button>
            </div>
          ) : activeView === 'HISTORY' ? (
            <button 
                type="button"
                onClick={clearHistory}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-red-500 transition-all flex items-center justify-center active:scale-95"
            >
                <Trash2 size={20} />
            </button>
          ) : null}
        </div>
      </header>

      <main className="p-4" onClick={() => showClearConfirm && setShowClearConfirm(false)}>
        {activeView === 'ORDER' && (
          <OrderForm 
            products={products}
            orderItems={orderItems}
            onUpdateOrder={addOrUpdateOrderItem}
            onRemoveItem={removeOrderItem}
            onClearAll={handleClearOrder}
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

      {/* Voice Ordering Assistant FAB */}
      <VoiceAssistant 
        products={products}
        onAddItems={handleVoiceOrder}
      />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-sm bg-slate-900 text-white rounded-[2rem] p-2 flex justify-around items-center shadow-2xl z-50 border border-slate-700/50 backdrop-blur-xl">
        <button 
          onClick={() => setActiveView('ORDER')}
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${activeView === 'ORDER' ? 'bg-[#7A2B83] scale-110 shadow-lg shadow-[#7A2B83]/40 border-b-2 border-[#F9E219]' : 'text-slate-400 hover:text-white'}`}
        >
          <ShoppingBag size={20} />
          <span className="text-[9px] mt-1 font-black uppercase tracking-widest">Order</span>
        </button>
        <button 
          onClick={() => setActiveView('SUMMARY')}
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${activeView === 'SUMMARY' ? 'bg-[#7A2B83] scale-110 shadow-lg shadow-[#7A2B83]/40 border-b-2 border-[#F9E219]' : 'text-slate-400 hover:text-white'}`}
        >
          <ClipboardList size={20} />
          <span className="text-[9px] mt-1 font-black uppercase tracking-widest">Summary</span>
        </button>
        <button 
          onClick={() => setActiveView('HISTORY')}
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${activeView === 'HISTORY' ? 'bg-[#7A2B83] scale-110 shadow-lg shadow-[#7A2B83]/40 border-b-2 border-[#F9E219]' : 'text-slate-400 hover:text-white'}`}
        >
          <History size={20} />
          <span className="text-[9px] mt-1 font-black uppercase tracking-widest">History</span>
        </button>
        <button 
          onClick={() => setActiveView('PRODUCTS')}
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${activeView === 'PRODUCTS' ? 'bg-[#7A2B83] scale-110 shadow-lg shadow-[#7A2B83]/40 border-b-2 border-[#F9E219]' : 'text-slate-400 hover:text-white'}`}
        >
          <Package size={20} />
          <span className="text-[9px] mt-1 font-black uppercase tracking-widest">Products</span>
        </button>
      </nav>
    </div>
  );
};

export default App;

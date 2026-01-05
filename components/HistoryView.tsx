
import React, { useState } from 'react';
import { SavedOrder } from '../types';
import { formatCurrency } from '../utils/math';
import { Clock, Copy, Trash2, Check, ChevronDown, ChevronUp, Package, Tag, Calculator } from 'lucide-react';

interface HistoryViewProps {
  history: SavedOrder[];
  onDelete: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onDelete }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCopy = (order: SavedOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(order.outcomeString);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xs font-black text-slate-800 dark:text-slate-300 uppercase tracking-[0.2em]">Record History</h2>
        <span className="text-[9px] font-black text-[#7A2B83] dark:text-[#F9E219] uppercase bg-[#F9E219] dark:bg-[#F9E219]/20 px-3 py-1.5 rounded-full border border-[#7A2B83]/10 dark:border-[#F9E219]/30">
            Vault Archive
        </span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#1A0B1E] border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-inner">
          <Clock size={48} className="mx-auto mb-4 text-[#7A2B83] opacity-10" />
          <p className="font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest text-xs">No Records Found</p>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          {history.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div 
                key={order.id} 
                className={`bg-white dark:bg-[#1A0B1E] rounded-[2.5rem] border-2 transition-all overflow-hidden ${isExpanded ? 'border-[#7A2B83] dark:border-[#F9E219]/40 shadow-2xl' : 'border-slate-100 dark:border-slate-800 shadow-md'}`}
              >
                <div 
                  className="p-6 cursor-pointer select-none"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#7A2B83] dark:text-[#F9E219] uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={12} strokeWidth={3} className="text-[#F9E219] fill-[#7A2B83]" /> {formatDate(order.timestamp)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleCopy(order, e)}
                        className={`p-2.5 rounded-xl transition-all active:scale-90 border-2 ${copiedId === order.id ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'}`}
                      >
                        {copiedId === order.id ? <Check size={16} strokeWidth={3} /> : <Copy size={16} strokeWidth={3} />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-2 border-slate-100 dark:border-slate-800"
                      >
                        <Trash2 size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</span>
                      <span className="text-xl font-black text-[#7A2B83] dark:text-[#F9E219] leading-none">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className={`${isExpanded ? 'text-[#7A2B83] dark:text-[#F9E219]' : 'text-slate-200 dark:text-slate-800'}`}>
                      {isExpanded ? <ChevronUp size={24} strokeWidth={4} /> : <ChevronDown size={24} strokeWidth={4} />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-slate-50 dark:bg-slate-950/50 border-t-2 border-slate-100 dark:border-slate-800 p-6 shadow-inner transition-colors">
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-[0.2em]">
                      <Calculator size={12} className="text-[#7A2B83] dark:text-[#F9E219]" /> Item Details
                    </h4>
                    <div className="space-y-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#1A0B1E] p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white leading-tight uppercase">{item.name}</p>
                              <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase font-black mt-0.5">{item.code}</p>
                            </div>
                            <span className="text-xs font-black text-[#7A2B83] dark:text-[#F9E219]">{formatCurrency(item.netAmount)}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                              <Package size={12} className="text-[#F9E219] fill-[#7A2B83]" /> {item.quantity} units
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                              <Tag size={12} className="text-emerald-500 fill-emerald-100" /> {item.discount}% off
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Generated Output String</p>
                       <div className="bg-[#7A2B83] dark:bg-[#1A0B1E] text-[#F9E219] p-4 rounded-2xl font-mono text-[10px] break-all border-2 border-black/10 dark:border-slate-700 shadow-xl">
                         {order.outcomeString}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryView;

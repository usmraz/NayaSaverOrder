
import React, { useState } from 'react';
import { OrderItem } from '../types';
import { unitsToCartons } from '../utils/math';
import { BrandLogo } from './BrandLogo';
import { Copy, Share2, ArrowLeft, Check, Wand2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface SummaryViewProps {
  orderItems: OrderItem[];
  onBack: () => void;
  onSaveToHistory: (outcome: string) => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ orderItems, onBack, onSaveToHistory }) => {
  const [copied, setCopied] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const summaryString = orderItems
    .map(item => `${item.product.code} ${unitsToCartons(item.quantity, item.product.packagingSize)}`)
    .join(',');

  const handleCopy = () => {
    if (!summaryString) return;
    navigator.clipboard.writeText(summaryString);
    setCopied(true);
    onSaveToHistory(summaryString);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Naya Sawera Purchase Order',
          text: summaryString,
        });
      } catch (e) {
        console.error('Error sharing', e);
      }
    } else {
      handleCopy();
    }
  };

  const generateAImemo = async () => {
    if (orderItems.length === 0) return;
    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey:AIzaSyAw98bSHvBsScGZr9Wcm68LkdzkWdvR5fc});
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a professional and concise Purchase Order internal memo for Naya Sawera for the following items: ${summaryString}. Note that the format is "CODE QUANTITY". Return only the memo text.`,
      });
      setAiAnalysis(response.text || 'Could not generate memo.');
    } catch (err) {
      setAiAnalysis('Gemini service unavailable. Please check your network.');
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 transition-colors">
      <div className="bg-[#7A2B83] dark:bg-[#1A0B1E] text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border-4 border-[#F9E219]/20 dark:border-[#F9E219]/10">
        <div className="absolute -top-6 -right-6 opacity-10 dark:opacity-5 rotate-12">
          <BrandLogo className="w-64 h-64" />
        </div>
        
        <h2 className="text-xl font-black mb-6 relative z-10 flex items-center gap-3 uppercase tracking-widest">
          <div className="bg-[#F9E219] h-2 w-8 rounded-full"></div> Output Code
        </h2>
        
        <div className="bg-black/20 dark:bg-black/40 backdrop-blur-md rounded-[2rem] p-6 border-2 border-white/10 relative z-10 shadow-inner">
          <p className="text-xl font-mono font-black text-[#F9E219] leading-relaxed tracking-[0.2em] break-all">
            {summaryString || 'NO ITEMS'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
          <button 
            onClick={handleCopy}
            disabled={!summaryString}
            className={`flex items-center justify-center gap-2 font-black py-4 px-4 rounded-2xl shadow-xl transition-all disabled:opacity-50 uppercase tracking-widest text-xs border-b-4 ${copied ? 'bg-emerald-500 text-white border-emerald-700' : 'bg-white dark:bg-slate-900 text-[#7A2B83] dark:text-[#F9E219] border-slate-200 dark:border-slate-800'}`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button 
            onClick={handleShare}
            disabled={!summaryString}
            className="flex items-center justify-center gap-2 bg-[#F9E219] text-[#7A2B83] font-black py-4 px-4 rounded-2xl shadow-xl transition-all disabled:opacity-50 uppercase tracking-widest text-xs border-b-4 border-[#c8b614]"
          >
            <Share2 size={18} /> Share
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1A0B1E] p-7 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-slate-800 dark:text-slate-300 uppercase text-xs tracking-widest">Internal Memo</h3>
          <button 
            onClick={generateAImemo}
            disabled={isThinking || orderItems.length === 0}
            className="text-[#7A2B83] dark:text-[#F9E219] disabled:opacity-30 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-[#F9E219]/10 px-3 py-2 rounded-full border border-[#F9E219]/30"
          >
            <Wand2 size={14} /> {isThinking ? 'Thinking...' : 'AI Memo'}
          </button>
        </div>
        
        {aiAnalysis ? (
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-2 border-slate-100 dark:border-slate-800 whitespace-pre-wrap font-medium">
            {aiAnalysis}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase font-black tracking-widest">AI Memo Generator Ready</p>
          </div>
        )}
      </div>

      <div className="pt-4 px-2 pb-20">
        <button 
          onClick={onBack}
          className="w-full text-slate-400 dark:text-slate-500 font-black py-4 rounded-3xl flex items-center justify-center gap-2 hover:text-[#7A2B83] transition-all border-2 border-transparent uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft size={18} /> Modify Configuration
        </button>
      </div>
    </div>
  );
};

export default SummaryView;

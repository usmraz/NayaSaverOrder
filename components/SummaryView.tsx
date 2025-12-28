
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

  /**
   * Final Outcome Format:
   * product code quantity in cartons,product code quantity in cartons
   * e.g. "23814 5,71900 10"
   */
  const summaryString = orderItems
    .map(item => `${item.product.code} ${unitsToCartons(item.quantity, item.product.packagingSize)}`)
    .join(',');

  const handleCopy = () => {
    if (!summaryString) return;
    navigator.clipboard.writeText(summaryString);
    setCopied(true);
    // Save to history record specifically on copy action
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="bg-[#7A2B83] text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border-4 border-[#F9E219]/20">
        <div className="absolute -top-6 -right-6 opacity-10 rotate-12">
          <BrandLogo className="w-64 h-64" />
        </div>
        
        <h2 className="text-xl font-black mb-6 relative z-10 flex items-center gap-3 uppercase tracking-widest">
          <div className="bg-[#F9E219] h-2 w-8 rounded-full"></div> Final Outcome
        </h2>
        
        <div className="bg-black/20 backdrop-blur-md rounded-[2rem] p-6 border-2 border-white/10 relative z-10 shadow-inner">
          <p className="text-xl font-mono font-black text-[#F9E219] leading-relaxed tracking-[0.2em] break-all">
            {summaryString || 'NO ITEMS ADDED'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
          <button 
            onClick={handleCopy}
            disabled={!summaryString}
            className={`flex items-center justify-center gap-2 font-black py-4 px-4 rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-xs border-b-4 ${copied ? 'bg-emerald-500 text-white border-emerald-700' : 'bg-white text-[#7A2B83] border-slate-200'}`}
          >
            {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={18} strokeWidth={3} />}
            {copied ? 'Recorded' : 'Copy Codes'}
          </button>
          <button 
            onClick={handleShare}
            disabled={!summaryString}
            className="flex items-center justify-center gap-2 bg-[#F9E219] text-[#7A2B83] font-black py-4 px-4 rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-xs border-b-4 border-[#c8b614]"
          >
            <Share2 size={18} strokeWidth={3} /> Share
          </button>
        </div>
        {copied && (
            <p className="text-[9px] text-center mt-4 text-[#F9E219] font-black animate-pulse uppercase tracking-[0.3em]">
                Successfully Added to History Records
            </p>
        )}
      </div>

      <div className="bg-white p-7 rounded-[2.5rem] border-2 border-slate-100 shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Order Detail Memo</h3>
          <button 
            onClick={generateAImemo}
            disabled={isThinking || orderItems.length === 0}
            className="text-[#7A2B83] hover:text-[#68246f] disabled:opacity-30 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-[#F9E219]/20 px-3 py-2 rounded-full border border-[#F9E219]/30"
          >
            <Wand2 size={14} /> {isThinking ? 'Processing...' : 'Generate AI Memo'}
          </button>
        </div>
        
        {aiAnalysis ? (
          <div className="bg-slate-50 p-5 rounded-3xl text-xs text-slate-700 leading-relaxed border-2 border-slate-100 whitespace-pre-wrap font-medium">
            {aiAnalysis}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest italic leading-relaxed">
                Click "Generate AI Memo" to create a professional internal document for this purchase order.
            </p>
          </div>
        )}
      </div>

      <div className="pt-4 px-2">
        <button 
          onClick={onBack}
          className="w-full text-slate-400 font-black py-4 rounded-3xl flex items-center justify-center gap-2 hover:bg-white hover:text-[#7A2B83] hover:shadow-md transition-all border-2 border-transparent hover:border-[#7A2B83]/10 uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft size={18} strokeWidth={3} /> Modify Purchase Setup
        </button>
      </div>
    </div>
  );
};

export default SummaryView;

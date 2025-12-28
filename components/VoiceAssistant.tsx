
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Loader2, X } from 'lucide-react';
import { Product } from '../types';

interface VoiceAssistantProps {
  products: Product[];
  onAddItems: (items: { codeOrName: string; quantity: number }[]) => string;
}

// Audio encoding/decoding helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ products, onAddItems }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<string>('Standby');
  
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);

  const stopSession = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (audioContextInRef.current) {
      audioContextInRef.current.close();
      audioContextInRef.current = null;
    }
    if (audioContextOutRef.current) {
      audioContextOutRef.current.close();
      audioContextOutRef.current = null;
    }
    
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    
    setIsActive(false);
    setIsConnecting(false);
    setStatus('Standby');
    sessionRef.current = null;
  }, []);

  const startSession = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setStatus('Initializing Audio...');

    try {
      // 1. AudioContext must be resumed via user gesture
      const audioCtxIn = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const audioCtxOut = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      await audioCtxIn.resume();
      await audioCtxOut.resume();
      
      audioContextInRef.current = audioCtxIn;
      audioContextOutRef.current = audioCtxOut;

      // 2. Microphone stream
      setStatus('Requesting Mic...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        } 
      });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const productList = products.map(p => `${p.name} (Code: ${p.code})`).join(', ');

      setStatus('Connecting to Gemini...');
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are the Naya Sawera AI Order Assistant. Help the user place orders by voice.
          The available products are: ${productList}.
          If the user specifies items, use the 'add_to_order' tool.
          Confirm clearly what was added. If you are unsure of a product, ask for clarification.`,
          tools: [{
            functionDeclarations: [{
              name: 'add_to_order',
              description: 'Adds items to the current purchase order.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        codeOrName: { type: Type.STRING },
                        quantity: { type: Type.NUMBER }
                      },
                      required: ['codeOrName', 'quantity']
                    }
                  }
                },
                required: ['items']
              }
            }]
          }]
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setStatus('Mic Active');
            
            const source = audioCtxIn.createMediaStreamSource(stream);
            const scriptProcessor = audioCtxIn.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(() => {});
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioCtxIn.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle tool calls
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'add_to_order') {
                  const result = onAddItems(fc.args.items);
                  sessionPromise.then(session => session.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result } }
                  }));
                }
              }
            }

            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextOutRef.current) {
              const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextOutRef.current, 24000, 1);
              const source = audioContextOutRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextOutRef.current.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextOutRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Gemini Live Error:', e);
            stopSession();
          },
          onclose: () => stopSession()
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Startup failure:', err);
      setStatus('Mic Error');
      stopSession();
    }
  };

  return (
    <div className="fixed bottom-28 right-6 z-[60]">
      {isActive && (
        <div className="absolute bottom-20 right-0 w-64 bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl border-2 border-[#F9E219]/20 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F9E219]">Assistant Active</span>
            <button onClick={stopSession} className="p-1.5 hover:bg-white/10 rounded-xl transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5 h-10 items-center">
              {[1,2,3,4,5].map(i => (
                <div 
                  key={i} 
                  className="w-1.5 bg-[#F9E219] rounded-full animate-pulse shadow-[0_0_10px_rgba(249,226,25,0.4)]" 
                  style={{ 
                    height: `${30 + Math.random() * 70}%`, 
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '0.8s'
                  }}
                ></div>
              ))}
            </div>
            <div className="flex flex-col">
                <p className="text-xs font-black uppercase tracking-tight leading-none">{status}</p>
                <p className="text-[9px] text-slate-400 mt-1 font-bold">Listening for order...</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 relative group ${
          isActive 
            ? 'bg-red-500 text-white ring-4 ring-red-500/30' 
            : 'bg-[#7A2B83] text-white border-4 border-[#F9E219]/30 hover:border-[#F9E219]/60'
        }`}
      >
        {isConnecting ? (
          <Loader2 className="animate-spin" size={24} strokeWidth={3} />
        ) : isActive ? (
          <MicOff size={24} strokeWidth={3} />
        ) : (
          <Mic size={24} strokeWidth={3} />
        )}
        
        {isActive && (
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;

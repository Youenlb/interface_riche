'use client'
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/app/types";

interface ChatProps {
  currentTime: number; 
  onTimestampClick: (t: number) => void;
}

export default function Chat({ currentTime, onTimestampClick }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [pseudo, setPseudo] = useState("Moi"); 
  
  // --- GESTION DU TIMECODE MANUEL ---
  const [includeTime, setIncludeTime] = useState(false);
  const [manualHour, setManualHour] = useState("00");
  const [manualMin, setManualMin] = useState("00");
  const [manualSec, setManualSec] = useState("00");

  const ws = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Connexion WebSocket
  useEffect(() => {
    ws.current = new WebSocket("wss://tp-iai3.cleverapps.io");

    ws.current.onopen = () => console.log("✅ Connecté au Chat WS");

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          setMessages((prev) => {
            const newMsgs = [...prev, ...data];
            const uniqueMsgs = newMsgs.filter((msg, index, self) =>
                index === self.findIndex((t) => (
                    t.when === msg.when && t.name === msg.name && t.message === msg.message
                ))
            );
            return uniqueMsgs.sort((a,b) => Number(a.when) - Number(b.when));
          });
        } else {
          setMessages((prev) => {
            const exists = prev.some(m => m.when === data.when && m.name === data.name && m.message === data.message);
            if (exists) return prev;
            return [...prev, data];
          });
        }
      } catch (e) { console.error(e); }
    };
    return () => { if (ws.current) ws.current.close(); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // --- Helpers ---
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatMessageDate = (unixTimestamp: string) => {
    let ts = Number(unixTimestamp);
    if (!ts || isNaN(ts)) return "À l'instant";
    if (ts < 10000000000) ts *= 1000;

    const date = new Date(ts);
    return date.toLocaleString('fr-FR', { 
      day: '2-digit', month: '2-digit', year: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const syncWithCurrentTime = () => {
    const h = Math.floor(currentTime / 3600);
    const remainingTime = currentTime % 3600;
    const m = Math.floor(remainingTime / 60);
    const s = Math.floor(remainingTime % 60);

    setManualHour(h.toString().padStart(2, '0'));
    setManualMin(m.toString().padStart(2, '0'));
    setManualSec(s.toString().padStart(2, '0'));
  };

  const toggleTimeOption = () => {
    if (!includeTime) syncWithCurrentTime();
    setIncludeTime(!includeTime);
  };

  // 2. Envoi du message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    let calculatedMoment = undefined;
    if (includeTime) {
        const h = parseInt(manualHour) || 0;
        const m = parseInt(manualMin) || 0;
        const s = parseInt(manualSec) || 0;
        calculatedMoment = (h * 3600) + (m * 60) + s;
    }

    const msgToSend: ChatMessage = {
      name: pseudo,
      message: inputText,
      when: Math.floor(Date.now() / 1000).toString(),
      moment: calculatedMoment
    };

    ws.current.send(JSON.stringify(msgToSend));
    setMessages((prev) => [...prev, msgToSend]);
    setInputText("");
    setIncludeTime(false);
  };

  return (
    <section aria-labelledby="chat-heading" className="flex flex-col h-full bg-white">
      
      {/* HEADER */}
      <div className="px-5 py-3 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
        <h2 id="chat-heading" className="m-0 text-lg text-gray-800 font-bold flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Chat
        </h2>
        
        {/* INPUT PSEUDO */}
        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 transition-colors focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
            <label htmlFor="pseudo-input" className="text-xs text-indigo-800 font-bold uppercase tracking-wider select-none">Moi :</label>
            <input 
                id="pseudo-input"
                type="text" 
                value={pseudo} 
                onChange={(e) => setPseudo(e.target.value)} 
                className="w-20 bg-transparent text-sm font-bold text-indigo-700 focus:outline-none border-none focus:ring-0 transition-colors placeholder-indigo-300"
                placeholder="Nom"
            />
        </div>
      </div>

      {/* MESSAGES */}
      <div 
        ref={scrollRef}
        role="log" 
        aria-live="polite"
        className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 scroll-smooth"
      >
        {messages.map((msg, index) => {
            const isMe = msg.name === pseudo;
            return (
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`flex gap-2 text-[10px] mb-1 px-2 text-gray-400 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <strong className="font-bold text-gray-500">{msg.name}</strong> 
                    <span>{formatMessageDate(msg.when)}</span>
                </div>

                <div className={`
                    max-w-[85%] p-3 rounded-2xl shadow-sm relative group transition-all
                    ${isMe 
                        ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-200' 
                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'}
                `}>
                    <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    
                    {msg.moment !== undefined && (
                        <button 
                            onClick={() => onTimestampClick(msg.moment!)}
                            className={`
                                mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all
                                ${isMe
                                    ? 'bg-indigo-700 text-indigo-100 hover:bg-indigo-800 ring-1 ring-indigo-500'
                                    : 'bg-gray-50 text-indigo-600 hover:bg-indigo-50 ring-1 ring-gray-200'}
                            `}
                        >
                            <span>▶ Aller à {formatTime(msg.moment)}</span>
                        </button>
                    )}
                </div>
              </div>
            );
        })}
      </div>

      {/* FOOTER */}
      <div className="border-t border-gray-100 bg-white p-4 relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        
        {/* BARRE D'OUTILS (TIMECODE) */}
        <div className="mb-3 flex items-center gap-4 flex-wrap">
            <button
                type="button"
                onClick={toggleTimeOption}
                aria-pressed={includeTime}
                className={`
                    flex items-center gap-2 text-xs font-bold transition-all px-2 py-1 rounded
                    ${includeTime ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}
                `}
            >
                <div className={`
                    w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-all
                    ${includeTime ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300'}
                `}>
                    {includeTime && '✓'}
                </div>
                Joindre un timecode
            </button>

            {includeTime && (
                <div className="flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    {['HH', 'MM', 'SS'].map((placeholder, i) => {
                        const val = i === 0 ? manualHour : i === 1 ? manualMin : manualSec;
                        const setVal = i === 0 ? setManualHour : i === 1 ? setManualMin : setManualSec;
                        return (
                            <div key={placeholder} className="relative group p-4">
                                <input 
                                    type="number" 
                                    value={val}
                                    onChange={(e) => setVal(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-20 p-4 h-8 text-center bg-indigo-50 border border-indigo-100 rounded-md text-sm font-bold text-indigo-700 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder-indigo-300 focus:outline-none"
                                />
                            </div>
                        )
                    })}
                </div>
            )}
        </div>

        {/* INPUT MESSAGE & SEND */}
        <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="w-full pl-5 pr-4 py-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900 placeholder-indigo-300 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner font-medium focus:outline-none"
                />
            </div>
            
            <button 
                type="submit" 
                disabled={!inputText.trim()}
                // CORRECTION ICI : Remplacement du gris par un indigo pâle + bordure légère
                className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform
                    ${inputText.trim() 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110 hover:shadow-lg shadow-md cursor-pointer' 
                        : 'bg-indigo-50 text-indigo-300 border border-indigo-100 cursor-not-allowed'}
                `}
                aria-label="Envoyer"
            >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
            </button>
        </form>
      </div>
    </section>
  );
}
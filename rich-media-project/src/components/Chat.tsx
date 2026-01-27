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
            // Dédoublonnage + Tri
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
    const date = new Date(Number(unixTimestamp) * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    <section aria-labelledby="chat-heading" className="flex flex-col h-full border border-swedish-grey rounded-lg bg-white overflow-hidden shadow-sm">
      
      {/* Header */}
      <div className="p-3 bg-gray-50 border-b border-swedish-grey flex justify-between items-center">
        <h2 id="chat-heading" className="m-0 text-lg text-swedish-blue font-bold">Discussion</h2>
        <div className="flex items-center gap-2">
            <label htmlFor="pseudo-input" className="text-xs text-gray-500 font-bold">Pseudo:</label>
            <input 
                id="pseudo-input"
                type="text" 
                value={pseudo} 
                onChange={(e) => setPseudo(e.target.value)} 
                className="w-24 p-1 text-sm rounded border border-gray-300 focus:border-swedish-blue outline-none"
            />
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        role="log" 
        aria-live="polite"
        className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3"
      >
        {messages.map((msg, index) => {
            const isMe = msg.name === pseudo;
            return (
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`
                    max-w-[85%] p-3 rounded-lg shadow-sm border
                    ${isMe 
                        ? 'bg-blue-50 border-blue-100 text-right' 
                        : 'bg-white border-gray-200 text-left'}
                `}>
                    <div className={`flex gap-2 text-xs mb-1 text-gray-500 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <strong className="text-swedish-sage">{msg.name}</strong> 
                        <span>{formatMessageDate(msg.when)}</span>
                    </div>
                    
                    <p className="m-0 text-swedish-charcoal text-sm leading-relaxed">{msg.message}</p>
                    
                    {msg.moment !== undefined && (
                        <button 
                            onClick={() => onTimestampClick(msg.moment!)}
                            className="mt-2 inline-flex items-center gap-2 px-3 py-1 text-xs font-bold text-swedish-blue border border-swedish-blue rounded-full bg-white hover:bg-blue-50 transition-colors"
                        >
                            <span>⏱ Aller à {formatTime(msg.moment)}</span>
                        </button>
                    )}
                </div>
              </div>
            );
        })}
      </div>

      {/* Zone de saisie */}
      <div className="border-t border-swedish-grey bg-white p-3">
        
        {/* OPTIONS TIMECODE */}
        <div className="mb-3 flex items-center gap-3 flex-wrap">
            <button
                type="button"
                onClick={toggleTimeOption}
                aria-pressed={includeTime}
                className={`
                    flex items-center gap-2 text-sm transition-colors
                    ${includeTime ? 'text-swedish-blue font-bold' : 'text-gray-500'}
                `}
            >
                <div className={`
                    w-4 h-4 border rounded flex items-center justify-center text-[10px]
                    ${includeTime ? 'bg-swedish-blue border-swedish-blue text-white' : 'bg-white border-gray-300'}
                `}>
                    {includeTime && '✓'}
                </div>
                Joindre un moment
            </button>

            {includeTime && (
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded">
                    {/* INPUTS HH:MM:SS */}
                    {['HH', 'MM', 'SS'].map((placeholder, i) => {
                        const val = i === 0 ? manualHour : i === 1 ? manualMin : manualSec;
                        const setVal = i === 0 ? setManualHour : i === 1 ? setManualMin : setManualSec;
                        
                        return (
                            <div key={placeholder} className="flex items-center">
                                <input 
                                    type="number" 
                                    value={val}
                                    onChange={(e) => setVal(e.target.value)}
                                    placeholder={placeholder}
                                    aria-label={placeholder}
                                    className="w-10 text-center border border-gray-300 rounded text-sm p-0.5 focus:border-swedish-blue outline-none"
                                />
                                {i < 2 && <span className="font-bold text-gray-400 mx-1">:</span>}
                            </div>
                        )
                    })}

                    <button 
                        type="button"
                        onClick={syncWithCurrentTime}
                        title="Utiliser le temps actuel"
                        className="ml-2 text-red-500 hover:text-red-700 text-lg leading-none"
                    >
                        📍
                    </button>
                </div>
            )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Écrire un message..."
                className="flex-1 p-3 rounded-full border border-swedish-grey bg-gray-50 focus:bg-white focus:border-swedish-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <button 
                type="submit" 
                disabled={!inputText.trim()}
                className={`
                    px-6 rounded-full font-bold text-white transition-all
                    ${inputText.trim() 
                        ? 'bg-swedish-blue hover:bg-opacity-90 cursor-pointer shadow-md' 
                        : 'bg-gray-300 cursor-not-allowed'}
                `}
            >
            Envoyer
            </button>
        </form>
      </div>
    </section>
  );
}
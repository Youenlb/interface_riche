'use client'
import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/app/types";
import { formatTime, formatMessageDate } from "@/app/utils";

// --- LOGIQUE MÉTIER & STYLES ---

const processBulkMessages = (prev: ChatMessage[], newMsgs: ChatMessage[]) => {
  const combined = [...prev, ...newMsgs];
  const uniqueMsgs = combined.filter((msg, index, self) =>
      index === self.findIndex((t) => (
          t.when === msg.when && t.name === msg.name && t.message === msg.message
      ))
  );
  return uniqueMsgs.sort((a, b) => Number(a.when) - Number(b.when));
};

const processSingleMessage = (prev: ChatMessage[], data: ChatMessage) => {
  const exists = prev.some(m => 
    m.when === data.when && m.name === data.name && m.message === data.message
  );
  if (exists) return prev;
  return [...prev, data];
};

const getMessageBubbleClasses = (isMe: boolean) => 
  isMe 
    ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-200' 
    : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm';

const getTimestampButtonClasses = (isMe: boolean) =>
  isMe
    ? 'bg-indigo-700 text-indigo-100 hover:bg-indigo-800 ring-1 ring-indigo-500'
    : 'bg-gray-50 text-indigo-600 hover:bg-indigo-50 ring-1 ring-gray-200';

const getSendButtonClasses = (text: string) => 
  text.trim() 
    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110 hover:shadow-lg shadow-md cursor-pointer' 
    : 'bg-indigo-50 text-indigo-300 border border-indigo-100 cursor-not-allowed';


// --- COMPOSANT PRINCIPAL ---

interface ChatProps {
  readonly currentTime: number; 
  readonly onTimestampClick: (t: number) => void;
}

export default function Chat({ currentTime, onTimestampClick }: ChatProps) {
  // States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [pseudo, setPseudo] = useState("Moi"); 
  
  // Timecode States
  const [includeTime, setIncludeTime] = useState(false);
  const [manualHour, setManualHour] = useState("00");
  const [manualMin, setManualMin] = useState("00");
  const [manualSec, setManualSec] = useState("00");

  const ws = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Connexion WebSocket
  useEffect(() => {
    ws.current = new WebSocket("wss://tp-iai3.cleverapps.io");
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          setMessages((prev) => processBulkMessages(prev, data));
        } else {
          setMessages((prev) => processSingleMessage(prev, data));
        }
      } catch (e) { console.error(e); }
    };
    return () => { if (ws.current) ws.current.close(); };
  }, []);

  // Scroll auto
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Sync Logique
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    let calculatedMoment = undefined;
    if (includeTime) {
        const h = Number.parseInt(manualHour, 10) || 0;
        const m = Number.parseInt(manualMin, 10) || 0;
        const s = Number.parseInt(manualSec, 10) || 0;
        calculatedMoment = (h * 3600) + (m * 60) + s;
    }

    const msgToSend: ChatMessage = {
      name: pseudo,
      message: inputText,
      when: Math.floor(Date.now() / 1000).toString(),
      moment: calculatedMoment
    };

    ws.current.send(JSON.stringify(msgToSend));
    setMessages((prev) => processSingleMessage(prev, msgToSend));
    
    setInputText("");
    setIncludeTime(false);
  };

  const timeInputsConfig = [
    { label: 'HH', value: manualHour, setter: setManualHour },
    { label: 'MM', value: manualMin, setter: setManualMin },
    { label: 'SS', value: manualSec, setter: setManualSec },
  ];

  const timecodeToggleClasses = includeTime 
    ? 'text-indigo-600 bg-indigo-50' 
    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50';

  const timecodeIconClasses = includeTime 
    ? 'bg-indigo-600 border-indigo-600 text-white' 
    : 'bg-white border-gray-300';

  return (
    <div aria-labelledby="chat-heading" className="flex flex-col h-full bg-white">
      
      {/* HEADER */}
      <div className="px-5 py-3 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
        <h3 id="chat-heading" className="m-0 text-lg text-gray-800 font-bold flex items-center gap-2">
          <span className="relative flex h-3 w-3" aria-hidden="true" title="Connecté">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span aria-hidden="true">Chat</span>
          <span className="sr-only">Chat en direct - Connecté - {messages.length} messages dans l&apos;historique</span>
        </h3>
        
        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 transition-colors focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
            <label htmlFor="pseudo-input" className="text-sm text-indigo-800 font-bold uppercase tracking-wider select-none">Pseudo :</label>
            <input 
                id="pseudo-input"
                type="text" 
                value={pseudo} 
                onChange={(e) => setPseudo(e.target.value)} 
                aria-describedby="pseudo-help"
                className="w-20 bg-transparent text-sm font-bold text-indigo-700 focus:outline-none border-none focus:ring-0 transition-colors placeholder-indigo-300"
                placeholder="Votre nom"
            />
            <span id="pseudo-help" className="sr-only">Entrez votre pseudonyme pour le chat</span>
        </div>
      </div>

      {/* MESSAGES */}
      <div 
        ref={scrollRef}
        role="log" 
        aria-live="polite"
        aria-label={`Historique de la discussion - ${messages.length} messages`}
        aria-atomic="false"
        aria-relevant="additions text"
        aria-describedby="chat-instructions"
        tabIndex={0}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 scroll-smooth focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
      >
        <p id="chat-instructions" className="sr-only">Les nouveaux messages seront annoncés automatiquement. Utilisez les flèches pour naviguer dans l&apos;historique.</p>
        {messages.map((msg, index) => {
            const isMe = msg.name === pseudo;
            const messageKey = `${msg.when}-${msg.name}-${index}`; 

            return (
              <div key={messageKey} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`flex gap-2 text-[10px] mb-1 px-2 text-gray-400 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <strong className="font-bold text-gray-500">{msg.name}</strong> 
                    <span>{formatMessageDate(msg.when)}</span>
                </div>

                <div className={`
                    max-w-[85%] p-3 rounded-2xl shadow-sm relative group transition-all
                    ${getMessageBubbleClasses(isMe)}
                `}>
                    <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    
                    {msg.moment !== undefined && (
                        <button 
                            onClick={() => onTimestampClick(msg.moment!)}
                            aria-label={`Aller au moment ${formatTime(msg.moment)} dans la vidéo`}
                            className={`
                                mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all
                                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
                                ${getTimestampButtonClasses(isMe)}
                            `}
                        >
                            <span aria-hidden="true">▶</span>
                            <span>Aller à {formatTime(msg.moment)}</span>
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
        <fieldset className="mb-3 flex items-center gap-4 flex-wrap border-0 p-0 m-0">
            <legend className="sr-only">Options de timecode</legend>
            <button
                type="button"
                onClick={toggleTimeOption}
                aria-pressed={includeTime}
                aria-expanded={includeTime}
                aria-controls="timecode-inputs"
                className={`
                    flex items-center gap-2 text-sm font-bold transition-all px-3 py-2 rounded
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
                    ${timecodeToggleClasses}
                `}
            >
                <span className={`
                    w-5 h-5 rounded border flex items-center justify-center text-xs transition-all
                    ${timecodeIconClasses}
                `} aria-hidden="true">
                    {includeTime && '✓'}
                </span>
                Joindre un timecode
            </button>

            {includeTime && (
                <div id="timecode-inputs" className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200" role="group" aria-label="Saisie du timecode">
                    {timeInputsConfig.map((input, idx) => (
                        <div key={input.label} className="relative">
                            <label htmlFor={`timecode-${input.label}`} className="sr-only">
                                {input.label === 'HH' ? 'Heures' : input.label === 'MM' ? 'Minutes' : 'Secondes'}
                            </label>
                            <input 
                                id={`timecode-${input.label}`}
                                type="number" 
                                min="0"
                                max={input.label === 'HH' ? '99' : '59'}
                                value={input.value}
                                onChange={(e) => input.setter(e.target.value)}
                                aria-label={input.label === 'HH' ? 'Heures' : input.label === 'MM' ? 'Minutes' : 'Secondes'}
                                className="w-16 p-2 h-10 text-center bg-indigo-50 border border-indigo-100 rounded-md text-sm font-bold text-indigo-700 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-300 outline-none transition-all placeholder-indigo-300"
                            />
                            {idx < timeInputsConfig.length - 1 && <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold" aria-hidden="true">:</span>}
                        </div>
                    ))}
                </div>
            )}
        </fieldset>

        {/* INPUT MESSAGE & SEND */}
        <form onSubmit={handleSendMessage} className="flex gap-3 items-center" aria-label="Formulaire d'envoi de message">
            <div className="flex-1 relative">
                <label htmlFor="chat-message-input" className="sr-only">Votre message</label>
                <input
                    id="chat-message-input"
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Écrivez votre message..."
                    aria-describedby="message-help"
                    aria-required="true"
                    autoComplete="off"
                    className="w-full pl-5 pr-4 py-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900 placeholder-indigo-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200 outline-none transition-all shadow-inner font-medium"
                />
                <span id="message-help" className="sr-only">Champ obligatoire. Appuyez sur Entrée ou cliquez sur le bouton Envoyer pour publier votre message.</span>
            </div>
            
            <button 
                type="submit" 
                disabled={!inputText.trim()}
                aria-label={inputText.trim() ? "Envoyer le message" : "Entrez un message pour envoyer"}
                aria-disabled={!inputText.trim()}
                className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform
                    focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-offset-2
                    ${getSendButtonClasses(inputText)}
                `}
            >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5" aria-hidden="true">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
            </button>
        </form>
      </div>
    </div>
  );
}
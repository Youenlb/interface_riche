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
    // Conteneur principal : Fond blanc propre
    <section aria-labelledby="chat-heading" className="flex flex-col h-full bg-white">
      
      {/* Header : Épuré, fond blanc, petite ombre */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
        <h2 id="chat-heading" className="m-0 text-lg text-gray-800 font-bold flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Discussion live
        </h2>
        <div className="flex items-center gap-2 bg-gray-100 p-1 pl-3 rounded-full">
            <label htmlFor="pseudo-input" className="text-xs text-gray-500 font-bold uppercase">As:</label>
            <input 
                id="pseudo-input"
                type="text" 
                value={pseudo} 
                onChange={(e) => setPseudo(e.target.value)} 
                className="w-20 bg-white px-2 py-1 text-sm rounded-full border-none focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-indigo-700"
            />
        </div>
      </div>

      {/* Zone des messages : Fond gris très léger pour faire ressortir les bulles blanches */}
      <div 
        ref={scrollRef}
        role="log" 
        aria-live="polite"
        className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 scroll-smooth"
      >
        {messages.map((msg, index) => {
            const isMe = msg.name === pseudo;
            return (
              // Alignement Droite (Moi) / Gauche (Autres)
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                
                {/* Info Auteur + Heure au-dessus de la bulle */}
                <div className={`flex gap-2 text-[10px] mb-1 px-2 text-gray-500 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <strong className="font-bold">{msg.name}</strong> 
                    <span>{formatMessageDate(msg.when)}</span>
                </div>

                {/* LA BULLE DE MESSAGE */}
                <div className={`
                    max-w-[85%] p-3 rounded-2xl shadow-sm relative group transition-all
                    ${isMe 
                        // Style "Moi" : Couleur Indigo vibrante, texte blanc. Coin en bas à droite moins arrondi.
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        // Style "Autres" : Blanc propre, texte foncé. Coin en bas à gauche moins arrondi.
                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'}
                `}>
                    <p className="m-0 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    
                    {/* Bouton Timecode : Style intégré à la bulle */}
                    {msg.moment !== undefined && (
                        <button 
                            onClick={() => onTimestampClick(msg.moment!)}
                            className={`
                                mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-colors
                                ${isMe
                                    ? 'bg-indigo-700 text-indigo-100 hover:bg-indigo-800' // Ton sur ton pour moi
                                    : 'bg-gray-100 text-indigo-600 hover:bg-gray-200'} // Gris contrasté pour les autres
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

      {/* Zone de saisie : Flottante et propre */}
      <div className="border-t border-gray-100 bg-white p-4 relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        
        {/* Options Timecode (inchangé sur la logique, juste les couleurs) */}
        <div className="mb-3 flex items-center gap-3 flex-wrap">
            <button
                type="button"
                onClick={toggleTimeOption}
                aria-pressed={includeTime}
                className={`
                    flex items-center gap-2 text-xs font-bold transition-colors
                    ${includeTime ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}
                `}
            >
                <div className={`
                    w-5 h-5 rounded flex items-center justify-center text-[10px] transition-all
                    ${includeTime ? 'bg-indigo-600 text-white' : 'bg-gray-200'}
                `}>
                    {includeTime && '✓'}
                </div>
                Joindre un timecode
            </button>

            {includeTime && (
                // ... (Le reste des inputs timecode, adapte juste les couleurs de border-gray-300 à border-gray-200 et focus:border-indigo-500)
                // Je te laisse faire ces petits détails, c'est le même principe.
                 <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-md ring-1 ring-gray-200">
                   {/* ... inputs avec focus:ring-indigo-500 ... */}
                   {/* ... bouton 📍 text-indigo-500 ... */}
                 </div>
            )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="w-full pl-4 pr-4 py-3 rounded-full bg-gray-100 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                />
            </div>
            
            <button 
                type="submit" 
                disabled={!inputText.trim()}
                // Bouton d'envoi rond avec une icône (ex: un avion en papier CSS)
                className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all transform
                    ${inputText.trim() 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-md' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                `}
                aria-label="Envoyer"
            >
               {/* Icône "Avion" simple en SVG */}
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
            </button>
        </form>
      </div>
    </section>
  );
}
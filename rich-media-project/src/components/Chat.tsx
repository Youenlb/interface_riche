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
  // AJOUT DES HEURES ICI
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
  
  // MISE À JOUR : Format HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    // On affiche toujours HH:MM:SS pour la cohérence
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatMessageDate = (unixTimestamp: string) => {
    const date = new Date(Number(unixTimestamp) * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // MISE À JOUR : Récupération des Heures/Minutes/Secondes actuelles
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
    if (!includeTime) {
        syncWithCurrentTime();
    }
    setIncludeTime(!includeTime);
  };

  // 2. Envoi du message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    let calculatedMoment = undefined;
    if (includeTime) {
        // CALCUL INCLUANT LES HEURES
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
    <section aria-labelledby="chat-heading" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #ccc', borderRadius: '8px', background: '#fff' }}>
      
      {/* Header */}
      <div style={{ padding: '10px', background: '#f5f5f5', borderBottom: '1px solid #ccc', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2 id="chat-heading" style={{ margin: 0, fontSize: '1.1rem', color: '#2c5282' }}>Discussion</h2>
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
            <label htmlFor="pseudo-input" style={{fontSize:'0.8rem', color:'#666'}}>Pseudo:</label>
            <input 
                id="pseudo-input"
                type="text" 
                value={pseudo} 
                onChange={(e) => setPseudo(e.target.value)} 
                style={{ width: '80px', padding: '4px', fontSize:'0.8rem', borderRadius:'4px', border:'1px solid #ccc' }}
            />
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        role="log" 
        aria-live="polite"
        style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#fafafa' }}
      >
        {messages.map((msg, index) => {
            const isMe = msg.name === pseudo;
            return (
              <div key={index} style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                    maxWidth: '85%', padding: '8px 12px', borderRadius: '8px',
                    background: isMe ? '#e3f2fd' : 'white',
                    border: '1px solid #e0e0e0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'baseline', gap:'10px', marginBottom: '4px', fontSize: '0.75rem', color:'#666' }}>
                        <strong>{msg.name}</strong> 
                        <span>{formatMessageDate(msg.when)}</span>
                    </div>
                    
                    <p style={{ margin: 0, color: '#333', fontSize:'0.95rem' }}>{msg.message}</p>
                    
                    {msg.moment !== undefined && (
                        <button 
                            onClick={() => onTimestampClick(msg.moment!)}
                            style={{
                                marginTop: '6px',
                                background: '#fff', 
                                border: '1px solid #2c5282', 
                                borderRadius: '15px',
                                padding: '4px 10px', 
                                fontSize: '0.8rem', 
                                cursor: 'pointer',
                                color: '#2c5282', 
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                width: '100%'
                            }}
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
      <div style={{ borderTop: '1px solid #ccc', background: '#fff', padding: '10px' }}>
        
        {/* OPTIONS TIMECODE */}
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
                type="button"
                onClick={toggleTimeOption}
                aria-pressed={includeTime}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: includeTime ? '#2c5282' : '#666',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: includeTime ? 'bold' : 'normal'
                }}
            >
                <div style={{
                    width: '16px', height: '16px', border: '1px solid #ccc', borderRadius:'3px',
                    background: includeTime ? '#2c5282' : 'white',
                    display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'10px'
                }}>
                    {includeTime && '✓'}
                </div>
                Joindre un moment
            </button>

            {includeTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
                    
                    {/* INPUT HEURES */}
                    <input 
                        type="number" 
                        value={manualHour}
                        onChange={(e) => setManualHour(e.target.value)}
                        placeholder="HH"
                        aria-label="Heures"
                        style={{ width: '35px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '3px' }}
                    />
                    <span style={{ fontWeight:'bold', color:'#666' }}>:</span>

                    {/* INPUT MINUTES */}
                    <input 
                        type="number" 
                        value={manualMin}
                        onChange={(e) => setManualMin(e.target.value)}
                        placeholder="MM"
                        aria-label="Minutes"
                        style={{ width: '35px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '3px' }}
                    />
                    <span style={{ fontWeight:'bold', color:'#666' }}>:</span>
                    
                    {/* INPUT SECONDES */}
                    <input 
                        type="number" 
                        value={manualSec}
                        onChange={(e) => setManualSec(e.target.value)}
                        placeholder="SS"
                        aria-label="Secondes"
                        style={{ width: '35px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '3px' }}
                    />

                    <button 
                        type="button"
                        onClick={syncWithCurrentTime}
                        title="Utiliser le temps actuel de la vidéo"
                        style={{ marginLeft: '5px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1rem' }}
                    >
                        📍
                    </button>
                </div>
            )}
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Écrire un message..."
            style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }}
            />
            <button 
                type="submit" 
                disabled={!inputText.trim()}
                style={{ 
                    background: inputText.trim() ? '#2c5282' : '#ccc', 
                    color: 'white', border: 'none', borderRadius: '20px', padding: '8px 20px', fontWeight: 'bold', 
                    cursor: inputText.trim() ? 'pointer' : 'not-allowed'
                }}
            >
            Envoyer
            </button>
        </form>
      </div>
    </section>
  );
}
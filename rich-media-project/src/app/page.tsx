'use client'
import { useState } from "react";
import { LOCAL_DATA } from "./data"; 
import Player from "@/components/Player";
import AudioDescriptionManager from "@/components/AudioDescriptionManager";
import Chapters from "@/components/Chapters";
import Chat from "@/components/Chat"; // Assure-toi d'avoir créé le fichier Chat.tsx
import dynamic from 'next/dynamic';

// Import dynamique pour la carte (évite l'erreur "window not defined" du serveur)
const MapDisplay = dynamic(() => import('@/components/MapDisplay'), { ssr: false });

export default function Home() {
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTime, setSeekTime] = useState<number | undefined>(undefined);
  const [adEnabled, setAdEnabled] = useState(false);

  // Fonction appelée quand on clique sur un chapitre, un point de la carte ou un timestamp du chat
  const handleJump = (time: number) => {
    setSeekTime(time);
  };

  return (
    <>
      {/* SKIP LINK (Accessibilité Clavier) */}
      <a 
        href="#main-content" 
        className="skip-link" 
        style={{ 
          position: 'absolute', top: '-100px', left: 0, 
          background: 'black', color: 'white', padding: '10px', zIndex: 9999,
          transition: 'top 0.3s'
        }}
        onFocus={(e) => e.currentTarget.style.top = '0'}
        onBlur={(e) => e.currentTarget.style.top = '-100px'}
      >
        Aller au contenu principal
      </a>

      <div className="app-container">
        
        {/* HEADER */}
        <header role="banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1a1a1a' }}>{LOCAL_DATA.film.title}</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>Projet Rich Media - ENSSAT</p>
          </div>
          
          <button 
            onClick={() => setAdEnabled(!adEnabled)} 
            aria-pressed={adEnabled}
            style={{
              background: adEnabled ? '#2c5282' : '#e5e3df',
              color: adEnabled ? 'white' : '#1a1a1a',
              border: '2px solid transparent', 
              padding: '10px 20px', 
              borderRadius: '20px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
          >
            {adEnabled ? "Audio-Description : ON" : "Activer Audio-Description"}
          </button>
        </header>

        {/* LAYOUT PRINCIPAL (Flexbox: Aside + Main) */}
        <div className="main-layout">
          
          {/* ASIDE : Navigation (Chapitres) */}
          <aside role="complementary">
            <Chapters 
              data={LOCAL_DATA.chapters} 
              onChapterClick={handleJump} 
              currentTime={currentTime}
            />
          </aside>

          {/* MAIN : Contenu principal */}
          <main id="main-content" className="content-area" role="main">
            
            {/* 1. SECTION VIDÉO */}
            <section aria-label="Lecteur vidéo">
              <Player 
                videoUrl={LOCAL_DATA.film.file_url} 
                subtitles={LOCAL_DATA.subtitles}
                onTimeUpdate={setCurrentTime}
                seekTime={seekTime}
              />
            </section>

            {/* Service Audio-Description (Invisible) */}
            <AudioDescriptionManager 
              cues={LOCAL_DATA.audiodescription} 
              currentTime={currentTime} 
              isEnabled={adEnabled}
            />

            {/* 2. SECTION INTERACTIVE (Grille : Carte + Chat) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
              
              {/* Carte à Gauche */}
              <div style={{ height: '450px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#2c5282', margin: '0 0 10px 0' }}>Lieux de tournage</h2>
                <MapDisplay pois={LOCAL_DATA.poi} onPoiClick={handleJump} />
              </div>

              {/* Chat à Droite (WebSocket) */}
              <div style={{ height: '450px', display: 'flex', flexDirection: 'column' }}>
                {/* Le titre est géré à l'intérieur du composant Chat ou ici, au choix. 
                    Le composant Chat que je t'ai donné a déjà son titre. */}
                <Chat 
                  currentTime={currentTime}
                  onTimestampClick={handleJump}
                />
              </div>

            </div>
          </main>
        </div>

        {/* FOOTER */}
        <footer role="contentinfo" style={{ marginTop: '40px', padding: '20px', textAlign: 'center', borderTop: '1px solid #ccc', color: '#666', fontSize: '0.8rem' }}>
          <p>© 2026 Projet Rich Media - Accessible selon RGAA</p>
        </footer>
      </div>
    </>
  );
}
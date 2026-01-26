'use client'
import { useState } from "react";
import { LOCAL_DATA } from "./data"; 
import Player from "@/components/Player";
import AudioDescriptionManager from "@/components/AudioDescriptionManager";
import Chapters from "@/components/Chapters";
import dynamic from 'next/dynamic';

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), { ssr: false });

export default function Home() {
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTime, setSeekTime] = useState<number | undefined>(undefined);
  const [adEnabled, setAdEnabled] = useState(false);

  const handleJump = (time: number) => {
    setSeekTime(time);
  };

  return (
    <>
      {/* SKIP LINK : Permet aux claviers de passer le menu pour aller au contenu */}
      <a href="#main-content" style={{
        position: 'absolute', top: '-100px', left: 0, background: 'black', color: 'white', padding: '10px', zIndex: 9999, transition: 'top 0.3s'
      }} className="skip-link">
        Aller au contenu principal
      </a>

      <div className="app-container">
        {/* HEADER : Balise sémantique <header> */}
        <header role="banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            {/* H1 UNIQUE : Titre principal de la page */}
            <h1 style={{ margin: 0, color: '#1a1a1a', fontSize: '2rem' }}>{LOCAL_DATA.film.title}</h1>
            <p style={{ margin: '5px 0 0 0', color: '#555' }}>Projet Rich Media Accessible</p>
          </div>
          
          <button 
            onClick={() => setAdEnabled(!adEnabled)} 
            // ARIA-PRESSED : Indique l'état (On/Off) aux aveugles
            aria-pressed={adEnabled}
            style={{
              background: adEnabled ? '#2c5282' : '#e5e3df',
              color: adEnabled ? 'white' : '#1a1a1a',
              border: '2px solid transparent',
              padding: '12px 24px',
              borderRadius: '30px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem',
              // Contraste garanti
            }}
          >
            {adEnabled ? "Désactiver Audio-Description" : "Activer Audio-Description 🔈"}
          </button>
        </header>

        <div className="main-layout">
          {/* ASIDE : Navigation secondaire */}
          <aside role="complementary">
            <Chapters 
              data={LOCAL_DATA.chapters} 
              onChapterClick={handleJump} 
              currentTime={currentTime}
            />
          </aside>

          {/* MAIN : Contenu principal (Cible du Skip Link) */}
          <main id="main-content" className="content-area" role="main">
            
            <section aria-label="Lecteur vidéo">
              <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                <Player 
                  videoUrl={LOCAL_DATA.film.file_url} 
                  subtitles={LOCAL_DATA.subtitles}
                  onTimeUpdate={setCurrentTime}
                  seekTime={seekTime}
                />
              </div>
            </section>

            {/* Service non-visuel */}
            <AudioDescriptionManager 
              cues={LOCAL_DATA.audiodescription} 
              currentTime={currentTime} 
              isEnabled={adEnabled}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              <article style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e3df' }}>
                <h2 style={{marginTop: 0, fontSize: '1.5rem', color: '#2c5282'}}>Synopsis</h2>
                <p style={{ lineHeight: '1.6', color: '#333' }}>
                  L'action se déroule dans une ferme isolée...
                </p>
                <a 
                  href={LOCAL_DATA.film.synopsis_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display:'inline-block', marginTop:'10px', color: '#2c5282', fontWeight: 'bold', textDecoration: 'underline' }}
                  aria-label="Lire le synopsis complet sur Wikipédia (nouvelle fenêtre)"
                >
                   Lire la suite sur Wikipédia &rarr;
                </a>
              </article>

              <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #e5e3df' }}>
                <h2 style={{marginTop: 0, marginLeft: '10px', fontSize: '1.5rem', color: '#2c5282'}}>Carte interactive</h2>
                <MapDisplay pois={LOCAL_DATA.poi} onPoiClick={handleJump} />
              </div>

            </div>
          </main>
        </div>

        {/* FOOTER sémantique */}
        <footer role="contentinfo" style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #ccc', textAlign: 'center', fontSize: '0.9rem' }}>
          <p>© 2026 Projet Étudiant - Accessible selon RGAA</p>
        </footer>
      </div>
    </>
  );
}
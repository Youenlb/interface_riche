'use client'
import { useEffect, useState } from "react";
import { FilmData } from "./types";
import Player from "@/components/Player";
import AudioDescriptionManager from "@/components/AudioDescriptionManager";
import Chapters from "@/components/Chapters";
import dynamic from 'next/dynamic'; // Pour la map (Client side only)

// Import dynamique pour éviter l'erreur "window is not defined" avec Leaflet
const MapDisplay = dynamic(() => import('@/components/MapDisplay'), { ssr: false });

export default function Home() {
  const [data, setData] = useState<FilmData | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTime, setSeekTime] = useState<number | undefined>(undefined);
  const [adEnabled, setAdEnabled] = useState(false);

  useEffect(() => {
    fetch("https://tp-iai3.cleverapps.io/projet")
      .then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div>Chargement...</div>;

  const handleJump = (time: number) => {
    setSeekTime(time); // Cela déclenche l'effet dans le Player
  };

  return (
    <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', padding: '20px' }}>
      
      {/* Colonne Gauche : Média */}
      <main>
        <header style={{ marginBottom: '1rem' }}>
          <h1>{data.film.title}</h1>
          <button onClick={() => setAdEnabled(!adEnabled)} style={{ padding: '5px 10px', background: adEnabled ? '#d4edda' : '#f8d7da' }}>
            {adEnabled ? "Audio-Description : ON" : "Audio-Description : OFF"}
          </button>
        </header>

        <Player 
          videoUrl={data.film.file_url} 
          subtitles={data.subtitles}
          onTimeUpdate={setCurrentTime}
          seekTime={seekTime}
        />
        <AudioDescriptionManager 
          jsonUrl={data["audio-description"]} 
          currentTime={currentTime} 
          isEnabled={adEnabled}
        />

        {/* La Carte est sous la vidéo */}
        <MapDisplay url={data.poi} onPoiClick={handleJump} />
      </main>

      {/* Colonne Droite : Navigation & Infos */}
      <aside>
        <Chapters url={data.chapters} onChapterClick={handleJump} />
        
        <div className="synopsis" style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
          <h3>À propos</h3>
          <a href={data.film.synopsis_url} target="_blank" rel="noopener noreferrer">
            Lire le synopsis sur Wikipédia
          </a>
        </div>
      </aside>
    </div>
  );
}
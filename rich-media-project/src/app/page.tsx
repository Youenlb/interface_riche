'use client'
import { useState } from "react";
import { LOCAL_DATA } from "./data"; 
import Player from "@/components/Player"; // Ton Player ne change pas
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
    <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', padding: '20px', fontFamily: 'sans-serif' }}>
      
      <main>
        <header style={{ marginBottom: '1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{margin:0, fontSize:'1.5rem'}}>{LOCAL_DATA.film.title}</h1>
          <button 
            onClick={() => setAdEnabled(!adEnabled)} 
            style={{ 
                padding: '8px 16px', 
                borderRadius: '20px',
                border: 'none',
                background: adEnabled ? '#2ecc71' : '#95a5a6',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
            }}
          >
            {adEnabled ? "Audio-Description : ON" : "Activer Audio-Description"}
          </button>
        </header>

        <Player 
          videoUrl={LOCAL_DATA.film.file_url} 
          subtitles={LOCAL_DATA.subtitles}
          onTimeUpdate={setCurrentTime}
          seekTime={seekTime}
        />

        <AudioDescriptionManager 
          cues={LOCAL_DATA.audiodescription} 
          currentTime={currentTime} 
          isEnabled={adEnabled}
        />

        {/* La carte avec les points d'intérêts */}
        <MapDisplay pois={LOCAL_DATA.poi} onPoiClick={handleJump} />
      </main>

      <aside>
        {/* Liste des chapitres */}
        <Chapters data={LOCAL_DATA.chapters} onChapterClick={handleJump} />
        
        <div style={{ marginTop: 20, padding: 15, background: '#ecf0f1', borderRadius: 8 }}>
           <h3 style={{marginTop:0}}>Synopsis</h3>
           <p style={{fontSize: '0.9rem'}}>
               Le film culte de George Romero. Un groupe d'étrangers se retrouve piégé dans une ferme isolée alors que les morts reviennent à la vie...
           </p>
           <a href={LOCAL_DATA.film.synopsis_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3498db' }}>
              Voir sur Wikipédia
           </a>
        </div>
      </aside>
    </div>
  );
}
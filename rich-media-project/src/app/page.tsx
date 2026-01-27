'use client'
import { useState } from "react";
import { LOCAL_DATA } from "./data"; 
import Player from "@/components/Player";
import AudioDescriptionManager from "@/components/AudioDescriptionManager";
import Chapters from "@/components/Chapters";
import Chat from "@/components/Chat"; 
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
      {/* SKIP LINK ACCESSIBLE */}
      <a 
        href="#main-content" 
        className="absolute top-[-100px] left-0 bg-black text-white p-3 z-50 transition-all focus:top-0"
      >
        Aller au contenu principal
      </a>

      <div className="max-w-[1400px] mx-auto p-5">
        
        {/* HEADER */}
        <header role="banner" className="flex flex-wrap justify-between items-center mb-8 pb-5 border-b border-swedish-grey gap-4">
          <div>
            <h1 className="m-0 text-3xl font-bold text-swedish-charcoal">{LOCAL_DATA.film.title}</h1>
            <p className="mt-1 text-gray-500 text-sm italic">Projet Rich Media - ENSSAT</p>
          </div>
          
          <button 
            onClick={() => setAdEnabled(!adEnabled)} 
            aria-pressed={adEnabled}
            className={`
              px-6 py-3 rounded-full font-bold transition-colors border-2
              ${adEnabled 
                ? 'bg-swedish-blue text-white border-swedish-blue' 
                : 'bg-swedish-cream text-swedish-charcoal border-transparent hover:bg-gray-200'}
            `}
          >
            {adEnabled ? "Audio-Description : ON 🔈" : "Activer Audio-Description"}
          </button>
        </header>

        {/* LAYOUT PRINCIPAL (Flexbox: Aside + Main) */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* ASIDE : Navigation (Chapitres) */}
          <aside role="complementary" className="w-full md:w-1/4 bg-swedish-cream p-5 rounded-lg shadow-sm">
            <Chapters 
              data={LOCAL_DATA.chapters} 
              onChapterClick={handleJump} 
              currentTime={currentTime}
            />
          </aside>

          {/* MAIN : Contenu principal */}
          <main id="main-content" className="w-full md:w-3/4 flex flex-col gap-6" role="main">
            
            {/* 1. SECTION VIDÉO */}
            <section aria-label="Lecteur vidéo" className="w-full shadow-lg rounded-lg overflow-hidden">
              <Player 
                videoUrl={LOCAL_DATA.film.file_url} 
                subtitles={LOCAL_DATA.subtitles}
                onTimeUpdate={setCurrentTime}
                seekTime={seekTime}
              />
            </section>

            <AudioDescriptionManager 
              cues={LOCAL_DATA.audiodescription} 
              currentTime={currentTime} 
              isEnabled={adEnabled}
            />

            {/* 2. SECTION INTERACTIVE (Grille : Carte + Chat) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Carte à Gauche */}
              <div className="h-[500px] flex flex-col">
                <h2 className="text-xl font-bold text-swedish-blue mb-3">Lieux de tournage</h2>
                <div className="flex-1 rounded-lg overflow-hidden border border-swedish-grey shadow-sm">
                  <MapDisplay pois={LOCAL_DATA.poi} onPoiClick={handleJump} />
                </div>
              </div>

              {/* Chat à Droite */}
              <div className="h-[500px] flex flex-col">
                <Chat 
                  currentTime={currentTime}
                  onTimestampClick={handleJump}
                />
              </div>

            </div>
          </main>
        </div>

        {/* FOOTER */}
        <footer role="contentinfo" className="mt-10 pt-5 text-center border-t border-swedish-grey text-gray-500 text-sm">
          <p>© 2026 Projet Rich Media - Accessible selon RGAA</p>
        </footer>
      </div>
    </>
  );
}
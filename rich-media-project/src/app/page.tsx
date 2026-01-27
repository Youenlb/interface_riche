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
      <a 
        href="#main-content" 
        className="absolute top-[-100px] left-0 bg-black text-white p-3 z-50 transition-all focus:top-0"
      >
        Aller au contenu principal
      </a>

      {/* CONTAINER GLOBAL 
          - Mobile : h-auto (scroll normal)
          - Desktop (lg) : h-screen (tient dans l'écran) + overflow-hidden (pas de scroll page)
      */}
      <div className="w-full lg:h-screen lg:overflow-hidden flex flex-col bg-swedish-white">
        
        {/* --- ZONE HAUTE (Titre + Chapitres) --- 
            flex-shrink-0 empêche cette zone d'être écrasée
        */}
        <div className="flex-shrink-0 p-4 pb-2 border-b border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-xl md:text-2xl font-bold text-swedish-blue m-0">{LOCAL_DATA.film.title}</h1>
              <button 
                  onClick={() => setAdEnabled(!adEnabled)} 
                  className={`text-xs px-3 py-1 rounded-full font-bold border transition-colors ${adEnabled ? 'bg-swedish-sage text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {adEnabled ? "AD : ON" : "Activer AD"}
              </button>
            </div>
            
            <Chapters 
                data={LOCAL_DATA.chapters} 
                onChapterClick={handleJump} 
                currentTime={currentTime}
            />
        </div>

        {/* --- ZONE PRINCIPALE (Grid) ---
            flex-1 : Prend toute la hauteur restante
            min-h-0 : Indispensable pour que le scroll interne fonctionne dans les enfants flex
        */}
        <main id="main-content" className="flex-1 min-h-0 p-4 pt-2 grid grid-cols-1 lg:grid-cols-4 gap-4">
            
            {/* COLONNE GAUCHE (Vidéo + Map) - 75% largeur */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
                
                {/* 1. VIDÉO (Moitié de la hauteur dispo) */}
                <section aria-label="Lecteur vidéo" className="lg:h-1/2 w-full bg-black rounded-xl overflow-hidden shadow-lg flex-shrink-0 min-h-[250px]">
                   <div className="h-full w-full flex items-center justify-center">
                      <Player 
                        videoUrl={LOCAL_DATA.film.file_url} 
                        subtitles={LOCAL_DATA.subtitles}
                        onTimeUpdate={setCurrentTime}
                        seekTime={seekTime}
                      />
                   </div>
                </section>

                {/* 2. MAP (L'autre moitié) */}
                <section aria-label="Carte interactive" className="lg:h-1/2 w-full rounded-xl overflow-hidden border border-swedish-grey shadow-md relative z-0 flex-shrink-0 min-h-[250px]">
                    <div className="h-full w-full">
                       <MapDisplay pois={LOCAL_DATA.poi} onPoiClick={handleJump} />
                    </div>
                </section>

            </div>

            {/* COLONNE DROITE (Chat) - 25% largeur */}
            <div className="lg:col-span-1 h-full min-h-0">
                {/* Desktop : h-full pour prendre toute la hauteur de la colonne
                   Mobile : h-[500px] fixe pour être utilisable en fin de page
                */}
                <section className="h-[500px] lg:h-full flex flex-col">
                   <Chat 
                      currentTime={currentTime}
                      onTimestampClick={handleJump}
                   />
                </section>
            </div>

        </main>

        {/* Audio Manager (Invisible) */}
        <AudioDescriptionManager 
           cues={LOCAL_DATA.audiodescription} 
           currentTime={currentTime} 
           isEnabled={adEnabled}
        />
      </div>
    </>
  );
}
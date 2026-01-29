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
        className="absolute top-[-100px] left-0 bg-indigo-700 text-white p-3 z-50 transition-all focus:top-0 font-bold rounded-br-lg shadow-lg"
      >
        Aller au contenu principal
      </a>

      <div className="w-full lg:h-screen lg:overflow-hidden flex flex-col bg-gray-50 text-gray-900 font-sans">
        <div className="flex-shrink-0 p-4 pb-2 bg-white shadow-sm z-10 relative">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 m-0">
                  {LOCAL_DATA.film.title}
                </h1>
              </div>
              
              <button 
                  onClick={() => setAdEnabled(!adEnabled)} 
                  className={`
                    text-sm px-4 py-2 rounded-full font-semibold transition-all shadow-sm
                    ${adEnabled 
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200' 
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-100'}
                  `}
              >
                {adEnabled ? "AD : Activée 🔈" : "Activer AD"}
              </button>
            </div>
            
            <Chapters 
                data={LOCAL_DATA.chapters} 
                onChapterClick={handleJump} 
                currentTime={currentTime}
            />
        </div>
        <main id="main-content" className="flex-1 min-h-0 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 bg-gray-50">
            <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
                <section aria-label="Lecteur vidéo" className="lg:h-1/2 w-full bg-black rounded-2xl overflow-hidden shadow-xl flex-shrink-0 min-h-[250px] ring-1 ring-black/10">
                   <div className="h-full w-full flex items-center justify-center">
                      <Player 
                        videoUrl={LOCAL_DATA.film.file_url} 
                        subtitles={LOCAL_DATA.subtitles}
                        onTimeUpdate={setCurrentTime}
                        seekTime={seekTime}
                      />
                   </div>
                </section>
                <section aria-label="Carte interactive" className="lg:h-1/2 w-full bg-white rounded-2xl overflow-hidden shadow-xl relative z-0 flex-shrink-0 min-h-[250px] ring-1 ring-black/5">
                    <div className="h-full w-full">
                       <MapDisplay pois={LOCAL_DATA.poi} onPoiClick={handleJump} />
                    </div>
                </section>

            </div>
            <div className="lg:col-span-1 h-full min-h-0">
                <section className="h-[500px] lg:h-full flex flex-col rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 bg-white">
                   <Chat 
                      currentTime={currentTime}
                      onTimestampClick={handleJump}
                   />
                </section>
            </div>

        </main>

        <AudioDescriptionManager 
           cues={LOCAL_DATA.audiodescription} 
           currentTime={currentTime} 
           isEnabled={adEnabled}
        />
      </div>
    </>
  );
}
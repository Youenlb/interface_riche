'use client'
import { useState, useEffect, useRef } from "react";
import { fetchFilmData } from "./data"; 
import { FilmData } from "./types";
import Player from "@/components/Player";
import AudioDescriptionManager from "@/components/AudioDescriptionManager";
import Chapters from "@/components/Chapters";
import Chat from "@/components/Chat"; 
import dynamic from 'next/dynamic';

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), { ssr: false });

export default function Home() {
  const [filmData, setFilmData] = useState<FilmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTime, setSeekTime] = useState<number | undefined>(undefined);
  const [adEnabled, setAdEnabled] = useState(false);
  
  // Use ref to prevent multiple fetch calls
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent double fetch in strict mode
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchFilmData();
        setFilmData(data);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement de la vidéo. Veuillez réessayer.");
        setFilmData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleJump = (time: number) => {
    setSeekTime(time);
    // Reset seekTime after a short delay to allow the component to process it
    setTimeout(() => {
      setSeekTime(undefined);
    }, 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Chargement de la vidéo...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !filmData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error || "Erreur lors du chargement"}</p>
          <button 
            onClick={() => globalThis.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Liens d'évitement - Accessibilité RGAA (critère 12.7) */}
      <nav aria-label="Accès rapide" className="absolute">
        <a 
          href="#main-content" 
          className="absolute -top-96 focus:top-2 left-2 bg-indigo-700 text-white px-4 py-3 z-[9999] font-bold rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-200"
        >
          Aller au contenu principal
        </a>
        <a 
          href="#chat-section" 
          className="absolute -top-96 focus:top-2 left-64 bg-indigo-700 text-white px-4 py-3 z-[9999] font-bold rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-200"
        >
          Aller au chat
        </a>
      </nav>

      <div className="w-full lg:h-screen lg:overflow-hidden flex flex-col bg-gray-50 text-gray-900 font-sans">
        <header role="banner" className="flex-shrink-0 p-4 pb-2 bg-white shadow-sm z-10 relative">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 m-0">
                  {filmData.film.title}
                </h1>
                <p className="sr-only">Lecteur vidéo accessible avec chapitres, carte interactive et chat en direct</p>
              </div>
              
              <button 
                  onClick={() => setAdEnabled(!adEnabled)}}
                  aria-pressed={adEnabled}
                  aria-label={adEnabled ? "Désactiver l'audiodescription" : "Activer l'audiodescription"}
                  className={`
                    text-sm px-4 py-2 rounded-full font-semibold transition-all shadow-sm
                    focus:outline-none focus:ring-4 focus:ring-indigo-300
                    ${adEnabled 
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200' 
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-100'}
                  `}
              >
                <span aria-hidden="true">{adEnabled ? "AD : Activée 🔈" : "Activer AD"}</span>
                <span className="sr-only">{adEnabled ? "Audiodescription activée" : "Audiodescription désactivée"}</span>
              </button>
            </div>
            
            <Chapters 
                data={filmData.chapters} 
                onChapterClick={handleJump} 
                currentTime={currentTime}
            />
        </header>
        <main id="main-content" className="flex-1 min-h-0 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 bg-gray-50">
            <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
                <section 
                  aria-labelledby="video-section-title" 
                  role="region"
                  className="lg:h-1/2 w-full bg-black rounded-2xl overflow-hidden shadow-xl flex-shrink-0 min-h-[250px] ring-1 ring-black/10"
                >
                   <h2 id="video-section-title" className="sr-only">Lecteur vidéo principal</h2>
                   <div className="h-full w-full flex items-center justify-center">
                      <Player 
                        videoUrl={filmData.film.file_url} 
                        subtitles={filmData.subtitles}
                        onTimeUpdate={setCurrentTime}
                        seekTime={seekTime}
                        filmTitle={filmData.film.title}
                      />
                   </div>
                </section>
                <section 
                  aria-labelledby="map-section-title"
                  role="region" 
                  className="lg:h-1/2 w-full bg-white rounded-2xl overflow-hidden shadow-xl relative z-0 flex-shrink-0 min-h-[250px] ring-1 ring-black/5"
                >
                    <h2 id="map-section-title" className="sr-only">Carte interactive des lieux du film</h2>
                    <div className="h-full w-full">
                       <MapDisplay pois={filmData.poi} onPoiClick={handleJump} />
                    </div>
                </section>

            </div>
            <div className="lg:col-span-1 h-full min-h-0">
                <section 
                  id="chat-section"
                  aria-labelledby="chat-section-title"
                  role="region"
                  className="h-[500px] lg:h-full flex flex-col rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 bg-white"
                >
                   <h2 id="chat-section-title" className="sr-only">Discussion en direct</h2>
                   <Chat 
                      currentTime={currentTime}
                      onTimestampClick={handleJump}
                   />
                </section>
            </div>

        </main>

        <AudioDescriptionManager 
           cues={filmData.audiodescription} 
           currentTime={currentTime} 
           isEnabled={adEnabled}
        />
      </div>
    </>
  );
}
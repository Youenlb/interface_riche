'use client'
import { useRef, useEffect } from "react";
import { Subtitles } from "@/app/types";

interface PlayerProps {
  readonly videoUrl: string;
  readonly subtitles: Subtitles;
  readonly seekTime?: number; 
  readonly onTimeUpdate: (t: number) => void;
  readonly filmTitle?: string;
}

export default function Player({ videoUrl, subtitles, seekTime, onTimeUpdate, filmTitle = "Vidéo" }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (seekTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  }, [seekTime]);

  // Detect video type from URL
  const getVideoType = (url: string | undefined): string => {
    if (!url) return 'video/mp4';
    if (url.includes('.mp4')) return 'video/mp4';
    if (url.includes('.webm')) return 'video/webm';
    if (url.includes('.mov')) return 'video/quicktime';
    if (url.includes('.mkv')) return 'video/x-matroska';
    // Default to mp4 or let browser handle it
    return 'video/mp4';
  };

  if (!videoUrl) {
    return (
      <div className="w-full h-full bg-black rounded-lg overflow-hidden shadow-md flex items-center justify-center">
        <p className="text-white">Chargement de la vidéo...</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-md"
      role="group"
      aria-label={`Lecteur vidéo: ${filmTitle}`}
    >
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full object-contain focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2"
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
        title={`Lecteur vidéo: ${filmTitle}`}
        aria-label={`${filmTitle} - Utilisez les contrôles pour lire, mettre en pause et naviguer dans la vidéo. Sous-titres disponibles en français, anglais et espagnol.`}
      >
        <source src={videoUrl} type={getVideoType(videoUrl)} />
        <track 
            kind="captions" 
            src={subtitles.fr} 
            srcLang="fr" 
            label="Sous-titres français" 
            default 
        />
        <track 
            kind="subtitles" 
            src={subtitles.en} 
            srcLang="en" 
            label="English subtitles" 
        />
        <track 
            kind="subtitles" 
            src={subtitles.es} 
            srcLang="es" 
            label="Subtítulos en español" 
        />
        <p>Votre navigateur ne supporte pas la lecture vidéo HTML5. 
           <a href={videoUrl} className="text-indigo-400 underline">Télécharger la vidéo</a>
        </p>
      </video>
    </div>
  );
}
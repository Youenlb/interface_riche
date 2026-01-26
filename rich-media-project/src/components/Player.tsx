'use client'
import { useRef, useEffect } from "react";
import { Subtitles } from "@/app/types";

interface PlayerProps {
  videoUrl: string;
  subtitles: Subtitles;
  seekTime?: number; 
  onTimeUpdate: (t: number) => void;
}

export default function Player({ videoUrl, subtitles, seekTime, onTimeUpdate }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Gestion du saut dans le temps (Chapitres / Map)
  useEffect(() => {
    if (seekTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTime;
      // videoRef.current.play(); // Décommenter si tu veux que la lecture parte direct
    }
  }, [seekTime]);

  return (
    <div style={{ position: 'relative', width: '100%', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        // Indispensable si la vidéo vient d'un autre domaine (Wikimedia) pour autoriser les sous-titres
        crossOrigin="anonymous" 
        style={{ width: '100%', display: 'block' }}
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
      >
        <source src={videoUrl} type="video/webm" />
        
        {/* --- PISTES DE SOUS-TITRES --- */}
        
        {/* Français (Par défaut) */}
        <track 
            kind="subtitles" 
            src={subtitles.fr} 
            srcLang="fr" 
            label="Français" 
            default 
        />

        {/* Anglais */}
        <track 
            kind="subtitles" 
            src={subtitles.en} 
            srcLang="en" 
            label="English" 
        />

        {/* Espagnol */}
        <track 
            kind="subtitles" 
            src={subtitles.es} 
            srcLang="es" 
            label="Español" 
        />

        <p>Votre navigateur ne supporte pas la lecture vidéo HTML5.</p>
      </video>
    </div>
  );
}
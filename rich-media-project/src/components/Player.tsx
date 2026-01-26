'use client'
import { useRef, useEffect } from "react";

interface PlayerProps {
  videoUrl: string;
  subtitles: { en: string; fr: string; es: string };
  seekTime?: number; // Pour piloter la vidéo depuis l'extérieur
  onTimeUpdate: (t: number) => void;
}

export default function Player({ videoUrl, subtitles, seekTime, onTimeUpdate }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Synchronisation temporelle (quand on clique sur un chapitre)
  useEffect(() => {
    if (seekTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTime;
      videoRef.current.play();
    }
  }, [seekTime]);

  return (
    <div className="player-wrapper" style={{ position: 'relative', width: '100%' }}>
      <video
        ref={videoRef}
        controls
        crossOrigin="anonymous"
        style={{ width: '100%', borderRadius: '8px' }}
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
      >
        <source src={videoUrl} type="video/webm" />
        
        {/* Note: Les navigateurs préfèrent le format VTT. 
            Si le SRT ne s'affiche pas, c'est une limitation navigateur, 
            mais le code est sémantiquement correct. */}
        <track label="Français" kind="subtitles" srcLang="fr" src={subtitles.fr} default />
        <track label="English" kind="subtitles" srcLang="en" src={subtitles.en} />
        <track label="Español" kind="subtitles" srcLang="es" src={subtitles.es} />
      </video>
    </div>
  );
}
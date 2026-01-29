'use client'
import { useRef, useEffect } from "react";
import { Subtitles } from "@/app/types";

interface PlayerProps {
  readonly videoUrl: string;
  readonly subtitles: Subtitles;
  readonly seekTime?: number; 
  readonly onTimeUpdate: (t: number) => void;
}

export default function Player({ videoUrl, subtitles, seekTime, onTimeUpdate }: PlayerProps) {
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
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-md">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full object-contain"
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
      >
        <source src={videoUrl} type={getVideoType(videoUrl)} />
        <track 
            kind="captions" 
            src={subtitles.fr} 
            srcLang="fr" 
            label="Français" 
            default 
        />
        <track kind="subtitles" src={subtitles.en} srcLang="en" label="English" />
        <track kind="subtitles" src={subtitles.es} srcLang="es" label="Español" />
        <p>Votre navigateur ne supporte pas la lecture vidéo HTML5.</p>
      </video>
    </div>
  );
}
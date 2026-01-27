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

  useEffect(() => {
    if (seekTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  }, [seekTime]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-md">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        crossOrigin="anonymous" 
        className="w-full h-full object-contain"
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
      >
        <source src={videoUrl} type="video/webm" />
        <track kind="subtitles" src={subtitles.fr} srcLang="fr" label="Français" default />
        <track kind="subtitles" src={subtitles.en} srcLang="en" label="English" />
        <track kind="subtitles" src={subtitles.es} srcLang="es" label="Español" />
        <p>Votre navigateur ne supporte pas la lecture vidéo HTML5.</p>
      </video>
    </div>
  );
}
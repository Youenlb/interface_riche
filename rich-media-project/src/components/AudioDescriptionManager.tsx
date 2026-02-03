'use client'
import { useEffect, useRef, useState } from "react";
import { AudioDescEntry } from "@/app/types";
import { parseTime } from "@/app/utils";

interface Props {
  readonly cues: AudioDescEntry[];
  readonly currentTime: number;
  readonly isEnabled: boolean;
}

export default function AudioDescriptionManager({ cues, currentTime, isEnabled }: Props) {
  const lastReadIndex = useRef(-1);
  const [currentDescription, setCurrentDescription] = useState<string | null>(null);

  useEffect(() => {
    const synth = globalThis.speechSynthesis;

    if (!isEnabled || !synth) {
      synth?.cancel();
      setCurrentDescription(null);
      return;
    }

    // On cherche si on est proche d'un timestamp (à 0.5 seconde près pour être précis)
    const cueIndex = cues.findIndex(c => {
        const cueTime = parseTime(c.timestamp);
        return Math.abs(cueTime - currentTime) < 0.5;
    });

    // On compare avec lastReadIndex.current
    if (cueIndex !== -1 && cueIndex !== lastReadIndex.current) {
      const textToRead = cues[cueIndex].description_fr || cues[cueIndex].description;
      
      // Mise à jour pour l'affichage visuel
      setCurrentDescription(textToRead);
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "fr-FR";
      utterance.rate = 1.0;
      
      // Effacer la description après la lecture
      utterance.onend = () => {
        setCurrentDescription(null);
      };
      
      // Lecture
      synth.speak(utterance);
      
      // Mise à jour de la référence
      lastReadIndex.current = cueIndex;
    }
  }, [currentTime, isEnabled, cues]); 

  // Rendu d'un élément accessible pour annoncer les descriptions
  return (
    <>
      {/* Zone d'annonce pour lecteurs d'écran */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {isEnabled && currentDescription && (
          <span>Audiodescription: {currentDescription}</span>
        )}
      </div>
      
      {/* Affichage visuel optionnel de l'audiodescription */}
      {isEnabled && currentDescription && (
        <div 
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/90 text-white px-6 py-3 rounded-lg shadow-2xl max-w-2xl text-center z-50 animate-in fade-in duration-300"
          role="alert"
          aria-live="assertive"
        >
          <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider block mb-1">🔊 Audiodescription</span>
          <p className="m-0 text-sm leading-relaxed">{currentDescription}</p>
        </div>
      )}
    </>
  );
}
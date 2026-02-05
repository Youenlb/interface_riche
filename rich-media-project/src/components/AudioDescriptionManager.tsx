'use client'
import { useEffect, useRef, useCallback } from "react";
import { AudioDescEntry } from "@/app/types";
import { parseTime } from "@/app/utils";

interface Props {
  readonly cues: AudioDescEntry[];
  readonly currentTime: number;
  readonly isEnabled: boolean;
}

export default function AudioDescriptionManager({ cues, currentTime, isEnabled }: Props) {
  const lastReadIndex = useRef(-1);
  const descriptionElementRef = useRef<HTMLParagraphElement>(null);

  const updateDescription = useCallback((text: string | null) => {
    if (descriptionElementRef.current) {
      descriptionElementRef.current.textContent = text ? `Audiodescription : ${text}` : "";
    }
  }, []);

  useEffect(() => {
    const synth = globalThis.speechSynthesis;

    if (!isEnabled || !synth) {
      synth?.cancel();
      updateDescription(null);
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
      
      // Mise à jour de l'élément DOM directement (pas de setState)
      updateDescription(textToRead);
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "fr-FR";
      utterance.rate = 1.0;
      
      // Effacer la description après la lecture
      utterance.onend = () => {
        updateDescription(null);
      };
      
      // Lecture
      synth.speak(utterance);
      
      // Mise à jour de la référence
      lastReadIndex.current = cueIndex;
    }
  }, [currentTime, isEnabled, cues, updateDescription]); 

  return (
    <>
      {/* Zone d'annonce pour lecteurs d'écran - role=status car non intrusif */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        aria-label="Zone d'audiodescription"
        className="sr-only"
      >
        <p ref={descriptionElementRef}></p>
        {!isEnabled && (
          <span>Audiodescription désactivée</span>
        )}
      </div>
    </>
  );
}
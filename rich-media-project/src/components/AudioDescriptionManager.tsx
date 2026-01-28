'use client'
import { useEffect, useRef } from "react";
import { AudioDescEntry } from "@/app/types";
import { parseTime } from "@/app/utils";

interface Props {
  cues: AudioDescEntry[];
  currentTime: number;
  isEnabled: boolean;
}

export default function AudioDescriptionManager({ cues, currentTime, isEnabled }: Props) {

  const lastReadIndex = useRef(-1);

  useEffect(() => {
    // Le '?' (optional chaining) évite que ça plante si l'API n'est pas dispo
    const synth = globalThis.speechSynthesis;

    if (!isEnabled || !synth) {
      synth?.cancel();
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
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "fr-FR";
      utterance.rate = 1.1; 
      
      // Lecture
      synth.speak(utterance);
      
      // Mise à jour de la référence (ne déclenche PAS de nouveau rendu)
      lastReadIndex.current = cueIndex;
    }
  }, [currentTime, isEnabled, cues]); 
  return null;
}
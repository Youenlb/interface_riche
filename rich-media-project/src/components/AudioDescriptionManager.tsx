'use client'
import { useEffect, useState } from "react";
import { AudioDescEntry } from "@/app/types";
import { parseTime } from "@/app/utils";

export default function AudioDescriptionManager({ cues, currentTime, isEnabled }: { cues: AudioDescEntry[], currentTime: number, isEnabled: boolean }) {
  const [lastReadIndex, setLastReadIndex] = useState(-1);

  useEffect(() => {
    if (!isEnabled) {
      window.speechSynthesis.cancel();
      return;
    }

    // On cherche si on est proche d'un timestamp (à 1 seconde près)
    const cueIndex = cues.findIndex(c => {
        const cueTime = parseTime(c.timestamp);
        return Math.abs(cueTime - currentTime) < 0.8;
    });

    if (cueIndex !== -1 && cueIndex !== lastReadIndex) {
      // On lit la version FR si dispo, sinon la version EN par défaut
      const textToRead = cues[cueIndex].description_fr || cues[cueIndex].description;
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "fr-FR";
      utterance.rate = 1.1; 
      
      console.log(`Lecture Audio-Desc (${cues[cueIndex].timestamp}):`, textToRead);
      window.speechSynthesis.speak(utterance);
      
      setLastReadIndex(cueIndex);
    }
  }, [currentTime, isEnabled, cues, lastReadIndex]);

  return null;
}
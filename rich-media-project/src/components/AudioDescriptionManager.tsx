'use client'
import { useEffect, useState } from "react";
import { AudioDescCue } from "@/app/types";

interface ADProps {
  jsonUrl: string;
  currentTime: number;
  isEnabled: boolean;
}

export default function AudioDescriptionManager({ jsonUrl, currentTime, isEnabled }: ADProps) {
  const [cues, setCues] = useState<AudioDescCue[]>([]);
  const [lastReadIndex, setLastReadIndex] = useState(-1);

  // 1. Charger le script de l'audio-description
  useEffect(() => {
    fetch(jsonUrl).then(r => r.json()).then(setCues);
  }, [jsonUrl]);

  // 2. Surveiller le temps et lire si nécessaire
  useEffect(() => {
    if (!isEnabled) {
      window.speechSynthesis.cancel();
      return;
    }

    // On cherche s'il y a un texte à lire à ce moment précis (à +/- 0.5 sec)
    const cueIndex = cues.findIndex(c => Math.abs(c.time - currentTime) < 0.5);

    if (cueIndex !== -1 && cueIndex !== lastReadIndex) {
      const utterance = new SpeechSynthesisUtterance(cues[cueIndex].text);
      utterance.lang = "fr-FR";
      utterance.rate = 1.2; // Un peu plus rapide que la normale pour caler à l'action
      window.speechSynthesis.speak(utterance);
      setLastReadIndex(cueIndex);
    }
  }, [currentTime, isEnabled, cues, lastReadIndex]);

  return null; // Ce composant est "invisible", c'est un service logique
}
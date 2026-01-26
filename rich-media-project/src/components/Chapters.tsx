'use client'
import { useEffect, useState } from "react";
import { Chapter } from "@/app/types";

export default function Chapters({ url, onChapterClick }: { url: string, onChapterClick: (t: number) => void }) {
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    fetch(url).then(r => r.json()).then(setChapters);
  }, [url]);

  return (
    <nav aria-label="Chapitres du film" className="chapters-nav">
      <h3>Chapitres</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {chapters.map((chap, i) => (
          <li key={i} style={{ marginBottom: '5px' }}>
            <button 
              onClick={() => onChapterClick(chap.time)}
              style={{ width: '100%', textAlign: 'left', padding: '10px' }}
              aria-label={`Aller au chapitre ${chap.title}`}
            >
              {chap.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
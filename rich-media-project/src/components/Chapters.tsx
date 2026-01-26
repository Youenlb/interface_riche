'use client'
import { ChapterEntry } from "@/app/types";
import { parseTime } from "@/app/utils"; // On importe la fonction

export default function Chapters({ data, onChapterClick }: { data: ChapterEntry[], onChapterClick: (t: number) => void }) {
  return (
    <nav aria-label="Chapitres du film" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Chapitres</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {data.map((chap, i) => {
          const seconds = parseTime(chap.timestamp); // Conversion ici
          return (
            <li key={i} style={{ marginBottom: '8px' }}>
              <button 
                onClick={() => onChapterClick(seconds)}
                className="chapter-btn"
                aria-label={`Aller au chapitre ${chap.title_fr} à ${chap.timestamp}`}
                style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '10px', 
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
              >
                <span style={{ fontWeight: 'bold', color: '#005fcc' }}>{chap.timestamp}</span>
                <br/>
                {chap.title_fr}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
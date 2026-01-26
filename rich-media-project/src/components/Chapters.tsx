'use client'
import { ChapterEntry } from "@/app/types";
import { parseTime } from "@/app/utils";

interface ChaptersProps {
  data: ChapterEntry[];
  onChapterClick: (t: number) => void;
  currentTime?: number;
}

export default function Chapters({ data, onChapterClick, currentTime = 0 }: ChaptersProps) {
  return (
    // <nav> pour repère sémantique
    <nav aria-labelledby="chapters-heading">
      <h2 id="chapters-heading" className="section-title" style={{fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '2px solid #8c5e3c'}}>
        Chapitres
      </h2>
      
      {/* <ul> pour structurer la liste pour les lecteurs d'écran */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {data.map((chap, i) => {
          const seconds = parseTime(chap.timestamp);
          const nextChapSeconds = i < data.length - 1 ? parseTime(data[i+1].timestamp) : Infinity;
          
          // Calcul de l'état "courant"
          const isActive = currentTime >= seconds && currentTime < nextChapSeconds;

          return (
            <li key={i} style={{ marginBottom: '8px' }}>
              <button 
                // CLASSE : Utilisation de la classe CSS définie plus haut
                className={`list-item ${isActive ? 'active' : ''}`}
                
                // ACTION : Accessible clavier (Entrée/Espace) nativement grâce à <button>
                onClick={() => onChapterClick(seconds)}
                
                // ETAT : Indique au lecteur d'écran quel élément est sélectionné
                aria-current={isActive ? "step" : undefined}
                
                // INFO : Label explicite si le texte visuel ne suffit pas
                aria-label={`Lire le chapitre : ${chap.title_fr} à ${chap.timestamp}`}
              >
                <span style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px' }}>
                  ⏱ {chap.timestamp}
                </span>
                <span style={{ fontWeight: 600 }}>
                  {chap.title_fr}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
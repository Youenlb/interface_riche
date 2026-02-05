'use client'
import { ChapterEntry } from "@/app/types";
import { parseTime } from "@/app/utils";

interface ChaptersProps {
  readonly data: ChapterEntry[];
  readonly onChapterClick: (t: number) => void;
  readonly currentTime?: number;
}

export default function Chapters({ data, onChapterClick, currentTime = 0 }: ChaptersProps) {
  // Trouver le chapitre actif pour l'annoncer
  const activeChapterIndex = data.findIndex((chap, i) => {
    const seconds = parseTime(chap.timestamp);
    const nextChapSeconds = i < data.length - 1 ? parseTime(data[i+1].timestamp) : Infinity;
    return currentTime >= seconds && currentTime < nextChapSeconds;
  });

  return (
    <nav aria-label="Navigation par chapitres du film" className="w-full" role="navigation">
      <h2 className="sr-only">Chapitres du film - {data.length} chapitres disponibles. {activeChapterIndex >= 0 ? `Chapitre actuel : ${data[activeChapterIndex].title_fr}` : ''}</h2>
      <ul className="flex flex-wrap gap-2 items-center list-none p-0 m-0" role="list" aria-label="Liste des chapitres">
        <li>
          <span className="text-sm font-bold text-gray-500 mr-2 uppercase tracking-wider" aria-hidden="true">Chapitres</span>
        </li>
        
        {data.map((chap, i) => {
          const seconds = parseTime(chap.timestamp);
          const nextChapSeconds = i < data.length - 1 ? parseTime(data[i+1].timestamp) : Infinity;
          const isActive = currentTime >= seconds && currentTime < nextChapSeconds;

          return (
            <li key={chap.chapter}>
              <button
                onClick={() => onChapterClick(seconds)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Chapitre ${i + 1}: ${chap.title_fr}, commence à ${chap.timestamp}`}
                title={`Aller au chapitre: ${chap.title_fr}`}
                className={`
                  flex items-center gap-2 
                  px-4 py-2 rounded-full text-xs md:text-sm transition-all duration-300 ease-in-out
                  font-medium ring-1 ring-inset
                  focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-offset-1
                  ${isActive 
                    ? 'bg-indigo-600 text-white ring-indigo-600 shadow-md scale-105' 
                    : 'bg-gray-100 text-gray-700 ring-transparent hover:bg-gray-200 hover:text-gray-900'}
                `}
              >
                <span className={`font-mono text-xs opacity-80 ${isActive ? 'text-indigo-200' : 'text-gray-500'}`} aria-hidden="true">
                  {chap.timestamp}
                </span>
                <span>
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
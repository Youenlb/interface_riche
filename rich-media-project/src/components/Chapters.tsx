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
    <nav aria-label="Chapitres du film" className="w-full">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-bold text-gray-400 mr-2 uppercase tracking-wider">Chapitres</span>
        {data.map((chap, i) => {
          const seconds = parseTime(chap.timestamp);
          const nextChapSeconds = i < data.length - 1 ? parseTime(data[i+1].timestamp) : Infinity;
          const isActive = currentTime >= seconds && currentTime < nextChapSeconds;

          return (
            <button 
              key={i}
              onClick={() => onChapterClick(seconds)}
              aria-current={isActive ? "step" : undefined}
              // CHANGEMENT DE LOOK : Pillules arrondies, couleur Indigo vive quand actif
              className={`
                flex items-center gap-2 
                px-4 py-2 rounded-full text-xs md:text-sm transition-all duration-300 ease-in-out
                font-medium ring-1 ring-inset
                ${isActive 
                  ? 'bg-indigo-600 text-white ring-indigo-600 shadow-md scale-105' 
                  : 'bg-gray-100 text-gray-700 ring-transparent hover:bg-gray-200 hover:text-gray-900'}
              `}
            >
              <span className={`font-mono text-[10px] opacity-80 ${isActive ? 'text-indigo-200' : 'text-gray-500'}`}>
                {chap.timestamp}
              </span>
              <span>
                {chap.title_fr}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
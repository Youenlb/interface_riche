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
    <nav aria-labelledby="chapters-heading">
      <h2 
        id="chapters-heading" 
        className="text-xl mb-4 border-b-2 border-swedish-wood pb-2 text-swedish-blue font-bold"
      >
        Chapitres
      </h2>
      
      <ul className="list-none p-0 m-0">
        {data.map((chap, i) => {
          const seconds = parseTime(chap.timestamp);
          const nextChapSeconds = i < data.length - 1 ? parseTime(data[i+1].timestamp) : Infinity;
          const isActive = currentTime >= seconds && currentTime < nextChapSeconds;

          return (
            <li key={i} className="mb-2">
              <button 
                onClick={() => onChapterClick(seconds)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Lire le chapitre : ${chap.title_fr} à ${chap.timestamp}`}
                className={`
                  w-full text-left p-4 rounded transition-all border
                  ${isActive 
                    ? 'bg-swedish-blue text-white border-swedish-blue font-bold shadow-md transform scale-[1.02]' 
                    : 'bg-white text-swedish-charcoal border-gray-200 hover:bg-white hover:border-swedish-sage hover:shadow-sm'}
                `}
              >
                <span className="block text-sm opacity-80 mb-1">
                  ⏱ {chap.timestamp}
                </span>
                <span className="block text-base">
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
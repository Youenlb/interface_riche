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
    <nav aria-label="Chapitres du film" className="w-full mb-4">
      <h2 className="sr-only">Navigation par chapitres</h2>
      
      {/* DESIGN : 
         - Mobile : Scroll horizontal pour ne pas prendre trop de place verticale
         - Desktop (md+) : Flex wrap (retour à la ligne automatique) comme demandé
      */}
      <div className="flex overflow-x-auto md:flex-wrap gap-2 pb-2 md:pb-0 scrollbar-hide">
        {data.map((chap, i) => {
          const seconds = parseTime(chap.timestamp);
          const nextChapSeconds = i < data.length - 1 ? parseTime(data[i+1].timestamp) : Infinity;
          const isActive = currentTime >= seconds && currentTime < nextChapSeconds;

          return (
            <button 
              key={i}
              onClick={() => onChapterClick(seconds)}
              aria-current={isActive ? "step" : undefined}
              className={`
                flex-shrink-0 md:flex-shrink 
                flex items-center gap-2 
                px-4 py-3 rounded-lg border transition-all duration-200 text-sm
                ${isActive 
                  ? 'bg-swedish-blue text-white border-swedish-blue shadow-md font-bold' 
                  : 'bg-white text-swedish-charcoal border-swedish-grey hover:border-swedish-sage hover:bg-gray-50'}
              `}
            >
              <span className={`text-xs font-mono ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
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
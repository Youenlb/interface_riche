export interface FilmData {
  film: {
    title: string;
    file_url: string;
    synopsis_url: string;
    poster_url?: string;
  };
  chapters: string; // URL vers le JSON des chapitres
  "audio-description": string; // URL vers le JSON
  poi: string; // URL vers les points d'intérêts
  subtitles: {
    en: string;
    fr: string;
    es: string;
  };
}

export interface Chapter {
  pos: number;
  title: string;
  time: number; // converti en secondes
}

export interface POI {
  label: string;
  pos: string;
  time: number;
}
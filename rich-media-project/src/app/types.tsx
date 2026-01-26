export interface FilmData {
  film: {
    file_url: string;
    title: string;
    synopsis_url: string;
  };
  subtitles: {
    en: string;
    fr: string;
    es: string;
  };
  "audio-description": string; // URL du JSON
  chapters: string; // URL du JSON
  poi: string; // URL du JSON
}

// Structure supposée pour le fichier JSON de description audio
export interface AudioDescCue {
  time: number; // timestamp en secondes
  text: string; // texte à lire
}

// Structure supposée pour les chapitres
export interface Chapter {
  pos: number;
  title: string;
  time: number; 
}

// Structure pour les Points d'Intérêt (POI)
export interface POI {
  label: string;
  pos: string; // "lat, lng"
  time: number;
}
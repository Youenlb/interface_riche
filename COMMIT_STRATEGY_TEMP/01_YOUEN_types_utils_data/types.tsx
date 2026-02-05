// src/app/types.tsx
// Commit: Structure de base - Types TypeScript

export interface FilmInfo {
  file_url: string;
  title: string;
  synopsis_url: string;
}

export interface Subtitles {
  en: string;
  fr: string;
  es: string;
}

export interface AudioDescEntry {
  scene: number;
  timestamp: string; // "HH:MM:SS"
  description: string;
  description_fr?: string;
  description_es?: string;
}

export interface ChapterEntry {
  chapter: number;
  timestamp: string;
  title: string;
  title_fr: string;
  description_fr: string;
}

export interface POIScene {
  time: string;
  scene_fr: string;
}

export interface POIEntry {
  id: number;
  title_fr: string;
  latitude: number;
  longitude: number;
  description_fr: string;
  timestamps?: POIScene[];
}

export interface ChatMessage {
  when: string;   // Timestamp Unix (ex: "1580742794")
  name: string;   // Auteur (ex: "Alice")
  message: string;
  moment?: number; // Timestamp vidéo optionnel (en secondes)
}

export interface FilmData {
  film: FilmInfo;
  subtitles: Subtitles;
  audiodescription: AudioDescEntry[];
  chapters: ChapterEntry[];
  poi: POIEntry[];
}

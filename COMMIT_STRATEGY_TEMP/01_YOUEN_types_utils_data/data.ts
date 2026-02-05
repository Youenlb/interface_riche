// src/app/data.ts
// Commit: Structure de base - Fetching des données API

import { FilmData, Subtitles } from "./types";
import { convertSrtToVtt } from "./utils";

const API_BASE_URL = "https://tp-iai3.cleverapps.io/projet";
const CACHE_KEY = "filmData_cache";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached data if available and not expired
 */
function getCachedData(): FilmData | null {
  if (globalThis.window === undefined) return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    
    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Save data to cache
 */
function setCachedData(data: FilmData): void {
  if (globalThis.window === undefined) return;
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {
  }
}

/**
 * Helper function to add delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with retry logic and backoff
 */
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      
      // If success, return immediately
      if (response.ok) {
        return response;
      }
      
      // If rate limited (429), wait and retry
      if (response.status === 429 && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
        await delay(waitTime);
        continue;
      }
      
      // Return response even if not ok (will handle error later)
      return response;
    } catch (error) {
      if (i < maxRetries - 1) {
        await delay(1000 * (i + 1));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error("Max retries exceeded");
}

/**
 * Build complete FilmData from API endpoints
 * Fetches requests sequentially with delays to avoid rate limiting
 */
export async function fetchFilmData(): Promise<FilmData> {
  // Check cache first to avoid hitting rate limit
  const cached = getCachedData();
  if (cached) {
    return cached;
  }

  // Fetch the main endpoint which returns URLs
  const apiResponse = await fetchWithRetry(`${API_BASE_URL}`);
  
  if (!apiResponse.ok) {
    throw new Error(`Failed to fetch API data: ${apiResponse.status}`);
  }
  
  const apiData = await apiResponse.json();
  
  // Extract the URLs from API response
  const filmInfo = apiData.film;
  const subtitleUrls = apiData.subtitles || {};
  const audioDescUrl = apiData["audio-description"];
  const chaptersUrl = apiData.chapters;
  const poiUrl = apiData.poi;
  
  // Fetch and process each resource with delays to avoid rate limiting
  const subtitlesEn = await fetchSrtAsVttDataUrl(subtitleUrls.en);
  await delay(1500); // Increased delay to 1.5 seconds
  
  const subtitlesFr = await fetchSrtAsVttDataUrl(subtitleUrls.fr);
  await delay(1500);
  
  const subtitlesEs = await fetchSrtAsVttDataUrl(subtitleUrls.es);
  await delay(1500);
  
  const audioDesc = await fetchJson(audioDescUrl);
  await delay(1500);
  
  const chapters = await fetchJson(chaptersUrl);
  await delay(1500);
  
  const poi = await fetchJson(poiUrl);

  // Build subtitles object with data URLs
  const subtitles: Subtitles = {
    en: subtitlesEn,
    fr: subtitlesFr,
    es: subtitlesEs,
  };

  const result: FilmData = {
    film: filmInfo,
    subtitles,
    audiodescription: audioDesc,
    chapters,
    poi,
  };
  
  setCachedData(result);

  return result;
}

/**
 * Helper to fetch a URL containing SRT content and convert to VTT data URL
 */
async function fetchSrtAsVttDataUrl(srtUrl: string): Promise<string> {
  const response = await fetchWithRetry(srtUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch SRT: ${response.status}`);
  }
  
  const srtContent = await response.text();
  const vttContent = convertSrtToVtt(srtContent);
  
  return `data:text/vtt;charset=utf-8,${encodeURIComponent(vttContent)}`;
}

/**
 * Helper to fetch and parse JSON
 */
async function fetchJson(url: string): Promise<any> {
  const response = await fetchWithRetry(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON: ${response.status}`);
  }
  
  return response.json();
}

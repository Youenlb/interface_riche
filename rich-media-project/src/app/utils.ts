export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map(Number);
  // Format HH:MM:SS
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  // Format MM:SS (au cas où)
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatMessageDate(unixTimestamp: string): string {
  let ts = Number(unixTimestamp);
  if (!ts || Number.isNaN(ts)) return "À l'instant";
  
  if (ts < 10000000000) ts *= 1000;

  const date = new Date(ts);
  return date.toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: '2-digit', 
    hour: '2-digit', minute: '2-digit' 
  });
}
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

export function convertSrtToVtt(srtContent: string): string {
  // Add VTT header
  let vtt = 'WEBVTT\n\n';
  
  // Replace SRT timestamps:
  // Handles both HH:MM:SS,mmm and MM:SS,mmm formats
  // Converts comma to period: 00:01:30,500 -> 00:01:30.500
  const withFixedTimestamps = srtContent.replaceAll(/(\d{1,2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');
  
  // Remove sequence numbers (lines with only numbers)
  const lines = withFixedTimestamps.split('\n');
  const filteredLines = lines.filter((line, index) => {
    // Keep empty lines and lines that aren't just numbers
    return line.trim() === '' || Number.isNaN(Number(line.trim()));
  });
  
  vtt += filteredLines.join('\n');
  
  return vtt;
}
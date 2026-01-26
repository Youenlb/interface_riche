// app/utils.ts
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
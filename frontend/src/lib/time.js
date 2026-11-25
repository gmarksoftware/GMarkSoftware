/**
 * Canonical Video Time Utilities for GramGuru.
 * ALWAYS format and parse using strict HH:MM:SS format across the entire application.
 */

export function parseTimeToSeconds(input) {
  if (typeof input === 'number') {
    return isNaN(input) || input < 0 ? 0 : Math.floor(input);
  }
  if (!input || typeof input !== 'string') return 0;
  const parts = input.trim().split(':').map((p) => Number(p));
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1) {
    return Math.floor(parts[0]) || 0;
  }
  return 0;
}

export function formatTime(seconds) {
  let sec = seconds;
  if (typeof sec === 'string') {
    sec = parseTimeToSeconds(sec);
  }
  if (typeof sec !== 'number' || isNaN(sec) || sec < 0) {
    return '00:00:00';
  }
  const total = Math.floor(sec);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(remainingSeconds).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

// Shared update state type - single source of truth
// Compatible with electron-updater's UpdateInfo

export type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'error';

export interface UpdateFileInfo {
  url: string;
  size?: number;
  sha512?: string;
  blockMapSize?: number;
}

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string | Array<{ version: string; note: string }>;
  files?: UpdateFileInfo[];
}

export interface UpdateProgress {
  percent: number;
  transferred: number;
  total: number;
  bytesPerSecond?: number;
}

export interface UpdateState {
  status: UpdateStatus;
  info: UpdateInfo | null;
  progress: UpdateProgress | null;
  error: string | null;
}

/**
 * Converts release notes to string format.
 */
export function formatReleaseNotes(notes: string | Array<{ version: string; note: string }> | undefined): string {
  if (!notes) return '';
  if (typeof notes === 'string') return notes;
  return notes.map(n => n.note).join('\n');
}

/**
 * Formats bytes to human readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

/**
 * Formats speed to human readable string.
 */
export function formatSpeed(bytesPerSecond: number | undefined): string {
  if (!bytesPerSecond || bytesPerSecond <= 0) return '0 B/s';
  return `${formatBytes(bytesPerSecond)}/s`;
}

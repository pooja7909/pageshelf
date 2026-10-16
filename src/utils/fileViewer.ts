import { ShelfItem } from '../types';

export type FileCategory =
  | 'pdf'
  | 'text'
  | 'code'
  | 'markdown'
  | 'image'
  | 'video'
  | 'audio'
  | 'csv'
  | 'html'
  | 'office'
  | 'archive'
  | 'unknown';

export interface FileTypeDetails {
  category: FileCategory;
  label: string;
  mimeType: string;
  canViewInline: boolean;
  canOpenInDesktopTab: boolean;
  language?: string;
}

const MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  txt: 'text/plain;charset=utf-8',
  md: 'text/markdown;charset=utf-8',
  html: 'text/html;charset=utf-8',
  htm: 'text/html;charset=utf-8',
  css: 'text/css;charset=utf-8',
  js: 'application/javascript;charset=utf-8',
  mjs: 'application/javascript;charset=utf-8',
  ts: 'text/typescript;charset=utf-8',
  tsx: 'text/typescript;charset=utf-8',
  jsx: 'text/javascript;charset=utf-8',
  json: 'application/json;charset=utf-8',
  py: 'text/x-python;charset=utf-8',
  java: 'text/x-java-source;charset=utf-8',
  c: 'text/x-c;charset=utf-8',
  cpp: 'text/x-c++;charset=utf-8',
  cs: 'text/x-csharp;charset=utf-8',
  sql: 'application/sql;charset=utf-8',
  csv: 'text/csv;charset=utf-8',
  xml: 'application/xml;charset=utf-8',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  zip: 'application/zip'
};

export function getFileTypeDetails(item: ShelfItem): FileTypeDetails {
  const ext = (item.ext || (item.fileName?.split('.').pop() || '')).toLowerCase();

  if (ext === 'pdf') {
    return {
      category: 'pdf',
      label: 'PDF Document',
      mimeType: MIME_MAP.pdf,
      canViewInline: true,
      canOpenInDesktopTab: true
    };
  }

  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
    return {
      category: 'image',
      label: `${ext.toUpperCase()} Image`,
      mimeType: MIME_MAP[ext] || 'image/png',
      canViewInline: true,
      canOpenInDesktopTab: true
    };
  }

  if (ext === 'md') {
    return {
      category: 'markdown',
      label: 'Markdown Notes',
      mimeType: MIME_MAP.md,
      canViewInline: true,
      canOpenInDesktopTab: true,
      language: 'markdown'
    };
  }

  if (['html', 'htm'].includes(ext)) {
    return {
      category: 'html',
      label: 'HTML Document',
      mimeType: MIME_MAP.html,
      canViewInline: true,
      canOpenInDesktopTab: true,
      language: 'html'
    };
  }

  if (ext === 'csv') {
    return {
      category: 'csv',
      label: 'CSV Data Table',
      mimeType: MIME_MAP.csv,
      canViewInline: true,
      canOpenInDesktopTab: true,
      language: 'csv'
    };
  }

  const codeExts: Record<string, string> = {
    py: 'Python',
    java: 'Java',
    js: 'JavaScript',
    ts: 'TypeScript',
    tsx: 'TypeScript (React)',
    jsx: 'JavaScript (React)',
    json: 'JSON',
    sql: 'SQL',
    c: 'C',
    cpp: 'C++',
    cs: 'C#',
    css: 'CSS',
    xml: 'XML'
  };

  if (codeExts[ext]) {
    return {
      category: 'code',
      label: `${codeExts[ext]} File`,
      mimeType: MIME_MAP[ext] || 'text/plain;charset=utf-8',
      canViewInline: true,
      canOpenInDesktopTab: true,
      language: codeExts[ext]
    };
  }

  if (ext === 'txt') {
    return {
      category: 'text',
      label: 'Text Document',
      mimeType: MIME_MAP.txt,
      canViewInline: true,
      canOpenInDesktopTab: true
    };
  }

  if (['mp4', 'webm'].includes(ext)) {
    return {
      category: 'video',
      label: 'Video',
      mimeType: MIME_MAP[ext] || 'video/mp4',
      canViewInline: true,
      canOpenInDesktopTab: true
    };
  }

  if (['mp3', 'wav', 'ogg'].includes(ext)) {
    return {
      category: 'audio',
      label: 'Audio',
      mimeType: MIME_MAP[ext] || 'audio/mpeg',
      canViewInline: true,
      canOpenInDesktopTab: true
    };
  }

  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
    const docLabels: Record<string, string> = {
      doc: 'Word Document',
      docx: 'Word Document',
      ppt: 'PowerPoint Presentation',
      pptx: 'PowerPoint Presentation',
      xls: 'Excel Spreadsheet',
      xlsx: 'Excel Spreadsheet'
    };
    return {
      category: 'office',
      label: docLabels[ext] || 'Office Document',
      mimeType: MIME_MAP[ext] || 'application/octet-stream',
      canViewInline: false,
      canOpenInDesktopTab: true
    };
  }

  if (['zip', 'tar', 'gz', 'rar'].includes(ext)) {
    return {
      category: 'archive',
      label: 'Archive / Zip',
      mimeType: MIME_MAP.zip || 'application/zip',
      canViewInline: false,
      canOpenInDesktopTab: false
    };
  }

  return {
    category: 'unknown',
    label: ext ? `${ext.toUpperCase()} File` : 'File',
    mimeType: 'application/octet-stream',
    canViewInline: false,
    canOpenInDesktopTab: true
  };
}

import { getFileFromIndexedDB } from './storageDB';

/**
 * Creates a browser Blob URL from shelf item fileData.
 * Allows viewing on desktop without downloading to disk.
 */
export function createBlobUrlFromFile(item: ShelfItem): string | null {
  if (!item.fileData && !item.url) return null;

  const details = getFileTypeDetails(item);

  // If item has a web URL, return that
  if (item.type === 'link' && item.url) {
    return item.url;
  }

  const rawData = item.fileData || '';

  // Case 1: Base64 Data URL (e.g. data:application/pdf;base64,JVBERi0x...)
  if (rawData.startsWith('data:')) {
    try {
      const match = rawData.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mime = match[1] || details.mimeType;
        const byteCharacters = atob(match[2]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.warn('Failed to parse base64 data URL, falling back to raw:', e);
      return rawData;
    }
  }

  // Case 2: Plain text or code string
  try {
    const blob = new Blob([rawData], { type: details.mimeType });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/**
 * Asynchronously resolves a blob URL from either fileData or IndexedDB
 * (supports files of any size without 800KB or memory constraints).
 */
export async function resolveItemBlobUrl(item: ShelfItem): Promise<string | null> {
  // First check if direct fileData is available
  if (item.fileData) {
    const directUrl = createBlobUrlFromFile(item);
    if (directUrl) return directUrl;
  }

  // Check high-capacity IndexedDB for large or cached files
  try {
    let stored = await getFileFromIndexedDB(item.id);
    if (!stored && item.id.endsWith('_ms')) {
      const altKey = item.id.replace(/_ms$/, '_markscheme');
      stored = await getFileFromIndexedDB(altKey);
    }
    if (stored) {
      const details = getFileTypeDetails(item);
      if (stored instanceof Blob) {
        return URL.createObjectURL(stored);
      }
      if (typeof stored === 'string') {
        if (stored.startsWith('data:')) {
          return createBlobUrlFromFile({ ...item, fileData: stored });
        }
        const blob = new Blob([stored], { type: details.mimeType });
        return URL.createObjectURL(blob);
      }
    }
  } catch (err) {
    console.warn('Could not read from IndexedDB for item', item.id, err);
  }

  return item.url || null;
}

/**
 * Automatically opens an item (file or web link) in a dedicated separate desktop browser window/tab.
 * This ensures files are never cramped or "too small on the screen".
 */
export function openItemInSeparateWindow(item: ShelfItem): Window | null {
  try {
    // Case 1: Web link (opens external web app or website in a clean new tab)
    if (item.type === 'link' && item.url) {
      const win = window.open(item.url, '_blank');
      if (win) win.focus();
      return win;
    }

    // Case 2: File (opens dedicated standalone desktop viewer window with #view=itemId)
    const viewerUrl = `${window.location.origin}${window.location.pathname}#view=${encodeURIComponent(item.id)}`;
    const win = window.open(viewerUrl, '_blank');
    if (win) {
      win.focus();
      return win;
    }

    // Fallback if direct blob works
    const blobUrl = createBlobUrlFromFile(item);
    if (blobUrl) {
      const fallbackWin = window.open(blobUrl, '_blank');
      if (fallbackWin) {
        fallbackWin.focus();
        return fallbackWin;
      }
    }
    return null;
  } catch (err) {
    console.error('Failed to open item in separate window:', err);
    return null;
  }
}

/**
 * Opens a file in a dedicated desktop browser window/tab.
 * Kept for backwards compatibility.
 */
export function openFileInDesktopTab(item: ShelfItem): boolean {
  const win = openItemInSeparateWindow(item);
  return win !== null;
}

/**
 * Downloads a file to disk, with support for any file size from IndexedDB
 */
export async function downloadShelfFile(item: ShelfItem): Promise<boolean> {
  try {
    let urlToUse: string | null = null;

    if (item.fileData) {
      if (item.fileData.startsWith('data:')) {
        urlToUse = createBlobUrlFromFile(item);
      } else {
        const details = getFileTypeDetails(item);
        const blob = new Blob([item.fileData], { type: details.mimeType });
        urlToUse = URL.createObjectURL(blob);
      }
    } else {
      urlToUse = await resolveItemBlobUrl(item);
    }

    if (!urlToUse) return false;

    const a = document.createElement('a');
    a.href = urlToUse;
    a.download = item.fileName || item.title || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (err) {
    console.warn('Error downloading file:', err);
    return false;
  }
}

/**
 * Lightweight safe markdown-to-html formatter for student reading view
 */
export function formatMarkdown(md: string): string {
  if (!md) return '';

  let html = md
    // Escape basic HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks
    .replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (_m, lang, code) => {
      return `<pre class="my-3 p-3.5 bg-neutral-900 text-neutral-100 rounded-lg font-mono text-xs overflow-x-auto border border-neutral-700/50"><div class="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-semibold">${lang || 'code'}</div><code>${code.trim()}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[var(--surface2)] border border-[var(--line)] font-mono text-xs text-[var(--ink)]">$1</code>')
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold mt-4 mb-2 text-[var(--ink)] border-b border-[var(--line)] pb-1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mt-5 mb-2 text-[var(--ink)] border-b border-[var(--line)] pb-1">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold mt-6 mb-3 text-[var(--ink)] border-b border-[var(--line)] pb-1.5">$1</h1>')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-[var(--accent)] pl-3 my-2 text-[var(--muted)] italic text-sm">$1</blockquote>')
    // Bold & Italics
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-[var(--ink)]">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    // Bullet lists
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-sm my-0.5">$1</li>')
    // Numbered lists
    .replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-sm my-0.5">$2</li>')
    // Paragraphs / line breaks
    .replace(/\n\n+/g, '</p><p class="my-2.5 text-sm leading-relaxed text-[var(--ink)]">');

  return `<div class="prose max-w-none text-sm leading-relaxed text-[var(--ink)]"><p class="my-2 text-sm leading-relaxed">${html}</p></div>`;
}

/**
 * CSV parser for tabular view
 */
export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  if (!text.trim()) return { headers: [], rows: [] };

  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if ((c === ',' || c === '\t' || c === ';') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

/**
 * Creates a synthetic ShelfItem representing an assessment's attached mark scheme
 */
export function createMarkSchemeShelfItem(parentItem: ShelfItem): ShelfItem | null {
  if (!parentItem.markSchemeFileName && !parentItem.markSchemeUrl && !parentItem.markSchemeFileData) {
    return null;
  }
  return {
    id: `${parentItem.id}_ms`,
    type: parentItem.markSchemeFileName || parentItem.markSchemeFileData ? 'file' : 'link',
    title: parentItem.markSchemeTitle || `${parentItem.title} - Mark Scheme`,
    url: parentItem.markSchemeUrl,
    cat: parentItem.cat,
    fileName: parentItem.markSchemeFileName,
    fileData: parentItem.markSchemeFileData,
    ext: parentItem.markSchemeExt || (parentItem.markSchemeFileName?.split('.').pop() || 'pdf'),
    size: parentItem.markSchemeSize,
    visibleToStudents: parentItem.markSchemeVisibleToStudents,
    isLargeFile: parentItem.markSchemeIsLargeFile
  };
}

/**
 * Opens an assessment's mark scheme in a dedicated separate desktop window/tab
 */
export function openMarkSchemeInSeparateWindow(parentItem: ShelfItem): Window | null {
  const msItem = createMarkSchemeShelfItem(parentItem);
  if (!msItem) return null;
  return openItemInSeparateWindow(msItem);
}

/**
 * Downloads an assessment's mark scheme to disk
 */
export async function downloadMarkSchemeFile(parentItem: ShelfItem): Promise<boolean> {
  const msItem = createMarkSchemeShelfItem(parentItem);
  if (!msItem) return false;
  return downloadShelfFile(msItem);
}

export function normalizeUrl(raw: string): string | null {
  let s = String(raw || '').trim().replace(/^[\s"'<(\[]+|[\s"'>)\].,;]+$/g, '');
  if (!s) return null;

  // File paths on local machine (e.g. C:\..., /Users/...)
  const win = s.match(/^([a-zA-Z]):[\\/](.*)$/);
  if (win) {
    s = 'file:///' + win[1].toUpperCase() + ':/' + win[2].replace(/\\/g, '/');
  } else if (/^\\\\[^\\]/.test(s)) {
    s = 'file:' + s.replace(/\\/g, '/');
  } else if (/^\/(Users|home|Volumes|mnt|media)\//.test(s)) {
    s = 'file://' + s;
  } else if (!/^(https?|file):/i.test(s)) {
    const m = s.match(/(https?:\/\/[^\s"'<>]+)/i);
    if (m) {
      s = m[1].replace(/[.,;)\]]+$/, '');
    } else if (/^[a-z][a-z0-9+.-]*:/i.test(s) && !/^[^\s:\/]+\.[a-z]{2,}(:\d+)?([\/?#]|$)/i.test(s)) {
      return null;
    } else {
      s = 'https://' + s;
    }
  }

  try {
    const u = new URL(s.replace(/ /g, '%20'));
    if (u.protocol === 'file:') return u.href;
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.')) return null;
    return u.href;
  } catch {
    return null;
  }
}

const FILE_EXT: Record<string, string> = {
  pdf: 'PDF',
  doc: 'Word',
  docx: 'Word',
  ppt: 'Slides',
  pptx: 'Slides',
  xls: 'Sheet',
  xlsx: 'Sheet',
  csv: 'CSV',
  zip: 'Zip',
  png: 'Image',
  jpg: 'Image',
  jpeg: 'Image',
  gif: 'Image',
  svg: 'Image',
  webp: 'Image',
  mp4: 'Video',
  webm: 'Video',
  mp3: 'Audio',
  py: 'Python Code',
  java: 'Java Code',
  js: 'JavaScript',
  ts: 'TypeScript',
  ipynb: 'Notebook',
  md: 'Markdown',
  txt: 'Text Document',
  html: 'Web page',
  sql: 'SQL Script'
};

export interface LinkAnalysis {
  kind: string;
  title: string;
  file: boolean;
  host: string;
  isLocal: boolean;
  embeddable: boolean;
  embedUrl?: string;
  detectedKind?: 'link' | 'video' | 'assessment' | 'timeline' | 'file';
}

export function analyseUrl(href: string): LinkAnalysis {
  if (/^file:/i.test(href)) {
    const name = decodeURIComponent(href.split('/').pop() || 'File');
    return {
      kind: 'Local File',
      title: name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || name,
      file: true,
      host: 'local',
      isLocal: true,
      embeddable: false
    };
  }

  try {
    const u = new URL(href);
    const h = u.hostname.replace(/^www\./, '');
    const parts = u.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const last = parts[parts.length - 1] || '';
    const ext = (last.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase();
    
    const pretty = (s: string) =>
      s.replace(/\.(html?|md)$/i, '')
       .replace(/[-_]+/g, ' ')
       .replace(/\s+/g, ' ')
       .trim()
       .replace(/^./, (c) => c.toUpperCase());

    let kind = 'Web page';
    let title = '';
    let file = false;
    let embeddable = false;
    let embedUrl: string | undefined = undefined;
    let detectedKind: 'link' | 'video' | 'assessment' | 'timeline' | 'file' = 'link';

    // Video platforms
    if (h.includes('youtube.com') || h === 'youtu.be') {
      kind = 'YouTube Video';
      detectedKind = 'video';
      embeddable = true;
      let videoId = '';
      if (h === 'youtu.be') {
        videoId = parts[0] || '';
      } else if (u.pathname.startsWith('/embed/')) {
        videoId = parts[1] || '';
      } else {
        videoId = u.searchParams.get('v') || '';
      }
      if (videoId) {
        embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
      }
    } else if (h.includes('vimeo.com')) {
      kind = 'Vimeo Video';
      detectedKind = 'video';
      embeddable = true;
      const vimeoId = parts[parts.length - 1];
      if (/^\d+$/.test(vimeoId)) {
        embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
      }
    } else if (h.includes('loom.com')) {
      kind = 'Loom Video';
      detectedKind = 'video';
      embeddable = true;
      const loomId = parts[parts.length - 1];
      if (loomId) {
        embedUrl = `https://www.loom.com/embed/${loomId}`;
      }
    } else if (h.includes('forms.google.com') || (h.includes('docs.google.com') && u.pathname.includes('/forms/'))) {
      kind = 'Google Form Quiz';
      detectedKind = 'assessment';
      embeddable = true;
    } else if (h.includes('quizizz.com') || h.includes('kahoot.it') || h.includes('quizlet.com')) {
      kind = 'Interactive Quiz';
      detectedKind = 'assessment';
    } else if (/\.github\.io$/.test(h)) {
      kind = 'GitHub Pages';
      const user = h.split('.')[0];
      const page = parts.filter(p => !/^index\.html?$/i.test(p));
      title = page.length ? pretty(page[page.length - 1]) : `${user}'s GitHub Page`;
      embeddable = true;
    } else if (h === 'github.com') {
      if (parts.length >= 4 && ['blob', 'raw'].includes(parts[2])) {
        kind = 'GitHub File';
        file = true;
        title = pretty(last) || parts[1];
      } else if (parts.length >= 2) {
        kind = 'GitHub Repo';
        title = pretty(parts[1]) || parts[1];
      } else {
        kind = 'GitHub';
        title = parts[0] || 'GitHub';
      }
    } else if (h === 'raw.githubusercontent.com') {
      kind = 'GitHub File';
      file = true;
      title = pretty(last);
    } else if (h === 'gist.github.com') {
      kind = 'Gist';
      title = parts[1] ? 'Gist ' + parts[1].slice(0, 7) : 'Gist';
    } else if (h === 'docs.google.com') {
      kind = ({
        document: 'Google Doc',
        spreadsheets: 'Google Sheet',
        presentation: 'Google Slides',
        forms: 'Google Form'
      } as Record<string, string>)[parts[0]] || 'Google Workspace';
      file = true;
      title = kind;
    } else if (h === 'drive.google.com') {
      kind = 'Drive File';
      file = true;
      title = 'Google Drive';
    } else if (/vercel\.app$|netlify\.app$|pages\.dev$|replit\.app$|glitch\.me$/.test(h)) {
      kind = 'Web App';
      title = pretty(h.split('.')[0]);
      embeddable = true;
    }

    if (ext && FILE_EXT[ext] && !/github\.io$/.test(h)) {
      kind = FILE_EXT[ext];
      file = true;
      title = title || pretty(last);
      if (['mp4', 'webm'].includes(ext)) {
        detectedKind = 'video';
      }
    }

    if (!title) {
      title = pretty(last) || h;
    }

    return {
      kind,
      title,
      file,
      host: h,
      isLocal: false,
      embeddable,
      embedUrl,
      detectedKind
    };
  } catch {
    return {
      kind: 'Link',
      title: 'Resource',
      file: false,
      host: '',
      isLocal: false,
      embeddable: false
    };
  }
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

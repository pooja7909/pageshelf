import React, { useState } from 'react';
import { X, ExternalLink, Download, Copy, Check, Maximize2, Minimize2, Video, Calendar, Award } from 'lucide-react';
import { ShelfItem } from '../types';
import { formatFileSize, analyseUrl } from '../utils/linkAnalyzer';

interface PreviewModalProps {
  item: ShelfItem | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ item, onClose, onToast }) => {
  const [copied, setCopied] = useState(false);
  const [isFull, setIsFull] = useState(false);

  if (!item) return null;

  const analysis = item.url ? analyseUrl(item.url) : null;
  const isVideo = item.kind === 'video' || analysis?.detectedKind === 'video';
  const effectiveEmbedUrl = item.embedUrl || analysis?.embedUrl;

  const handleCopyLink = () => {
    const textToCopy = item.type === 'link' ? item.url : window.location.href;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onToast('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!item.fileData) return;
    const a = document.createElement('a');
    a.href = item.fileData;
    a.download = item.fileName || item.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onToast(`Downloaded ${item.fileName || item.title}`);
  };

  const isTextFile = item.type === 'file' && ['txt', 'md', 'py', 'java', 'js', 'ts', 'html', 'json', 'csv', 'sql'].includes(item.ext || '');
  const isImage = item.type === 'file' && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(item.ext || '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-card ${isFull ? 'max-w-[96vw] h-[92vh]' : 'max-w-[850px] max-h-[88vh]'} flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header pb-2 border-b border-[var(--line)]">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="truncate text-base md:text-lg font-bold m-0">{item.title}</h3>
              {item.kind === 'video' && (
                <span className="badge-tag bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                  <Video className="w-3 h-3" /> Video
                </span>
              )}
              {item.kind === 'assessment' && (
                <span className="badge-tag bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px] font-semibold">
                  {item.assessmentType?.toUpperCase() || 'ASSESSMENT'}
                </span>
              )}
              {item.dueDate && (
                <span className="badge-tag text-[11px] flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-blue-500" /> Due: {item.dueDate}
                </span>
              )}
              {item.maxMarks !== undefined && (
                <span className="badge-tag text-[11px] flex items-center gap-1 font-mono">
                  <Award className="w-3 h-3 text-amber-500" /> {item.maxMarks} Marks
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted)] font-mono truncate m-0 mt-0.5">
              {item.type === 'link' ? item.url : `${item.fileName || 'file'} · ${formatFileSize(item.size || 0)}`}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              className="icon"
              onClick={() => setIsFull(!isFull)}
              title={isFull ? 'Restore size' : 'Expand preview'}
            >
              {isFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {item.type === 'link' && item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="icon"
                title="Open directly in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              type="button"
              className="icon"
              onClick={handleCopyLink}
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {item.type === 'file' && item.fileData && (
              <button
                type="button"
                className="icon"
                onClick={handleDownload}
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              className="icon"
              onClick={onClose}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {item.note && (
          <div className="text-xs bg-[var(--surface2)] px-3 py-1.5 rounded-md text-[var(--muted)]">
            💡 {item.note}
          </div>
        )}

        {/* Content Viewer */}
        <div className="flex-1 min-h-[380px] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface2)] relative flex items-center justify-center">
          {item.type === 'link' && item.url ? (
            <div className="w-full h-full flex flex-col">
              <iframe
                src={effectiveEmbedUrl || item.url}
                title={item.title}
                className="w-full flex-1 border-0 bg-white"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                loading="lazy"
              />
              <div className="p-2 text-center text-xs text-[var(--muted)] bg-[var(--surface)] border-t border-[var(--line)]">
                If this external site blocks embedded display in iframes,{' '}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] font-semibold underline underline-offset-2 ml-1"
                >
                  open it in a new window →
                </a>
              </div>
            </div>
          ) : isImage && item.fileData ? (
            <img
              src={item.fileData}
              alt={item.title}
              className="max-w-full max-h-[70vh] object-contain rounded p-2"
            />
          ) : isTextFile && item.fileData ? (
            <pre className="w-full h-full p-4 overflow-auto font-mono text-xs whitespace-pre-wrap bg-[var(--surface)] text-[var(--ink)] m-0">
              {item.fileData}
            </pre>
          ) : (
            <div className="p-6 text-center">
              <p className="font-semibold">{item.fileName || item.title}</p>
              <p className="text-xs text-[var(--muted)] mb-4">
                This file type ({item.ext?.toUpperCase() || 'Binary'}) can be saved or downloaded.
              </p>
              {item.fileData && (
                <button type="button" className="btn sm primary" onClick={handleDownload}>
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

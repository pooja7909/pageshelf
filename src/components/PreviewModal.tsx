import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ExternalLink,
  Download,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Video,
  Calendar,
  Award,
  Monitor,
  FileText,
  Code,
  Table as TableIcon,
  Eye,
  FileCode2,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { ShelfItem } from '../types';
import { formatFileSize, analyseUrl } from '../utils/linkAnalyzer';
import {
  getFileTypeDetails,
  createBlobUrlFromFile,
  resolveItemBlobUrl,
  openItemInSeparateWindow,
  openFileInDesktopTab,
  downloadShelfFile,
  formatMarkdown,
  parseCsv
} from '../utils/fileViewer';

interface PreviewModalProps {
  item: ShelfItem | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ item, onClose, onToast }) => {
  const [copied, setCopied] = useState(false);
  const [isFull, setIsFull] = useState(true);
  const [viewMode, setViewMode] = useState<'preview' | 'source' | 'table'>('preview');
  const [wrapCode, setWrapCode] = useState(true);
  const [imageZoom, setImageZoom] = useState(1);
  const [csvSearch, setCsvSearch] = useState('');
  const [asyncBlobUrl, setAsyncBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (item) {
      resolveItemBlobUrl(item).then((url) => {
        if (active) setAsyncBlobUrl(url);
      });
    }
    return () => {
      active = false;
    };
  }, [item]);

  // Generate blob url for desktop viewing
  const directBlobUrl = useMemo(() => {
    return item ? createBlobUrlFromFile(item) : null;
  }, [item]);

  const blobUrl = asyncBlobUrl || directBlobUrl;

  // Text / Code splitting for lines
  const textLines = useMemo(() => {
    if (!item || item.type !== 'file' || !item.fileData || item.fileData.startsWith('data:')) return [];
    return item.fileData.split(/\r?\n/);
  }, [item]);

  // CSV parsing
  const csvData = useMemo(() => {
    if (!item || !item.fileData) return { headers: [], rows: [] };
    const details = getFileTypeDetails(item);
    if (details.category !== 'csv') return { headers: [], rows: [] };
    return parseCsv(item.fileData);
  }, [item]);

  const filteredCsvRows = useMemo(() => {
    if (!csvSearch.trim()) return csvData.rows;
    const q = csvSearch.toLowerCase();
    return csvData.rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(q)));
  }, [csvData.rows, csvSearch]);

  if (!item) return null;

  const analysis = item.url ? analyseUrl(item.url) : null;
  const isVideo = item.kind === 'video' || analysis?.detectedKind === 'video';
  const effectiveEmbedUrl = item.embedUrl || analysis?.embedUrl;
  const fileDetails = getFileTypeDetails(item);

  const handleCopyLink = () => {
    const textToCopy = item.type === 'link' ? item.url : window.location.href;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onToast('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    onToast(`Downloading ${item.fileName || item.title}…`);
    const success = await downloadShelfFile(item);
    if (!success) {
      onToast('Unable to download file.');
    }
  };

  const handleOpenDesktopTab = () => {
    const win = openItemInSeparateWindow(item);
    if (win) {
      onToast(`Opened "${item.title}" in another window`);
    } else {
      onToast('Browser popup was blocked. Click allow popups to open directly.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-card ${isFull ? 'max-w-[98vw] h-[95vh]' : 'max-w-[950px] max-h-[90vh]'} flex flex-col transition-all duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="modal-header pb-2 border-b border-[var(--line)] flex-shrink-0">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="truncate text-base md:text-lg font-bold m-0">{item.title}</h3>

              {item.type === 'file' && (
                <span className="badge-tag bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px] font-semibold flex items-center gap-1">
                  <Monitor className="w-3 h-3" /> {fileDetails.label}
                </span>
              )}

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
              {item.type === 'link'
                ? item.url
                : `${item.fileName || 'file'} · ${formatFileSize(item.size || 0)} · Desktop Viewer`}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Direct Open in Desktop Tab Button */}
            <button
              type="button"
              className="btn sm bg-[var(--surface2)] hover:border-[var(--accent)] text-xs flex items-center gap-1.5 px-2.5 py-1.5 font-medium"
              onClick={handleOpenDesktopTab}
              title="Open full view in a dedicated desktop browser window/tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden sm:inline">Open in Desktop Tab</span>
              <span className="sm:hidden">Open</span>
            </button>

            {/* Toggle Fullscreen / Expand */}
            <button
              type="button"
              className="icon"
              onClick={() => setIsFull(!isFull)}
              title={isFull ? 'Restore size' : 'Expand to full screen'}
            >
              {isFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Copy Link */}
            <button
              type="button"
              className="icon"
              onClick={handleCopyLink}
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Download File */}
            {item.type === 'file' && (
              <button
                type="button"
                className="icon"
                onClick={handleDownload}
                title="Download file to computer"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Close */}
            <button
              type="button"
              className="icon"
              onClick={onClose}
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Note / Instructions banner */}
        {item.note && (
          <div className="text-xs bg-[var(--surface2)] px-3 py-1.5 rounded-md text-[var(--muted)] flex-shrink-0">
            💡 {item.note}
          </div>
        )}

        {/* Secondary Sub-Toolbar for Code / HTML / Markdown / CSV */}
        {item.type === 'file' && (
          <div className="flex items-center justify-between gap-2 px-1 py-1 text-xs border-b border-[var(--line)] bg-[var(--surface)] flex-shrink-0 flex-wrap">
            <div className="flex items-center gap-2">
              {fileDetails.category === 'markdown' && (
                <div className="flex items-center bg-[var(--surface2)] rounded p-0.5 border border-[var(--line)]">
                  <button
                    type="button"
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      viewMode === 'preview' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs font-semibold' : 'text-[var(--muted)]'
                    }`}
                    onClick={() => setViewMode('preview')}
                  >
                    <BookOpen className="w-3 h-3 inline mr-1" /> Formatted Notes
                  </button>
                  <button
                    type="button"
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      viewMode === 'source' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs font-semibold' : 'text-[var(--muted)]'
                    }`}
                    onClick={() => setViewMode('source')}
                  >
                    <Code className="w-3 h-3 inline mr-1" /> Markdown Source
                  </button>
                </div>
              )}

              {fileDetails.category === 'html' && (
                <div className="flex items-center bg-[var(--surface2)] rounded p-0.5 border border-[var(--line)]">
                  <button
                    type="button"
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      viewMode === 'preview' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs font-semibold' : 'text-[var(--muted)]'
                    }`}
                    onClick={() => setViewMode('preview')}
                  >
                    <Eye className="w-3 h-3 inline mr-1" /> Web Page View
                  </button>
                  <button
                    type="button"
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      viewMode === 'source' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs font-semibold' : 'text-[var(--muted)]'
                    }`}
                    onClick={() => setViewMode('source')}
                  >
                    <FileCode2 className="w-3 h-3 inline mr-1" /> HTML Source
                  </button>
                </div>
              )}

              {fileDetails.category === 'csv' && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[var(--surface2)] rounded p-0.5 border border-[var(--line)]">
                    <button
                      type="button"
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        viewMode === 'preview' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs font-semibold' : 'text-[var(--muted)]'
                      }`}
                      onClick={() => setViewMode('preview')}
                    >
                      <TableIcon className="w-3 h-3 inline mr-1" /> Table ({csvData.rows.length} rows)
                    </button>
                    <button
                      type="button"
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        viewMode === 'source' ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs font-semibold' : 'text-[var(--muted)]'
                      }`}
                      onClick={() => setViewMode('source')}
                    >
                      <FileText className="w-3 h-3 inline mr-1" /> Raw CSV
                    </button>
                  </div>
                  {viewMode === 'preview' && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--surface2)] border border-[var(--line)] rounded">
                      <Search className="w-3 h-3 text-[var(--muted)]" />
                      <input
                        type="text"
                        placeholder="Search data…"
                        value={csvSearch}
                        onChange={(e) => setCsvSearch(e.target.value)}
                        className="bg-transparent border-none text-xs outline-none w-28 sm:w-36 text-[var(--ink)]"
                      />
                    </div>
                  )}
                </div>
              )}

              {(fileDetails.category === 'code' || (viewMode === 'source' && ['markdown', 'html', 'csv'].includes(fileDetails.category))) && (
                <button
                  type="button"
                  className="btn sm ghost text-xs py-0.5 px-2"
                  onClick={() => setWrapCode(!wrapCode)}
                  title="Toggle code line wrapping"
                >
                  Wrap: {wrapCode ? 'ON' : 'OFF'}
                </button>
              )}

              {fileDetails.category === 'image' && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="icon sm"
                    onClick={() => setImageZoom((z) => Math.min(z + 0.25, 3))}
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="icon sm"
                    onClick={() => setImageZoom((z) => Math.max(z - 0.25, 0.5))}
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="icon sm"
                    onClick={() => setImageZoom(1)}
                    title="Reset zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[11px] text-[var(--muted)]">{Math.round(imageZoom * 100)}%</span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-[var(--muted)] font-mono">
              {item.type === 'file' && blobUrl && (
                <button
                  type="button"
                  onClick={handleOpenDesktopTab}
                  className="text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                >
                  <Monitor className="w-3 h-3" /> View standalone tab
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Viewer Workspace */}
        <div className="flex-1 min-h-[420px] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface2)] relative flex flex-col items-center justify-center">
          {/* 1. External Links & Video Embeds */}
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
              <div className="p-2 text-center text-xs text-[var(--muted)] bg-[var(--surface)] border-t border-[var(--line)] flex items-center justify-center gap-2 flex-wrap">
                <span>If the website blocks embedded view:</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] font-semibold underline underline-offset-2 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in New Desktop Window →
                </a>
              </div>
            </div>
          ) : /* 2. PDF Document Viewer */
          fileDetails.category === 'pdf' && blobUrl ? (
            <div className="w-full h-full flex flex-col bg-neutral-800">
              <iframe
                src={blobUrl}
                title={item.title}
                className="w-full flex-1 border-0 bg-white"
              />
              <div className="p-2 px-3 bg-[var(--surface)] border-t border-[var(--line)] text-xs flex items-center justify-between flex-wrap gap-2">
                <span className="text-[var(--muted)] flex items-center gap-1.5 font-medium">
                  <Monitor className="w-3.5 h-3.5 text-[var(--accent)]" /> Desktop PDF Viewer Active
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn sm primary text-xs"
                    onClick={handleOpenDesktopTab}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open Fullscreen Desktop Tab
                  </button>
                  <button
                    type="button"
                    className="btn sm text-xs"
                    onClick={handleDownload}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Download
                  </button>
                </div>
              </div>
            </div>
          ) : /* 3. Image Viewer */
          fileDetails.category === 'image' && item.fileData ? (
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
              <img
                src={item.fileData}
                alt={item.title}
                style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center center' }}
                className="max-w-full max-h-[75vh] object-contain rounded shadow-md transition-transform duration-100"
              />
            </div>
          ) : /* 4. Video Player */
          fileDetails.category === 'video' && blobUrl ? (
            <div className="w-full h-full flex items-center justify-center p-4 bg-black">
              <video
                src={blobUrl}
                controls
                autoPlay
                className="max-w-full max-h-[75vh] rounded shadow-lg"
              >
                Your browser does not support HTML5 video.
              </video>
            </div>
          ) : /* 5. Audio Player */
          fileDetails.category === 'audio' && blobUrl ? (
            <div className="p-8 text-center max-w-md w-full bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xs">
              <h4 className="font-bold text-base mb-1">{item.title}</h4>
              <p className="text-xs text-[var(--muted)] mb-4">{item.fileName}</p>
              <audio src={blobUrl} controls className="w-full" />
            </div>
          ) : /* 6. Markdown Notes */
          fileDetails.category === 'markdown' && item.fileData ? (
            viewMode === 'preview' ? (
              <div
                className="w-full h-full p-6 overflow-auto bg-[var(--surface)] text-[var(--ink)]"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(item.fileData) }}
              />
            ) : (
              <pre
                className={`w-full h-full p-4 overflow-auto font-mono text-xs bg-[var(--surface)] text-[var(--ink)] m-0 ${
                  wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'
                }`}
              >
                {item.fileData}
              </pre>
            )
          ) : /* 7. HTML Document */
          fileDetails.category === 'html' && item.fileData ? (
            viewMode === 'preview' ? (
              <iframe
                srcDoc={item.fileData}
                title={item.title}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <pre
                className={`w-full h-full p-4 overflow-auto font-mono text-xs bg-[var(--surface)] text-[var(--ink)] m-0 ${
                  wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'
                }`}
              >
                {item.fileData}
              </pre>
            )
          ) : /* 8. CSV Table Viewer */
          fileDetails.category === 'csv' && item.fileData ? (
            viewMode === 'preview' ? (
              <div className="w-full h-full overflow-auto bg-[var(--surface)] p-2">
                <table className="w-full border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-[var(--surface2)] border-b border-[var(--line)] sticky top-0">
                      <th className="p-2 text-left font-bold text-[var(--muted)] w-10">#</th>
                      {csvData.headers.map((h, i) => (
                        <th key={i} className="p-2 text-left font-bold text-[var(--ink)] border-l border-[var(--line)]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCsvRows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={`border-b border-[var(--line)] hover:bg-[var(--surface2)] ${
                          rIdx % 2 === 1 ? 'bg-[var(--surface)]' : 'bg-[var(--surface2)]/40'
                        }`}
                      >
                        <td className="p-2 text-[var(--muted)] select-none text-[10px]">{rIdx + 1}</td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 border-l border-[var(--line)] text-[var(--ink)]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {filteredCsvRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={csvData.headers.length + 1}
                          className="p-6 text-center text-xs text-[var(--muted)]"
                        >
                          No matching data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <pre
                className={`w-full h-full p-4 overflow-auto font-mono text-xs bg-[var(--surface)] text-[var(--ink)] m-0 ${
                  wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'
                }`}
              >
                {item.fileData}
              </pre>
            )
          ) : /* 9. Code & Text Viewer (Python, Java, JS, TS, SQL, etc.) */
          (fileDetails.category === 'code' || fileDetails.category === 'text') && item.fileData ? (
            <div className="w-full h-full flex flex-col bg-[var(--surface)] overflow-hidden">
              <div className="flex-1 overflow-auto flex font-mono text-xs text-[var(--ink)]">
                {/* Line numbers gutter */}
                <div className="select-none py-4 px-2 text-right text-[var(--muted)] bg-[var(--surface2)] border-r border-[var(--line)] opacity-60 text-[11px] leading-relaxed">
                  {textLines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Code body */}
                <pre
                  className={`flex-1 p-4 m-0 overflow-x-auto leading-relaxed bg-[var(--surface)] ${
                    wrapCode ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
                  }`}
                >
                  {item.fileData}
                </pre>
              </div>
              <div className="px-3 py-1.5 bg-[var(--surface2)] border-t border-[var(--line)] text-[11px] text-[var(--muted)] flex items-center justify-between">
                <span>
                  {textLines.length} lines · {fileDetails.language || fileDetails.label}
                </span>
                <button
                  type="button"
                  className="text-[var(--accent)] font-semibold hover:underline"
                  onClick={() => {
                    navigator.clipboard.writeText(item.fileData || '');
                    onToast('Code copied to clipboard!');
                  }}
                >
                  Copy All Code
                </button>
              </div>
            </div>
          ) : /* 10. Office Document or Fallback Card with Desktop View Options */
          (
            <div className="p-8 text-center max-w-lg">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base md:text-lg mb-1">{item.fileName || item.title}</h3>
              <p className="text-xs text-[var(--muted)] mb-4 font-mono">
                {fileDetails.label} · {formatFileSize(item.size || 0)}
              </p>
              <p className="text-xs text-[var(--muted)] mb-6 max-w-sm mx-auto leading-relaxed">
                You can open this document in your desktop browser tab to view it directly with your desktop document handler, or download it.
              </p>

              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                {blobUrl && (
                  <button
                    type="button"
                    className="btn sm primary"
                    onClick={handleOpenDesktopTab}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Desktop Tab
                  </button>
                )}
                <button
                  type="button"
                  className="btn sm"
                  onClick={handleDownload}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

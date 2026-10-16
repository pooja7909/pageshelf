import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Download,
  Copy,
  Check,
  Maximize2,
  FileText,
  Monitor,
  Code,
  BookOpen,
  Table,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { ShelfItem } from '../types';
import { formatFileSize } from '../utils/linkAnalyzer';
import {
  getFileTypeDetails,
  createBlobUrlFromFile,
  resolveItemBlobUrl,
  downloadShelfFile,
  formatMarkdown,
  parseCsv
} from '../utils/fileViewer';

interface StandaloneViewerProps {
  item: ShelfItem;
  onBackToShelf: () => void;
  onToast: (msg: string) => void;
}

export const StandaloneViewer: React.FC<StandaloneViewerProps> = ({
  item,
  onBackToShelf,
  onToast
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'source' | 'table'>('preview');
  const [wrapCode, setWrapCode] = useState(true);
  const [imageZoom, setImageZoom] = useState(1);
  const [csvSearch, setCsvSearch] = useState('');
  const [blobUrl, setBlobUrl] = useState<string | null>(() => createBlobUrlFromFile(item));

  const fileDetails = useMemo(() => getFileTypeDetails(item), [item]);

  useEffect(() => {
    let active = true;
    resolveItemBlobUrl(item).then((url) => {
      if (active && url) setBlobUrl(url);
    });
    return () => {
      active = false;
    };
  }, [item]);

  const textLines = useMemo(() => {
    if (!item.fileData || item.fileData.startsWith('data:')) return [];
    return item.fileData.split(/\r?\n/);
  }, [item.fileData]);

  const csvData = useMemo(() => {
    if (!item.fileData || fileDetails.category !== 'csv') return { headers: [], rows: [] };
    return parseCsv(item.fileData);
  }, [item.fileData, fileDetails.category]);

  const filteredCsvRows = useMemo(() => {
    if (!csvSearch.trim()) return csvData.rows;
    const q = csvSearch.toLowerCase();
    return csvData.rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(q)));
  }, [csvData.rows, csvSearch]);

  const handleCopy = () => {
    const text = item.fileData || item.url || window.location.href;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      onToast('Content copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    onToast(`Downloading ${item.fileName || item.title}…`);
    const ok = await downloadShelfFile(item);
    if (!ok) onToast('Failed to download file');
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePopOut = () => {
    if (blobUrl) {
      const win = window.open(blobUrl, '_blank');
      if (win) {
        win.focus();
        onToast('Opened in separate window');
      } else {
        onToast('Popup blocked by browser');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-[var(--bg)] text-[var(--ink)] overflow-hidden font-sans">
      {/* Top Desktop Navigation & Controls Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-[var(--surface)] border-b border-[var(--line)] shadow-xs flex-wrap gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="btn sm flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[var(--surface2)] hover:border-[var(--accent)]"
            onClick={onBackToShelf}
            title="Return to the course shelf"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Course Shelf</span>
          </button>

          <div className="h-5 w-px bg-[var(--line)] hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="badge-tag bg-blue-500/15 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
              {fileDetails.label}
            </span>
            <h1 className="text-sm sm:text-base font-bold truncate m-0 text-[var(--ink)] max-w-[400px]">
              {item.title}
            </h1>
            <span className="text-xs text-[var(--muted)] font-mono hidden md:inline">
              ({item.fileName || 'file'} · {formatFileSize(item.size || 0)})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sub-modes for Markdown / CSV / Code */}
          {fileDetails.category === 'markdown' && (
            <div className="flex items-center bg-[var(--surface2)] rounded-lg p-0.5 border border-[var(--line)] text-xs">
              <button
                type="button"
                className={`px-2 py-1 rounded font-medium ${
                  viewMode === 'preview' ? 'bg-[var(--surface)] font-bold text-[var(--ink)] shadow-xs' : 'text-[var(--muted)]'
                }`}
                onClick={() => setViewMode('preview')}
              >
                <BookOpen className="w-3.5 h-3.5 inline mr-1" /> Notes
              </button>
              <button
                type="button"
                className={`px-2 py-1 rounded font-medium ${
                  viewMode === 'source' ? 'bg-[var(--surface)] font-bold text-[var(--ink)] shadow-xs' : 'text-[var(--muted)]'
                }`}
                onClick={() => setViewMode('source')}
              >
                <Code className="w-3.5 h-3.5 inline mr-1" /> Source
              </button>
            </div>
          )}

          {fileDetails.category === 'code' && (
            <button
              type="button"
              className="btn sm text-xs"
              onClick={() => setWrapCode(!wrapCode)}
              title="Toggle line wrapping"
            >
              {wrapCode ? 'No Wrap' : 'Wrap Code'}
            </button>
          )}

          {fileDetails.category === 'image' && (
            <div className="flex items-center gap-1 bg-[var(--surface2)] px-2 py-1 rounded-lg border border-[var(--line)]">
              <button
                type="button"
                className="icon p-1"
                onClick={() => setImageZoom((z) => Math.max(0.25, z - 0.25))}
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-bold w-12 text-center">
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                type="button"
                className="icon p-1"
                onClick={() => setImageZoom((z) => Math.min(4, z + 0.25))}
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="icon p-1 ml-1"
                onClick={() => setImageZoom(1)}
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            className="btn sm text-xs flex items-center gap-1"
            onClick={handleCopy}
            title="Copy content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Copy</span>
          </button>

          <button
            type="button"
            className="btn sm text-xs flex items-center gap-1"
            onClick={handlePrint}
            title="Print document"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            type="button"
            className="btn sm primary text-xs flex items-center gap-1"
            onClick={handleDownload}
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {blobUrl && (
            <button
              type="button"
              className="btn sm text-xs flex items-center gap-1"
              onClick={handlePopOut}
              title="Open raw file in another window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Open Raw</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Full-Screen Expansive Content Area */}
      <main className="flex-1 w-full h-[calc(100vh-56px)] overflow-auto bg-[var(--surface)] p-2 sm:p-4">
        {/* PDF Viewer */}
        {fileDetails.category === 'pdf' && blobUrl ? (
          <div className="w-full h-full rounded-xl overflow-hidden border border-[var(--line)] shadow-sm bg-neutral-900">
            <iframe
              src={blobUrl}
              title={item.title}
              className="w-full h-full border-none"
              style={{ minHeight: '85vh' }}
            />
          </div>
        ) : fileDetails.category === 'html' && blobUrl ? (
          /* HTML Interactive Page / Simulation */
          <div className="w-full h-full rounded-xl overflow-hidden border border-[var(--line)] shadow-sm bg-white">
            <iframe
              src={blobUrl}
              title={item.title}
              sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
              className="w-full h-full border-none"
              style={{ minHeight: '85vh' }}
            />
          </div>
        ) : fileDetails.category === 'markdown' && viewMode === 'preview' ? (
          /* Markdown Rich Notes */
          <div className="max-w-4xl mx-auto p-6 bg-[var(--surface2)] rounded-2xl border border-[var(--line)] shadow-xs">
            <div
              className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(item.fileData || '') }}
            />
          </div>
        ) : fileDetails.category === 'code' ||
          fileDetails.category === 'text' ||
          (fileDetails.category === 'markdown' && viewMode === 'source') ? (
          /* Code & Text Viewer with line numbers */
          <div className="w-full h-full flex flex-col bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 shadow-sm">
            <div className="px-4 py-2 bg-neutral-950 text-neutral-400 text-xs font-mono flex items-center justify-between border-b border-neutral-800">
              <span>{item.fileName || 'source.txt'}</span>
              <span>{textLines.length} lines</span>
            </div>
            <div className="flex-1 overflow-auto p-4 text-xs font-mono text-neutral-100 flex">
              <div className="select-none text-neutral-500 pr-4 text-right border-r border-neutral-800 font-mono">
                {textLines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <pre
                className={`pl-4 flex-1 m-0 font-mono text-neutral-100 ${
                  wrapCode ? 'whitespace-pre-wrap' : 'whitespace-pre'
                }`}
              >
                <code>{item.fileData || ''}</code>
              </pre>
            </div>
          </div>
        ) : fileDetails.category === 'image' && blobUrl ? (
          /* Image Viewer with Zoom */
          <div className="w-full h-full flex items-center justify-center overflow-auto p-4 bg-neutral-950/20 rounded-xl border border-[var(--line)]">
            <img
              src={blobUrl}
              alt={item.title}
              style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center center' }}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-lg transition-transform duration-100"
            />
          </div>
        ) : fileDetails.category === 'csv' ? (
          /* CSV Spreadsheet Table */
          <div className="w-full h-full flex flex-col bg-[var(--surface)] rounded-xl border border-[var(--line)] overflow-hidden shadow-xs">
            <div className="p-3 border-b border-[var(--line)] flex items-center justify-between gap-3 bg-[var(--surface2)]">
              <input
                type="text"
                placeholder="Search spreadsheet rows…"
                value={csvSearch}
                onChange={(e) => setCsvSearch(e.target.value)}
                className="inp max-w-sm text-xs"
              />
              <span className="text-xs text-[var(--muted)] font-mono">
                {filteredCsvRows.length} of {csvData.rows.length} rows
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[var(--surface2)] sticky top-0 border-b border-[var(--line)]">
                  <tr>
                    {csvData.headers.map((h, i) => (
                      <th key={i} className="p-2.5 font-bold text-[var(--ink)] border-r border-[var(--line)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCsvRows.map((r, ri) => (
                    <tr key={ri} className="border-b border-[var(--line)] hover:bg-[var(--surface2)]">
                      {r.map((cell, ci) => (
                        <td key={ci} className="p-2 border-r border-[var(--line)] text-[var(--ink)]">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Fallback for other files */
          <div className="max-w-md mx-auto my-20 p-8 text-center bg-[var(--surface2)] rounded-2xl border border-[var(--line)] shadow-sm space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--ink)]">{item.title}</h2>
              <p className="text-xs text-[var(--muted)] font-mono mt-1">
                {item.fileName || 'file'} · {formatFileSize(item.size || 0)}
              </p>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              This file is ready for download and native desktop viewing.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                className="btn primary px-4 py-2 text-sm flex items-center gap-2"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" /> Download File
              </button>
              {blobUrl && (
                <button
                  type="button"
                  className="btn px-4 py-2 text-sm flex items-center gap-2"
                  onClick={handlePopOut}
                >
                  <ExternalLink className="w-4 h-4" /> Open Raw
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

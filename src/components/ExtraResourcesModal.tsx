import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Video,
  Play,
  Plus,
  Eye,
  EyeOff,
  ExternalLink,
  Edit2,
  Trash2,
  Search,
  Sparkles,
  BookOpen,
  Check,
  Copy,
  Clock,
  UploadCloud,
  FileText,
  Download,
  Film
} from 'lucide-react';
import { Category, ShelfItem, ShelfConfig } from '../types';
import { normalizeUrl, analyseUrl, formatFileSize } from '../utils/linkAnalyzer';
import { openItemInSeparateWindow, downloadShelfFile, resolveItemBlobUrl } from '../utils/fileViewer';

interface ExtraResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShelfItem[];
  categories: Category[];
  isTeacher: boolean;
  config: ShelfConfig;
  onAddResource: (item: Partial<ShelfItem>) => Promise<boolean>;
  onUpdateItem: (updated: Partial<ShelfItem>) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onToggleItemVisibility: (item: ShelfItem) => Promise<void>;
  onUpdateConfig: (cfg: Partial<ShelfConfig>) => Promise<void>;
  onEditItemModal: (item: ShelfItem) => void;
  onPreviewItem: (item: ShelfItem) => void;
  onToast: (msg: string) => void;
}

export const ExtraResourcesModal: React.FC<ExtraResourcesModalProps> = ({
  isOpen,
  onClose,
  items,
  categories,
  isTeacher,
  config,
  onAddResource,
  onDeleteItem,
  onToggleItemVisibility,
  onUpdateConfig,
  onEditItemModal,
  onPreviewItem,
  onToast
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'guide' | 'interactive'>('all');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<'link' | 'file'>('file');
  const [playingVideo, setPlayingVideo] = useState<ShelfItem | null>(null);
  const [playingVideoBlobUrl, setPlayingVideoBlobUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Link form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [cat, setCat] = useState('__unsorted');
  const [note, setNote] = useState('');
  const [duration, setDuration] = useState('');
  const [visibleToStudents, setVisibleToStudents] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // File upload state
  const [dragOver, setDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{ name: string; status: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Master visibility switch state
  const isMasterVisible = config.showExtraResourcesToStudents !== false;

  // Filter items: identify items that are kind === 'video' or have video in URL/ext, or tagged as extra
  const extraItems = useMemo(() => {
    return items.filter((item) => {
      const isExplicitExtra =
        item.kind === 'video' ||
        (item.kind as string) === 'guide' ||
        (item.kind as string) === 'extra';
      const analysis = item.url ? analyseUrl(item.url) : null;
      const isVideoOrInteractive =
        analysis?.detectedKind === 'video' ||
        ['mp4', 'webm', 'mov'].includes(item.ext || '') ||
        (item.note &&
          (item.note.toLowerCase().includes('video') ||
            item.note.toLowerCase().includes('tutorial') ||
            item.note.toLowerCase().includes('reference') ||
            item.note.toLowerCase().includes('extra')));

      // Exclude assessment items and timeline items
      if (item.kind === 'assessment' || item.kind === 'timeline') return false;

      return isExplicitExtra || isVideoOrInteractive;
    });
  }, [items]);

  // Apply filters and visibility
  const displayedItems = useMemo(() => {
    let list = extraItems;
    if (!isTeacher) {
      list = list.filter((i) => i.visibleToStudents !== false);
    }
    if (activeFilter === 'video') {
      list = list.filter((i) => {
        const a = i.url ? analyseUrl(i.url) : null;
        return (
          i.kind === 'video' ||
          a?.detectedKind === 'video' ||
          ['mp4', 'webm', 'mov'].includes(i.ext || '')
        );
      });
    } else if (activeFilter === 'guide') {
      list = list.filter(
        (i) =>
          i.ext === 'pdf' ||
          (i.note && i.note.toLowerCase().includes('guide')) ||
          i.kind === 'link'
      );
    }

    if (selectedCat !== 'all') {
      list = list.filter((i) => i.cat === selectedCat);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.note && i.note.toLowerCase().includes(q)) ||
          (i.url && i.url.toLowerCase().includes(q)) ||
          (i.fileName && i.fileName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [extraItems, isTeacher, activeFilter, selectedCat, searchQuery]);

  if (!isOpen) return null;

  const handleToggleMasterVisibility = async () => {
    const nextVal = !isMasterVisible;
    await onUpdateConfig({ showExtraResourcesToStudents: nextVal });
    onToast(
      nextVal
        ? 'Extra Resources hub is now visible to students.'
        : 'Extra Resources hub is now hidden from students (Teacher only).'
    );
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(url);
    if (!normalized) {
      onToast('Please enter a valid URL.');
      return;
    }

    setSubmitting(true);
    const analysis = analyseUrl(normalized);
    const itemTitle = title.trim() || analysis.title || 'Extra Resource';

    const ok = await onAddResource({
      type: 'link',
      kind: 'video',
      url: normalized,
      title: itemTitle,
      cat: cat === '__unsorted' ? '' : cat,
      note: note.trim(),
      videoDuration: duration.trim(),
      embedUrl: analysis.embedUrl,
      visibleToStudents
    });

    setSubmitting(false);
    if (ok) {
      setTitle('');
      setUrl('');
      setNote('');
      setDuration('');
      setShowAddForm(false);
      onToast(`Added "${itemTitle}" to Extra Resources.`);
    }
  };

  // Process file uploads (supports files of any size)
  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    const newQueue = fileList.map((f) => ({ name: f.name, status: 'Uploading…' }));
    setUploadQueue(newQueue);

    let successCount = 0;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = (file.name.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || '';
      const isVideo = ['mp4', 'webm', 'mov', 'm4v', 'mkv'].includes(ext);

      try {
        let fileData = '';
        const isText = ['txt', 'md', 'html', 'js', 'ts', 'py', 'java', 'json', 'csv', 'sql'].includes(ext);

        // For small files, read text or data URL for direct cloud sync
        if (file.size <= 600 * 1024) {
          fileData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            if (isText) {
              reader.readAsText(file);
            } else {
              reader.readAsDataURL(file);
            }
          });
        }

        const cleanTitle =
          title.trim() && fileList.length === 1
            ? title.trim()
            : file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || file.name;

        const ok = await onAddResource({
          type: 'file',
          kind: isVideo ? 'video' : 'file',
          title: cleanTitle,
          fileName: file.name,
          fileData,
          fileBlob: file, // Full file blob in IndexedDB
          isLargeFile: file.size > 600 * 1024,
          ext,
          size: file.size,
          cat: cat === '__unsorted' ? '' : cat,
          note: note.trim() || (isVideo ? 'Video lesson file' : 'Extra learning file'),
          videoDuration: duration.trim() || undefined,
          visibleToStudents
        });

        if (ok) {
          successCount++;
          setUploadQueue((prev) =>
            prev.map((item, idx) => (idx === i ? { ...item, status: 'Added ✓' } : item))
          );
        } else {
          setUploadQueue((prev) =>
            prev.map((item, idx) => (idx === i ? { ...item, status: 'Failed' } : item))
          );
        }
      } catch {
        setUploadQueue((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'Error' } : item))
        );
      }
    }

    if (successCount > 0) {
      onToast(`Added ${successCount} extra file${successCount > 1 ? 's' : ''}.`);
      setTitle('');
      setNote('');
      setDuration('');
      setTimeout(() => {
        setUploadQueue([]);
        setShowAddForm(false);
      }, 1200);
    }
  };

  const handleOpenItem = (item: ShelfItem) => {
    const win = openItemInSeparateWindow(item);
    if (win) {
      onToast(`Opened "${item.title}" in another window`);
    } else {
      onPreviewItem(item);
    }
  };

  const handlePlayVideo = async (item: ShelfItem) => {
    setPlayingVideo(item);
    if (item.type === 'file') {
      const url = await resolveItemBlobUrl(item);
      setPlayingVideoBlobUrl(url);
    } else {
      setPlayingVideoBlobUrl(null);
    }
  };

  const handleCopyLink = (item: ShelfItem) => {
    const textToCopy = item.type === 'link' ? item.url : `${window.location.origin}/#view=${item.id}`;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.id);
      onToast('Link copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card max-w-[940px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg m-0">Extra Resources & Videos</h3>
                <span className="badge-tag">
                  {displayedItems.length} resource{displayedItems.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] m-0">
                Supplementary videos, interactive demos, tutorials, guide files, and extension materials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Teacher Master Visibility Toggle */}
            {isTeacher && (
              <button
                type="button"
                className={`btn sm ${isMasterVisible ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}
                onClick={handleToggleMasterVisibility}
                title="Toggle whether students can see the Extra Resources section"
              >
                {isMasterVisible ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Students: Visible</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                    <span>Students: Hidden</span>
                  </>
                )}
              </button>
            )}

            <button type="button" className="icon" onClick={onClose} aria-label="Close modal">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Preview if active */}
        {playingVideo && (
          <div className="bg-[var(--surface2)] border-b border-[var(--line)] p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="badge-tag bg-emerald-600 text-white text-xs">Now Playing</span>
                <span className="font-bold text-sm truncate">{playingVideo.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => handleOpenItem(playingVideo)}
                  title="Open in separate desktop window"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Pop Out Window
                </button>
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => {
                    setPlayingVideo(null);
                    setPlayingVideoBlobUrl(null);
                  }}
                >
                  Close Player
                </button>
              </div>
            </div>

            <div className="w-full aspect-video max-h-[380px] bg-black rounded-lg overflow-hidden flex items-center justify-center">
              {playingVideo.type === 'file' ? (
                playingVideoBlobUrl ? (
                  <video
                    src={playingVideoBlobUrl}
                    controls
                    autoPlay
                    className="w-full h-full max-h-[380px] object-contain"
                  />
                ) : (
                  <p className="text-white text-xs animate-pulse">Loading video file…</p>
                )
              ) : playingVideo.embedUrl || (playingVideo.url && analyseUrl(playingVideo.url).embedUrl) ? (
                <iframe
                  src={playingVideo.embedUrl || analyseUrl(playingVideo.url || '').embedUrl}
                  title={playingVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : playingVideo.url ? (
                <iframe
                  src={playingVideo.url}
                  title={playingVideo.title}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              ) : (
                <p className="text-white text-xs">No video source found</p>
              )}
            </div>
          </div>
        )}

        {/* Filter Bar & Teacher Add Button */}
        <div className="p-3 bg-[var(--surface)] border-b border-[var(--line)] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              className={`btn sm ${activeFilter === 'all' ? 'primary' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Extra ({extraItems.length})
            </button>
            <button
              type="button"
              className={`btn sm ${activeFilter === 'video' ? 'primary' : ''}`}
              onClick={() => setActiveFilter('video')}
            >
              <Video className="w-3.5 h-3.5" /> Videos
            </button>
            <button
              type="button"
              className={`btn sm ${activeFilter === 'guide' ? 'primary' : ''}`}
              onClick={() => setActiveFilter('guide')}
            >
              <BookOpen className="w-3.5 h-3.5" /> Guides & Files
            </button>

            {categories.length > 0 && (
              <select
                className="inp text-xs py-1 px-2 h-[34px]"
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                aria-label="Filter by Topic"
              >
                <option value="all">All Topics</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                className="inp pl-8 text-xs py-1 h-[34px] w-40 sm:w-56"
                placeholder="Search resources…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isTeacher && (
              <button
                type="button"
                className={`btn sm ${showAddForm ? 'primary' : ''}`}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddForm ? 'Cancel' : 'Add Resource / File'}
              </button>
            )}
          </div>
        </div>

        {/* Teacher Add Extra Resource Form (Links OR File Uploads of Any Size) */}
        {isTeacher && showAddForm && (
          <div className="p-4 bg-[var(--surface2)] border-b border-[var(--line)] grid gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Add Extra Resource
                </span>

                {/* Toggle: Upload File vs Web Link */}
                <div className="flex items-center bg-[var(--surface)] p-0.5 rounded-lg border border-[var(--line)] text-xs">
                  <button
                    type="button"
                    className={`px-2.5 py-1 rounded font-semibold transition-all ${
                      addMode === 'file'
                        ? 'bg-[var(--accent)] text-white shadow-xs'
                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                    onClick={() => setAddMode('file')}
                  >
                    <UploadCloud className="w-3.5 h-3.5 inline mr-1" /> Upload Files
                  </button>
                  <button
                    type="button"
                    className={`px-2.5 py-1 rounded font-semibold transition-all ${
                      addMode === 'link'
                        ? 'bg-[var(--accent)] text-white shadow-xs'
                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                    onClick={() => setAddMode('link')}
                  >
                    <Video className="w-3.5 h-3.5 inline mr-1" /> Web Video / Link
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addExtraVisible"
                  checked={visibleToStudents}
                  onChange={(e) => setVisibleToStudents(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--accent)] cursor-pointer"
                />
                <label
                  htmlFor="addExtraVisible"
                  className="text-xs cursor-pointer select-none font-semibold text-[var(--ink)]"
                >
                  Visible to students
                </label>
              </div>
            </div>

            {addMode === 'file' ? (
              /* File Upload Zone - Supports files of ANY size */
              <div className="grid gap-3">
                <div
                  className={`drop ${dragOver ? 'over' : ''} p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[var(--surface)] ${dragOver ? 'border-[var(--accent)] bg-[var(--surface2)]' : 'border-[var(--line)]'}`}
                  tabIndex={0}
                  role="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    processFiles(e.dataTransfer.files);
                  }}
                >
                  <UploadCloud className="w-8 h-8 text-[var(--accent)] mb-1" />
                  <b className="text-sm">Drop extra files or videos here, or click to browse</b>
                  <small className="text-xs text-[var(--muted)] mt-0.5">
                    No file size limit — MP4/WebM videos, PDF revision guides, Python/Java starter code, worksheets, and presentations.
                  </small>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    multiple
                    onChange={(e) => {
                      processFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="fld">
                    <label>Title (optional)</label>
                    <input
                      className="inp text-sm"
                      placeholder="Uses original filename if blank"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="fld">
                    <label>Category / Topic</label>
                    <select
                      className="inp text-sm"
                      value={cat}
                      onChange={(e) => setCat(e.target.value)}
                    >
                      <option value="__unsorted">General / Unsorted</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="fld">
                    <label>Note / Topic Guidance</label>
                    <input
                      className="inp text-sm"
                      placeholder="e.g. Masterclass video or extra worksheet"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>

                {uploadQueue.length > 0 && (
                  <div className="grid gap-1 mt-1">
                    {uploadQueue.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-[var(--surface)] px-3 py-1.5 rounded-lg text-xs font-mono border border-[var(--line)]"
                      >
                        <span className="truncate max-w-[70%]">{item.name}</span>
                        <span
                          className={
                            item.status.includes('✓')
                              ? 'text-emerald-600 font-semibold'
                              : 'text-[var(--muted)]'
                          }
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Link / Online Video Form */
              <form onSubmit={handleAddSubmit} className="grid gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="fld sm:col-span-2">
                    <label>Video or Resource URL</label>
                    <input
                      className="inp text-sm"
                      placeholder="https://youtube.com/watch?v=... or website link"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div className="fld">
                    <label>Duration / Length (optional)</label>
                    <input
                      className="inp text-sm"
                      placeholder="e.g. 15 mins, 2h masterclass"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>

                  <div className="fld sm:col-span-2">
                    <label>Title</label>
                    <input
                      className="inp text-sm"
                      placeholder="e.g. CPU Pipelining Deep Dive Video"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="fld">
                    <label>Topic / Category</label>
                    <select
                      className="inp text-sm"
                      value={cat}
                      onChange={(e) => setCat(e.target.value)}
                    >
                      <option value="__unsorted">General / Unsorted</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="fld sm:col-span-3">
                    <label>Note / Summary</label>
                    <input
                      className="inp text-sm"
                      placeholder="Brief note or timestamp guide"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>

                <div className="actsrow justify-end mt-1">
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn sm primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Adding…' : 'Add to Extra Resources'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Resources Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedItems.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Video className="w-10 h-10 text-[var(--muted)] mx-auto mb-2 opacity-50" />
              <h4 className="font-bold text-base">No extra resources found</h4>
              <p className="text-xs text-[var(--muted)] max-w-md mx-auto mt-1">
                {searchQuery
                  ? `No extra resources match "${searchQuery}".`
                  : isTeacher
                  ? 'Add your first video, file, tutorial link, or extension guide using the button above!'
                  : 'Your teacher has not published any extra resources for this topic yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedItems.map((item) => {
                const analysis = item.url ? analyseUrl(item.url) : null;
                const isVideo =
                  item.kind === 'video' ||
                  analysis?.detectedKind === 'video' ||
                  ['mp4', 'webm', 'mov'].includes(item.ext || '');
                const isHidden = item.visibleToStudents === false;
                const categoryObj = categories.find((c) => c.id === item.cat);

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all flex flex-col justify-between gap-2.5 ${
                      isHidden ? 'opacity-85 border-dashed border-amber-500/40' : ''
                    }`}
                  >
                    <div>
                      {/* Top tags */}
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                              isVideo
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                : 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                            }`}
                          >
                            {isVideo ? (
                              <span className="flex items-center gap-1">
                                <Film className="w-3 h-3" /> Video
                              </span>
                            ) : item.type === 'file' ? (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" /> {item.ext?.toUpperCase() || 'FILE'}
                              </span>
                            ) : (
                              'Resource'
                            )}
                          </span>

                          {categoryObj && (
                            <span className="text-[11px] text-[var(--muted)] truncate max-w-[180px]">
                              {categoryObj.name}
                            </span>
                          )}

                          {item.type === 'file' && item.size ? (
                            <span className="text-[11px] font-mono text-[var(--muted)]">
                              · {formatFileSize(item.size)}
                            </span>
                          ) : null}

                          {item.videoDuration && (
                            <span className="text-[11px] font-mono text-[var(--muted)] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {item.videoDuration}
                            </span>
                          )}
                        </div>

                        {/* Teacher Hidden Badge */}
                        {isTeacher && isHidden && (
                          <span className="badge-tag hidden-from-students text-[10px] py-0.5 px-1.5 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Teacher Only
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        className="font-bold text-sm text-[var(--ink)] hover:text-[var(--accent)] cursor-pointer line-clamp-2 m-0"
                        onClick={() => {
                          if (isVideo) {
                            handlePlayVideo(item);
                          } else {
                            handleOpenItem(item);
                          }
                        }}
                      >
                        {item.title}
                      </h4>

                      {/* Note */}
                      {item.note && (
                        <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2 m-0">
                          {item.note}
                        </p>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]/50 mt-1 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isVideo ? (
                          <button
                            type="button"
                            className="btn sm primary py-1 px-2.5 text-xs font-semibold flex items-center gap-1"
                            onClick={() => handlePlayVideo(item)}
                          >
                            <Play className="w-3 h-3 fill-current" /> Watch Video
                          </button>
                        ) : null}

                        <button
                          type="button"
                          className="btn sm py-1 px-2.5 text-xs font-semibold flex items-center gap-1"
                          onClick={() => handleOpenItem(item)}
                          title="Open full view in desktop window"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open in Window</span>
                        </button>

                        {/* Direct download for file uploads */}
                        {item.type === 'file' && (
                          <button
                            type="button"
                            className="icon"
                            onClick={async () => {
                              onToast(`Downloading ${item.fileName || item.title}…`);
                              await downloadShelfFile(item);
                            }}
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          className="icon"
                          onClick={() => handleCopyLink(item)}
                          title="Copy Link"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Teacher Controls */}
                      {isTeacher && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="icon"
                            onClick={() => onToggleItemVisibility(item)}
                            title={isHidden ? 'Make visible to students' : 'Hide from students'}
                          >
                            {isHidden ? (
                              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-[var(--muted)]" />
                            )}
                          </button>

                          <button
                            type="button"
                            className="icon"
                            onClick={() => onEditItemModal(item)}
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            className="icon text-[var(--warn)]"
                            onClick={() => onDeleteItem(item.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

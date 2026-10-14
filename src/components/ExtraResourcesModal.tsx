import React, { useState, useMemo } from 'react';
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
  Filter,
  Check,
  Copy,
  Clock
} from 'lucide-react';
import { Category, ShelfItem, ShelfConfig } from '../types';
import { normalizeUrl, analyseUrl } from '../utils/linkAnalyzer';

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
  const [playingVideo, setPlayingVideo] = useState<ShelfItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [cat, setCat] = useState('');
  const [note, setNote] = useState('');
  const [duration, setDuration] = useState('');
  const [visibleToStudents, setVisibleToStudents] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Master visibility switch state
  const isMasterVisible = config.showExtraResourcesToStudents !== false;

  // Filter items: identify items that are kind === 'video' or have video in URL/ext, or kind === 'link' tagged as extra
  const extraItems = useMemo(() => {
    return items.filter((item) => {
      const isExplicitExtra = item.kind === 'video' || (item.kind as string) === 'guide' || (item.kind as string) === 'extra';
      const analysis = item.url ? analyseUrl(item.url) : null;
      const isVideoOrInteractive = analysis?.detectedKind === 'video' ||
        ['mp4', 'webm', 'mov'].includes(item.ext || '') ||
        (item.note && (item.note.toLowerCase().includes('video') || item.note.toLowerCase().includes('tutorial') || item.note.toLowerCase().includes('reference')));
      
      // If it's an assessment or pure timeline, exclude from extra resources
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
        return i.kind === 'video' || a?.detectedKind === 'video' || ['mp4', 'webm'].includes(i.ext || '');
      });
    } else if (activeFilter === 'guide') {
      list = list.filter((i) => i.ext === 'pdf' || (i.note && i.note.toLowerCase().includes('guide')) || i.kind === 'link');
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
          (i.url && i.url.toLowerCase().includes(q))
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
        ? 'Extra Resources button is now visible to students.'
        : 'Extra Resources button is now hidden from students (Teacher only).'
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

  const handleCopyLink = (item: ShelfItem) => {
    if (item.url) {
      navigator.clipboard.writeText(item.url);
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
                Supplementary videos, interactive demos, tutorials, and extension materials.
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
                title="Toggle whether students can see the Extra Resources button"
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
              <button
                type="button"
                className="btn sm"
                onClick={() => setPlayingVideo(null)}
              >
                Close Video Player
              </button>
            </div>

            <div className="w-full aspect-video max-h-[380px] bg-black rounded-lg overflow-hidden flex items-center justify-center">
              {playingVideo.embedUrl || (playingVideo.url && analyseUrl(playingVideo.url).embedUrl) ? (
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
              <BookOpen className="w-3.5 h-3.5" /> Guides & Notes
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
                {showAddForm ? 'Cancel' : 'Add Video / Extra'}
              </button>
            )}
          </div>
        </div>

        {/* Teacher Add Extra Resource Form */}
        {isTeacher && showAddForm && (
          <form onSubmit={handleAddSubmit} className="p-4 bg-[var(--surface2)] border-b border-[var(--line)] grid gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Add Extra Resource or Video
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addExtraVisible"
                  checked={visibleToStudents}
                  onChange={(e) => setVisibleToStudents(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--accent)] cursor-pointer"
                />
                <label htmlFor="addExtraVisible" className="text-xs cursor-pointer select-none font-semibold text-[var(--ink)]">
                  Visible to students
                </label>
              </div>
            </div>

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
                <label>Syllabus Topic / Category</label>
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
                <label>Note / Why watch / Instructions</label>
                <input
                  className="inp text-sm"
                  placeholder="Key concepts explained: Fetch-decode-execute cycle and ALU architecture"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="actsrow justify-end">
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
                  ? 'Add your first video, tutorial link, or extension reading using the button above!'
                  : 'Your teacher has not published any extra resources for this topic yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedItems.map((item) => {
                const analysis = item.url ? analyseUrl(item.url) : null;
                const isVideo = item.kind === 'video' || analysis?.detectedKind === 'video' || ['mp4', 'webm'].includes(item.ext || '');
                const isHidden = item.visibleToStudents === false;
                const categoryObj = categories.find((c) => c.id === item.cat);

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all flex flex-col justify-between gap-2.5 ${isHidden ? 'opacity-85 border-dashed border-amber-500/40' : ''}`}
                  >
                    <div>
                      {/* Top tags */}
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${isVideo ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-[var(--surface2)] text-[var(--muted)]'}`}>
                            {isVideo ? '🎥 Video' : (item.ext?.toUpperCase() || 'Resource')}
                          </span>

                          {categoryObj && (
                            <span className="text-[11px] text-[var(--muted)] truncate max-w-[180px]">
                              {categoryObj.name}
                            </span>
                          )}

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
                            setPlayingVideo(item);
                          } else {
                            onPreviewItem(item);
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
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]/50 mt-1">
                      <div className="flex items-center gap-1.5">
                        {isVideo ? (
                          <button
                            type="button"
                            className="btn sm primary py-1 px-2.5 text-xs font-semibold"
                            onClick={() => setPlayingVideo(item)}
                          >
                            <Play className="w-3 h-3 fill-current" /> Watch Video
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn sm py-1 px-2.5 text-xs font-semibold"
                            onClick={() => onPreviewItem(item)}
                          >
                            Open Resource
                          </button>
                        )}

                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon"
                            title="Open in new window"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
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

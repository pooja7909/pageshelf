import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Link as LinkIcon, FileText, Plus } from 'lucide-react';
import { Category, ShelfItem } from '../types';
import { normalizeUrl, analyseUrl, formatFileSize } from '../utils/linkAnalyzer';

interface AddResourceFormProps {
  categories: Category[];
  activeCategory: string;
  onAddLink: (item: Partial<ShelfItem>) => Promise<boolean>;
  onOpenNewCategory: (parent?: string) => void;
  isTeacher: boolean;
  onToast: (msg: string) => void;
}

export const AddResourceForm: React.FC<AddResourceFormProps> = ({
  categories,
  activeCategory,
  onAddLink,
  onOpenNewCategory,
  isTeacher,
  onToast
}) => {
  const [mode, setMode] = useState<'link' | 'file'>('link');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('');
  const [note, setNote] = useState('');
  const [visibleToStudents, setVisibleToStudents] = useState(true);
  const [kind, setKind] = useState<string>('link');
  const [titleTouched, setTitleTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // File upload state
  const [dragOver, setDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{ name: string; status: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync category with active tab or first available
  useEffect(() => {
    if (activeCategory && activeCategory !== 'all' && activeCategory !== '__unsorted') {
      setCat(activeCategory);
    } else if (categories.length > 0 && !cat) {
      setCat(categories[0].id);
    }
  }, [activeCategory, categories]);

  // Hierarchical categories for selector
  const getIndentedCategories = (parentId = '', depth = 0): { cat: Category; depth: number }[] => {
    const list = categories.filter((c) => (c.parent || '') === parentId);
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    return list.flatMap((c) => [{ cat: c, depth }, ...getIndentedCategories(c.id, depth + 1)]);
  };

  const indentedList = getIndentedCategories('');

  const handleUrlChange = (val: string) => {
    setUrl(val);
    const normalized = normalizeUrl(val);
    if (normalized) {
      const analysis = analyseUrl(normalized);
      if (!titleTouched && analysis.title) {
        setTitle(analysis.title);
      }
      if (analysis.detectedKind && analysis.detectedKind !== 'link') {
        setKind(analysis.detectedKind);
      }
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const normalized = normalizeUrl(url);
    if (!normalized) {
      setMsg({
        text: 'Please enter a valid web URL (e.g. https://username.github.io/app/ or file link).',
        isError: true
      });
      return;
    }

    const analysis = analyseUrl(normalized);
    const finalTitle = title.trim() || analysis.title || 'Web Resource';
    setSubmitting(true);

    const success = await onAddLink({
      type: 'link',
      kind: (kind as any) || analysis.detectedKind || 'link',
      url: normalized,
      title: finalTitle,
      cat: cat === '__unsorted' ? '' : cat,
      note: note.trim(),
      embedUrl: analysis.embedUrl,
      visibleToStudents
    });

    setSubmitting(false);
    if (success) {
      setUrl('');
      setTitle('');
      setNote('');
      setKind('link');
      setTitleTouched(false);
      setMsg({
        text: `Added "${finalTitle}" to shelf.`,
        isError: false
      });
    }
  };

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    const newQueue = fileList.map((f) => ({ name: f.name, status: 'Uploading…' }));
    setUploadQueue(newQueue);

    let successCount = 0;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = (file.name.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || '';

      try {
        let fileData = '';
        const isText = ['txt', 'md', 'html', 'js', 'ts', 'py', 'java', 'json', 'csv', 'sql'].includes(ext);

        // For files <= 600KB, read content directly for instant cloud sync
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

        const ok = await onAddLink({
          type: 'file',
          title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || file.name,
          fileName: file.name,
          fileData,
          fileBlob: file, // Full file blob for high-capacity IndexedDB storage
          isLargeFile: file.size > 600 * 1024,
          ext,
          size: file.size,
          cat: cat === '__unsorted' ? '' : cat,
          note: note.trim(),
          visibleToStudents
        });

        if (ok) {
          successCount++;
          setUploadQueue((prev) =>
            prev.map((item, idx) => (idx === i ? { ...item, status: 'Added ✓' } : item))
          );
        } else {
          setUploadQueue((prev) =>
            prev.map((item, idx) => (idx === i ? { ...item, status: 'Failed to save' } : item))
          );
        }
      } catch {
        setUploadQueue((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'Read error' } : item))
        );
      }
    }

    if (successCount > 0) {
      onToast(`Uploaded ${successCount} file${successCount > 1 ? 's' : ''} to shelf.`);
      setNote('');
    }
  };

  return (
    <div className="add">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="modes" role="tablist" aria-label="What to add">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'link'}
            onClick={() => {
              setMode('link');
              setMsg(null);
            }}
          >
            <LinkIcon className="w-3.5 h-3.5 inline mr-1" />
            Paste a link
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'file'}
            onClick={() => {
              setMode('file');
              setMsg(null);
            }}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1" />
            Upload file
          </button>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="studentVisibleForm"
              checked={visibleToStudents}
              onChange={(e) => setVisibleToStudents(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--accent)] cursor-pointer"
            />
            <label htmlFor="studentVisibleForm" className="text-xs cursor-pointer select-none font-semibold text-[var(--muted)]">
              Visible to students
            </label>
          </div>
        )}
      </div>

      {mode === 'link' ? (
        <form onSubmit={handleLinkSubmit} className="grid gap-2.5">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1.3fr_1.2fr_auto] gap-2 items-end">
            <div className="fld">
              <label htmlFor="linkUrl">Link to page, web app, or file</label>
              <input
                id="linkUrl"
                className="inp url"
                placeholder="https://yourname.github.io/my-app/ or any web link"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                required
              />
            </div>

            <div className="fld">
              <label htmlFor="linkTitle">Name / Title</label>
              <input
                id="linkTitle"
                className="inp"
                placeholder="Auto-detected from URL"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleTouched(true);
                }}
              />
            </div>

            <div className="fld">
              <label htmlFor="linkCategory">Category</label>
              <div className="flex gap-1">
                <select
                  id="linkCategory"
                  className="inp"
                  value={cat}
                  onChange={(e) => {
                    if (e.target.value === '__new') {
                      onOpenNewCategory();
                    } else {
                      setCat(e.target.value);
                    }
                  }}
                >
                  {indentedList.map(({ cat: c, depth }) => (
                    <option key={c.id} value={c.id}>
                      {'\u00A0\u00A0\u00A0'.repeat(depth)}{c.name}
                    </option>
                  ))}
                  <option value="__unsorted">Unsorted</option>
                  <option value="__new">+ New category…</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn primary h-[42px]" disabled={submitting}>
              <Plus className="w-4 h-4" />
              {submitting ? 'Adding…' : 'Add to shelf'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-center">
            <input
              className="inp text-sm"
              placeholder="Note (optional), e.g. 'Interactive simulation for Topic 1.1' or 'Year 12 revision task'"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </form>
      ) : (
        <div className="grid gap-3">
          <div
            className={`drop ${dragOver ? 'over' : ''}`}
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
            <UploadCloud />
            <b>Drop files here, or click to choose</b>
            <small>
              Files of any size supported (no limits) — HTML web pages, code files, Markdown notes, PDFs, images, datasets, and videos.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
            <div className="fld">
              <label htmlFor="fileCategory">Category for uploaded files</label>
              <select
                id="fileCategory"
                className="inp"
                value={cat}
                onChange={(e) => {
                  if (e.target.value === '__new') {
                    onOpenNewCategory();
                  } else {
                    setCat(e.target.value);
                  }
                }}
              >
                {indentedList.map(({ cat: c, depth }) => (
                  <option key={c.id} value={c.id}>
                    {'\u00A0\u00A0\u00A0'.repeat(depth)}{c.name}
                  </option>
                ))}
                <option value="__unsorted">Unsorted</option>
                <option value="__new">+ New category…</option>
              </select>
            </div>

            <div className="fld">
              <label htmlFor="fileNote">Note (optional)</label>
              <input
                id="fileNote"
                className="inp text-sm"
                placeholder="e.g. Starter code or assignment rubric"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {uploadQueue.length > 0 && (
            <div className="grid gap-1 mt-1">
              {uploadQueue.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[var(--surface2)] px-3 py-1.5 rounded-lg text-xs font-mono">
                  <span className="truncate max-w-[70%]">{item.name}</span>
                  <span className={item.status.includes('✓') ? 'text-[var(--accent)] font-semibold' : 'text-[var(--muted)]'}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {msg && (
        <div className={`text-xs font-medium mt-1 ${msg.isError ? 'text-[var(--warn)]' : 'text-[var(--accent)]'}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
};

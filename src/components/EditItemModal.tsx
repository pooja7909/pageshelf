import React, { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';
import { Category, ShelfItem } from '../types';
import { normalizeUrl } from '../utils/linkAnalyzer';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShelfItem | null;
  categories: Category[];
  onSave: (updated: Partial<ShelfItem>) => Promise<void>;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  item,
  categories,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [cat, setCat] = useState('');
  const [note, setNote] = useState('');
  const [kind, setKind] = useState<string>('link');
  const [assessmentType, setAssessmentType] = useState<string>('quiz');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState<string>('');
  const [visibleToStudents, setVisibleToStudents] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setUrl(item.url || '');
      setCat(item.cat || '__unsorted');
      setNote(item.note || '');
      setKind(item.kind || 'link');
      setAssessmentType(item.assessmentType || 'quiz');
      setDueDate(item.dueDate || '');
      setMaxMarks(item.maxMarks !== undefined ? String(item.maxMarks) : '');
      setVisibleToStudents(item.visibleToStudents ?? true);
      setError('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const getIndentedCategories = (parentId = '', depth = 0): { cat: Category; depth: number }[] => {
    const list = categories.filter((c) => (c.parent || '') === parentId);
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    return list.flatMap((c) => [{ cat: c, depth }, ...getIndentedCategories(c.id, depth + 1)]);
  };

  const indentedList = getIndentedCategories('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    if (item.type === 'link') {
      const normalized = normalizeUrl(url);
      if (!normalized) {
        setError('Please enter a valid URL.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        url: item.type === 'link' ? normalizeUrl(url) || url : undefined,
        cat: cat === '__unsorted' ? '' : cat,
        note: note.trim(),
        kind: (kind as any) || 'link',
        assessmentType: kind === 'assessment' ? (assessmentType as any) : undefined,
        dueDate: dueDate.trim() || undefined,
        maxMarks: maxMarks ? Number(maxMarks) : undefined,
        visibleToStudents
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card max-w-[620px]" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-[var(--accent)]" />
            <h3>Edit Resource</h3>
          </div>
          <button type="button" className="icon" onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="fld">
            <label htmlFor="editItemTitle">Title</label>
            <input
              id="editItemTitle"
              className="inp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="fld">
              <label htmlFor="editItemKind">Resource Type</label>
              <select
                id="editItemKind"
                className="inp"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                <option value="link">Standard Web Link / App</option>
                <option value="video">Extra Resource / Video</option>
                <option value="assessment">Assessment / Quiz / Exam</option>
                <option value="file">File Resource</option>
              </select>
            </div>

            <div className="fld">
              <label htmlFor="editItemCat">Category / Topic</label>
              <select
                id="editItemCat"
                className="inp"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                <option value="__unsorted">Unsorted</option>
                {indentedList.map(({ cat: c, depth }) => (
                  <option key={c.id} value={c.id}>
                    {'\u00A0\u00A0\u00A0'.repeat(depth)}{c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {kind === 'assessment' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[var(--surface2)] p-2.5 rounded-lg border border-[var(--line)]">
              <div className="fld">
                <label>Assessment Type</label>
                <select
                  className="inp text-xs"
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value)}
                >
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam / Past Paper</option>
                  <option value="test">Unit Test</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                </select>
              </div>

              <div className="fld">
                <label>Due Date</label>
                <input
                  className="inp text-xs"
                  placeholder="e.g. 2026-11-20"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="fld">
                <label>Max Marks</label>
                <input
                  type="number"
                  className="inp text-xs"
                  placeholder="30"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                />
              </div>
            </div>
          )}

          {item.type === 'link' && (
            <div className="fld">
              <label htmlFor="editItemUrl">URL / Link</label>
              <input
                id="editItemUrl"
                className="inp url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
          )}

          <div className="fld">
            <label htmlFor="editItemNote">Note / Instructions</label>
            <input
              id="editItemNote"
              className="inp"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Chapter 4 exercise or video guide"
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="editItemVisible"
              checked={visibleToStudents}
              onChange={(e) => setVisibleToStudents(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--accent)] cursor-pointer"
            />
            <label htmlFor="editItemVisible" className="text-sm cursor-pointer select-none font-medium">
              Visible to students (uncheck to hide from student view)
            </label>
          </div>

          {error && <div className="text-sm text-[var(--warn)] font-medium">{error}</div>}

          <div className="actsrow justify-end mt-2">
            <button type="button" className="btn sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn sm primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

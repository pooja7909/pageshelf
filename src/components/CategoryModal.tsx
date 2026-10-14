import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Edit3 } from 'lucide-react';
import { Category } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: Partial<Category>) => Promise<void>;
  categories: Category[];
  initialParent?: string;
  categoryToEdit?: Category | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialParent = '',
  categoryToEdit = null
}) => {
  const [name, setName] = useState('');
  const [parent, setParent] = useState('');
  const [visibleToStudents, setVisibleToStudents] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setParent(categoryToEdit.parent || '');
      setVisibleToStudents(categoryToEdit.visibleToStudents ?? true);
    } else {
      setName('');
      setParent(initialParent);
      setVisibleToStudents(true);
    }
    setError('');
  }, [categoryToEdit, initialParent, isOpen]);

  if (!isOpen) return null;

  // Flatten categories into indented hierarchy for parent select
  const getIndentedCategories = (parentId = '', depth = 0): { cat: Category; depth: number }[] => {
    const list = categories.filter((c) => (c.parent || '') === parentId);
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    return list.flatMap((c) => [{ cat: c, depth }, ...getIndentedCategories(c.id, depth + 1)]);
  };

  const indentedList = getIndentedCategories('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a category name.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit({
        name: name.trim(),
        parent,
        visibleToStudents
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            {categoryToEdit ? (
              <Edit3 className="w-5 h-5 text-[var(--accent)]" />
            ) : (
              <FolderPlus className="w-5 h-5 text-[var(--accent)]" />
            )}
            <h3>{categoryToEdit ? 'Rename / Edit Category' : 'Create New Category or Tab'}</h3>
          </div>
          <button type="button" className="icon" onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="fld">
            <label htmlFor="catNameInp">Category Name</label>
            <input
              id="catNameInp"
              className="inp"
              placeholder="e.g. Year 10 Projects, A1.5 Mini-apps, or Machine Learning Demos"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              autoFocus
              required
            />
          </div>

          <div className="fld">
            <label htmlFor="catParentInp">Placement / Level</label>
            <select
              id="catParentInp"
              className="inp"
              value={parent}
              onChange={(e) => setParent(e.target.value)}
            >
              <option value="">Top level (Appears as a primary Tab)</option>
              {indentedList
                .filter(({ cat }) => !categoryToEdit || cat.id !== categoryToEdit.id)
                .map(({ cat, depth }) => (
                  <option key={cat.id} value={cat.id}>
                    {'\u00A0\u00A0\u00A0'.repeat(depth)}Inside {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="catVisible"
              checked={visibleToStudents}
              onChange={(e) => setVisibleToStudents(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--accent)] cursor-pointer"
            />
            <label htmlFor="catVisible" className="text-sm cursor-pointer select-none font-medium">
              Visible to students (uncheck to keep category teacher-only)
            </label>
          </div>

          {error && <div className="text-sm text-[var(--warn)] font-medium">{error}</div>}

          <div className="actsrow justify-end mt-2">
            <button type="button" className="btn sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn sm primary" disabled={loading}>
              {loading ? 'Saving…' : categoryToEdit ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

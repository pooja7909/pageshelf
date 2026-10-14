import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, FolderOutput } from 'lucide-react';
import { Category } from '../types';

interface BulkMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceCategory: Category | null;
  categories: Category[];
  itemsCount: number;
  onBulkMove: (sourceCatId: string, targetCatId: string) => Promise<void>;
}

export const BulkMoveModal: React.FC<BulkMoveModalProps> = ({
  isOpen,
  onClose,
  sourceCategory,
  categories,
  itemsCount,
  onBulkMove
}) => {
  const [targetCategory, setTargetCategory] = useState<string>('__unsorted');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTargetCategory('__unsorted');
    setError('');
  }, [isOpen, sourceCategory]);

  if (!isOpen || !sourceCategory) return null;

  // Flatten categories into indented hierarchy
  const getIndentedCategories = (parentId = '', depth = 0): { cat: Category; depth: number }[] => {
    const list = categories.filter((c) => (c.parent || '') === parentId);
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    return list.flatMap((c) => [{ cat: c, depth }, ...getIndentedCategories(c.id, depth + 1)]);
  };

  const indentedList = getIndentedCategories('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsCount === 0) {
      setError('There are no items in this category to move.');
      return;
    }

    if (targetCategory === sourceCategory.id) {
      setError('Target category must be different from the source category.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onBulkMove(sourceCategory.id, targetCategory);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move items');
    } finally {
      setLoading(false);
    }
  };

  const isUnsorted = targetCategory === '__unsorted';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[var(--accent)]" />
            <h3>Bulk Move Resources</h3>
          </div>
          <button type="button" className="icon" onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm bg-[var(--surface2)] p-3 rounded-xl flex items-start gap-2.5">
          <FolderOutput className="w-4 h-4 text-[var(--muted)] mt-0.5 flex-shrink-0" />
          <div>
            Moving <strong className="text-[var(--ink)]">{itemsCount}</strong> item{itemsCount === 1 ? '' : 's'} from{' '}
            <strong className="text-[var(--ink)]">"{sourceCategory.name}"</strong>
          </div>
        </div>

        {itemsCount === 0 ? (
          <div className="text-xs text-[var(--muted)] p-2">
            This category is currently empty. Add or upload links into it first before moving.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="fld">
              <label htmlFor="targetCatSelect">Move all items to</label>
              <select
                id="targetCatSelect"
                className="inp"
                value={targetCategory}
                onChange={(e) => {
                  setTargetCategory(e.target.value);
                  setError('');
                }}
                autoFocus
              >
                <option value="__unsorted">📦 Unsorted (Move all to Unsorted)</option>
                <optgroup label="Syllabus & Custom Categories">
                  {indentedList
                    .filter(({ cat }) => cat.id !== sourceCategory.id)
                    .map(({ cat, depth }) => (
                      <option key={cat.id} value={cat.id}>
                        {'\u00A0\u00A0\u00A0'.repeat(depth)}{cat.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <p className="text-xs text-[var(--muted)] m-0">
              {isUnsorted
                ? 'All resources in this topic will be detached and placed in Unsorted.'
                : 'All resources will be transferred directly under the chosen destination category.'}
            </p>

            {error && <div className="text-sm text-[var(--warn)] font-medium">{error}</div>}

            <div className="actsrow justify-end mt-2">
              <button type="button" className="btn sm" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn sm primary" disabled={loading || itemsCount === 0}>
                {loading ? 'Moving…' : `Move ${itemsCount} Item${itemsCount === 1 ? '' : 's'}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

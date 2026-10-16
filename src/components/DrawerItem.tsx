import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  FolderPlus,
  Link as LinkIcon,
  Upload,
  Maximize2,
  Check,
  ArrowRightLeft,
  Download,
  Monitor
} from 'lucide-react';
import { Category, ShelfItem } from '../types';
import { analyseUrl, formatFileSize } from '../utils/linkAnalyzer';
import { openItemInSeparateWindow, openFileInDesktopTab, downloadShelfFile } from '../utils/fileViewer';

interface DrawerItemProps {
  category: Category;
  depth?: number;
  allCategories: Category[];
  items: ShelfItem[];
  isTeacher: boolean;
  searchQuery: string;
  onPreview: (item: ShelfItem) => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (catId: string) => void;
  onToggleCategoryVisibility: (cat: Category) => void;
  onEditItem: (item: ShelfItem) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleItemVisibility: (item: ShelfItem) => void;
  onAddLinkHere: (catId: string) => void;
  onAddSubcategory: (parentCatId: string) => void;
  onOpenBulkMove?: (category: Category, itemsCount: number) => void;
  onToast: (msg: string) => void;
}

export const DrawerItem: React.FC<DrawerItemProps> = ({
  category,
  depth = 0,
  allCategories,
  items,
  isTeacher,
  searchQuery,
  onPreview,
  onEditCategory,
  onDeleteCategory,
  onToggleCategoryVisibility,
  onEditItem,
  onDeleteItem,
  onToggleItemVisibility,
  onAddLinkHere,
  onAddSubcategory,
  onOpenBulkMove,
  onToast
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(false);

  // Subcategories
  const childCategories = allCategories
    .filter((c) => c.parent === category.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));

  // Current category items
  const catItems = items.filter((item) => (item.cat || '__unsorted') === category.id);

  // Descendant item count
  const getAllDescendantItemCount = (catId: string): number => {
    const direct = items.filter((i) => (i.cat || '__unsorted') === catId).length;
    const kids = allCategories.filter((c) => c.parent === catId);
    return direct + kids.reduce((sum, k) => sum + getAllDescendantItemCount(k.id), 0);
  };

  const totalItemCount = getAllDescendantItemCount(category.id);

  // If search query is active and there are 0 matching items in this subtree, don't show
  if (searchQuery && totalItemCount === 0) {
    return null;
  }

  // Handle link copy
  const handleCopyLink = (item: ShelfItem) => {
    const text = item.type === 'link' ? item.url : window.location.href;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      onToast('Link copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const isCategoryHidden = category.visibleToStudents === false;

  return (
    <details
      className={`drawer d${Math.min(depth, 3)} ${isCategoryHidden ? 'opacity-90' : ''}`}
      open={searchQuery ? true : depth === 0}
    >
      <summary className="group">
        <svg
          className="chev"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>

        <span className="dname flex items-center gap-2">
          {category.name}
          {isTeacher && isCategoryHidden && (
            <span className="badge-tag hidden-from-students flex items-center gap-1" title="Hidden from students">
              <EyeOff className="w-3 h-3" /> Teacher Only
            </span>
          )}
        </span>

        <span className="dcount">{totalItemCount}</span>

        {isTeacher && category.id !== '__unsorted' && (
          <span className="dtools" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="icon"
              onClick={() => onToggleCategoryVisibility(category)}
              title={isCategoryHidden ? 'Make visible to students' : 'Hide from students'}
            >
              {isCategoryHidden ? (
                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-[var(--muted)]" />
              )}
            </button>
            {onOpenBulkMove && (
              <button
                type="button"
                className="icon"
                onClick={() => onOpenBulkMove(category, catItems.length)}
                title="Move all items from this category"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--muted)]" />
              </button>
            )}
            <button
              type="button"
              className="icon"
              onClick={() => onEditCategory(category)}
              title="Rename category"
            >
              <Edit2 className="w-3.5 h-3.5 text-[var(--muted)]" />
            </button>
            <button
              type="button"
              className="icon text-[var(--warn)]"
              onClick={() => setConfirmDeleteCat(true)}
              title="Delete category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
      </summary>

      <div className="rows">
        {/* Category delete confirmation */}
        {confirmDeleteCat && (
          <div className="confirm">
            <div className="text-sm">
              Delete category <b>"{category.name}"</b>? Any links inside will move to Unsorted.
            </div>
            <div className="actsrow">
              <button
                type="button"
                className="btn sm danger fill"
                onClick={() => {
                  onDeleteCategory(category.id);
                  setConfirmDeleteCat(false);
                }}
              >
                Delete Category
              </button>
              <button
                type="button"
                className="btn sm"
                onClick={() => setConfirmDeleteCat(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Teacher Action bar inside drawer */}
        {isTeacher && category.id !== '__unsorted' && !searchQuery && (
          <div className="addhere">
            <button
              type="button"
              className="btn sm"
              onClick={() => onAddLinkHere(category.id)}
            >
              <LinkIcon className="w-3 h-3 text-[var(--accent)]" /> Add link here
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={() => onAddLinkHere(category.id)}
            >
              <Upload className="w-3 h-3 text-[var(--accent)]" /> Upload files
            </button>
            <button
              type="button"
              className="btn sm ghost"
              onClick={() => onAddSubcategory(category.id)}
            >
              <FolderPlus className="w-3 h-3" /> + Subcategory
            </button>
            {onOpenBulkMove && (
              <button
                type="button"
                className="btn sm"
                onClick={() => onOpenBulkMove(category, catItems.length)}
                title="Move all links from this topic to another category or to unsorted"
              >
                <ArrowRightLeft className="w-3 h-3 text-[var(--accent)]" /> Move all ({catItems.length})
              </button>
            )}
          </div>
        )}

        {/* Action bar for unsorted category in teacher mode */}
        {isTeacher && category.id === '__unsorted' && !searchQuery && catItems.length > 0 && onOpenBulkMove && (
          <div className="addhere">
            <button
              type="button"
              className="btn sm"
              onClick={() => onOpenBulkMove(category, catItems.length)}
              title="Move all unsorted links into a specific syllabus category"
            >
              <ArrowRightLeft className="w-3 h-3 text-[var(--accent)]" /> Move all ({catItems.length}) to category…
            </button>
          </div>
        )}

        {/* Category items */}
        {catItems.map((item) => {
          const isItemHidden = item.visibleToStudents === false;
          const analysis = item.type === 'link' && item.url ? analyseUrl(item.url) : null;
          let displayKind = item.type === 'file' ? (item.ext?.toUpperCase() || 'FILE') : (analysis?.kind || 'LINK');
          if (item.kind === 'video') displayKind = 'VIDEO';
          if (item.kind === 'assessment') displayKind = item.assessmentType ? item.assessmentType.toUpperCase() : 'ASSESSMENT';
          if (item.kind === 'timeline') displayKind = 'TIMELINE';

          if (confirmDeleteId === item.id) {
            return (
              <div key={item.id} className="confirm">
                <div className="text-sm">
                  Remove <b>"{item.title}"</b> from shelf?
                </div>
                <div className="actsrow">
                  <button
                    type="button"
                    className="btn sm danger fill"
                    onClick={() => {
                      onDeleteItem(item.id);
                      setConfirmDeleteId(null);
                    }}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={item.id} className="rowlink">
              <span className={`kind ${item.type === 'file' ? 'file' : ''}`}>
                {displayKind}
              </span>

              <div className="lmain">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    className="ltitle"
                    onClick={() => {
                      const win = openItemInSeparateWindow(item);
                      if (win) {
                        onToast(`Opened "${item.title}" in another window`);
                      } else {
                        onPreview(item);
                        onToast(`Opened in full view (allow popups to auto-open in new window)`);
                      }
                    }}
                    title="Click to open full view in another window"
                  >
                    {item.title}
                  </button>
                  {isTeacher && isItemHidden && (
                    <span className="badge-tag hidden-from-students" title="Students cannot see this link">
                      Teacher Only
                    </span>
                  )}
                </div>

                <span className="lurl">
                  {item.type === 'link' ? (
                    item.url?.replace(/^https?:\/\//, '')
                  ) : (
                    `${item.fileName || 'file'} · ${formatFileSize(item.size || 0)}`
                  )}
                </span>

                {item.note && <span className="lnote">{item.note}</span>}
              </div>

              <div className="lacts">
                {/* External open for links */}
                {item.type === 'link' && item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="icon"
                    title="Open web app in new window/tab"
                    aria-label={`Open ${item.title}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {/* View file directly on desktop in a new browser window */}
                {item.type === 'file' && (
                  <button
                    type="button"
                    className="icon text-blue-600 dark:text-blue-400"
                    onClick={() => {
                      const win = openItemInSeparateWindow(item);
                      if (win) {
                        onToast(`Opened "${item.fileName || item.title}" in another window`);
                      } else {
                        onPreview(item);
                        onToast(`Opened in full view (allow popups to auto-open in new window)`);
                      }
                    }}
                    title="Open in another window"
                    aria-label={`View ${item.title} in another window`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                {/* Full View / Read in shelf */}
                <button
                  type="button"
                  className="icon"
                  onClick={() => onPreview(item)}
                  title="Open full view modal"
                  aria-label={`Full view of ${item.title}`}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Direct download for files */}
                {item.type === 'file' && (
                  <button
                    type="button"
                    className="icon"
                    onClick={async () => {
                      onToast(`Downloading ${item.fileName || item.title}…`);
                      await downloadShelfFile(item);
                    }}
                    title="Download file to computer"
                    aria-label={`Download ${item.title}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                {/* Copy link */}
                <button
                  type="button"
                  className="icon"
                  onClick={() => handleCopyLink(item)}
                  title="Copy link"
                  aria-label={`Copy link for ${item.title}`}
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {/* Teacher visibility toggle */}
                {isTeacher && (
                  <button
                    type="button"
                    className="icon"
                    onClick={() => onToggleItemVisibility(item)}
                    title={isItemHidden ? 'Make visible to students' : 'Hide from students'}
                  >
                    {isItemHidden ? (
                      <EyeOff className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-[var(--muted)]" />
                    )}
                  </button>
                )}

                {/* Teacher edit */}
                {isTeacher && (
                  <button
                    type="button"
                    className="icon"
                    onClick={() => onEditItem(item)}
                    title="Edit resource"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}

                {/* Teacher delete */}
                {isTeacher && (
                  <button
                    type="button"
                    className="icon text-[var(--warn)]"
                    onClick={() => setConfirmDeleteId(item.id)}
                    title="Delete resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Subcategories */}
        {childCategories.map((child) => (
          <DrawerItem
            key={child.id}
            category={child}
            depth={depth + 1}
            allCategories={allCategories}
            items={items}
            isTeacher={isTeacher}
            searchQuery={searchQuery}
            onPreview={onPreview}
            onEditCategory={onEditCategory}
            onDeleteCategory={onDeleteCategory}
            onToggleCategoryVisibility={onToggleCategoryVisibility}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            onToggleItemVisibility={onToggleItemVisibility}
            onAddLinkHere={onAddLinkHere}
            onAddSubcategory={onAddSubcategory}
            onOpenBulkMove={onOpenBulkMove}
            onToast={onToast}
          />
        ))}

        {catItems.length === 0 && childCategories.length === 0 && (
          <div className="empty-drawer">
            {searchQuery ? 'Nothing here matches your search.' : 'Nothing added here yet.'}
          </div>
        )}
      </div>
    </details>
  );
};

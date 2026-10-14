import React from 'react';
import {
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Video,
  FileCheck2,
  Calendar,
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';
import { Category, ShelfItem, ShelfConfig } from '../types';

interface VisibilityManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ShelfConfig;
  categories: Category[];
  items: ShelfItem[];
  onUpdateConfig: (cfg: Partial<ShelfConfig>) => Promise<void>;
  onToggleCategoryVisibility: (cat: Category) => Promise<void>;
  onBulkUpdateItemsVisibility: (visible: boolean) => Promise<void>;
  onToast: (msg: string) => void;
}

export const VisibilityManagerModal: React.FC<VisibilityManagerModalProps> = ({
  isOpen,
  onClose,
  config,
  categories,
  items,
  onUpdateConfig,
  onToggleCategoryVisibility,
  onBulkUpdateItemsVisibility,
  onToast
}) => {
  if (!isOpen) return null;

  const extraResourcesVisible = config.showExtraResourcesToStudents !== false;
  const assessmentsVisible = config.showAssessmentsToStudents !== false;
  const timelineVisible = config.showTimelineToStudents !== false;

  const hiddenItemsCount = items.filter((i) => i.visibleToStudents === false).length;
  const hiddenCatsCount = categories.filter((c) => c.visibleToStudents === false).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card max-w-[650px] max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg m-0">Student Visibility Control Center</h3>
              <p className="text-xs text-[var(--muted)] m-0">
                You have full authority over which apps, buttons, categories, and resources students can see.
              </p>
            </div>
          </div>
          <button type="button" className="icon" onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Stat Pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface2)] border border-[var(--line)]">
            <div className="text-xs">
              <span className="font-bold text-[var(--ink)]">Current Hidden State:</span>{' '}
              <span className="text-[var(--muted)]">
                {hiddenItemsCount} resource{hiddenItemsCount === 1 ? '' : 's'} and {hiddenCatsCount} categor{hiddenCatsCount === 1 ? 'y' : 'ies'} are currently marked <strong>Teacher Only</strong>.
              </span>
            </div>
            <span className="badge-tag hidden-from-students text-xs">Teacher Only</span>
          </div>

          {/* Section 1: Main Feature Buttons Visibility */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] m-0">
              Feature Buttons (Student Access)
            </h4>

            {/* Extra Resources */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-sm m-0">Extra Resources & Videos Button</h5>
                  <p className="text-xs text-[var(--muted)] m-0">
                    Show or hide the dedicated Extra Resources button in student view
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={`btn sm ${extraResourcesVisible ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}
                onClick={async () => {
                  const nextVal = !extraResourcesVisible;
                  await onUpdateConfig({ showExtraResourcesToStudents: nextVal });
                  onToast(nextVal ? 'Extra Resources is visible to students' : 'Extra Resources is hidden from students');
                }}
              >
                {extraResourcesVisible ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-600" /> Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-amber-600" /> Hidden
                  </>
                )}
              </button>
            </div>

            {/* Assessments */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-blue-500/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-sm m-0">Assessments & Quizzes Button</h5>
                  <p className="text-xs text-[var(--muted)] m-0">
                    Show or hide assessments, tests, and mock papers from students
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={`btn sm ${assessmentsVisible ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}
                onClick={async () => {
                  const nextVal = !assessmentsVisible;
                  await onUpdateConfig({ showAssessmentsToStudents: nextVal });
                  onToast(nextVal ? 'Assessments visible to students' : 'Assessments hidden from students');
                }}
              >
                {assessmentsVisible ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-600" /> Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-amber-600" /> Hidden
                  </>
                )}
              </button>
            </div>

            {/* Timeline App */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-amber-500/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-sm m-0">Timeline App Button</h5>
                  <p className="text-xs text-[var(--muted)] m-0">
                    Show or hide your connected timeline app & course milestones
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={`btn sm ${timelineVisible ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}
                onClick={async () => {
                  const nextVal = !timelineVisible;
                  await onUpdateConfig({ showTimelineToStudents: nextVal });
                  onToast(nextVal ? 'Timeline App visible to students' : 'Timeline App hidden from students');
                }}
              >
                {timelineVisible ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-600" /> Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-amber-600" /> Hidden
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Top-Level Topic Categories Visibility */}
          <div className="space-y-2 pt-2 border-t border-[var(--line)]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] m-0">
                Top-Level Topic Tabs ({categories.filter((c) => !c.parent).length})
              </h4>
              <span className="text-[11px] text-[var(--muted)]">
                Click eye to toggle student access
              </span>
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {categories
                .filter((c) => !c.parent)
                .map((cat) => {
                  const isHidden = cat.visibleToStudents === false;
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface2)] text-xs"
                    >
                      <span className="font-semibold truncate max-w-[320px]">{cat.name}</span>
                      <button
                        type="button"
                        className={`btn sm py-0.5 px-2 text-xs ${isHidden ? 'border-amber-500/50 text-amber-600' : 'text-emerald-600'}`}
                        onClick={() => onToggleCategoryVisibility(cat)}
                      >
                        {isHidden ? (
                          <>
                            <EyeOff className="w-3 h-3 text-amber-600" /> Hidden from Students
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" /> Visible
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-[var(--muted)]">
              Quick bulk action for all {items.length} items on your shelf:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn sm"
                onClick={() => onBulkUpdateItemsVisibility(true)}
              >
                <Eye className="w-3.5 h-3.5" /> Make All Links Visible
              </button>
              <button
                type="button"
                className="btn sm"
                onClick={() => onBulkUpdateItemsVisibility(false)}
              >
                <EyeOff className="w-3.5 h-3.5" /> Hide All Links
              </button>
            </div>
          </div>
        </div>

        <div className="modal-header border-t border-[var(--line)] pt-3 justify-end">
          <button type="button" className="btn sm primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

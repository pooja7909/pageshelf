import React, { useState, useMemo } from 'react';
import {
  X,
  FileCheck2,
  Plus,
  Eye,
  EyeOff,
  ExternalLink,
  Edit2,
  Trash2,
  Search,
  Calendar,
  Award,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Category, ShelfItem, ShelfConfig, AssessmentType } from '../types';
import { normalizeUrl } from '../utils/linkAnalyzer';

interface AssessmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShelfItem[];
  categories: Category[];
  isTeacher: boolean;
  config: ShelfConfig;
  onAddAssessment: (item: Partial<ShelfItem>) => Promise<boolean>;
  onUpdateItem: (updated: Partial<ShelfItem>) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onToggleItemVisibility: (item: ShelfItem) => Promise<void>;
  onUpdateConfig: (cfg: Partial<ShelfConfig>) => Promise<void>;
  onEditItemModal: (item: ShelfItem) => void;
  onPreviewItem: (item: ShelfItem) => void;
  onToast: (msg: string) => void;
}

export const AssessmentsModal: React.FC<AssessmentsModalProps> = ({
  isOpen,
  onClose,
  items,
  categories,
  isTeacher,
  config,
  onAddAssessment,
  onDeleteItem,
  onToggleItemVisibility,
  onUpdateConfig,
  onEditItemModal,
  onPreviewItem,
  onToast
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'quiz' | 'exam' | 'assignment'>('all');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form fields
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('quiz');
  const [cat, setCat] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState<string>('20');
  const [note, setNote] = useState('');
  const [visibleToStudents, setVisibleToStudents] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isMasterVisible = config.showAssessmentsToStudents !== false;

  // Filter assessment items
  const assessmentItems = useMemo(() => {
    return items.filter((item) => {
      if (item.kind === 'assessment') return true;
      if (item.assessmentType) return true;
      // Also catch items with quiz or test in title or URL
      const lowerTitle = item.title.toLowerCase();
      const lowerNote = (item.note || '').toLowerCase();
      const lowerUrl = (item.url || '').toLowerCase();
      return (
        lowerTitle.includes('quiz') ||
        lowerTitle.includes('exam') ||
        lowerTitle.includes('test') ||
        lowerTitle.includes('assessment') ||
        lowerTitle.includes('past paper') ||
        lowerNote.includes('assessment') ||
        lowerUrl.includes('forms.google.com') ||
        lowerUrl.includes('/forms/') ||
        lowerUrl.includes('quizizz')
      );
    });
  }, [items]);

  const displayedAssessments = useMemo(() => {
    let list = assessmentItems;
    if (!isTeacher) {
      list = list.filter((i) => i.visibleToStudents !== false);
    }

    if (activeFilter !== 'all') {
      if (activeFilter === 'quiz') {
        list = list.filter((i) => i.assessmentType === 'quiz' || i.title.toLowerCase().includes('quiz') || (i.url && i.url.includes('forms')));
      } else if (activeFilter === 'exam') {
        list = list.filter((i) => i.assessmentType === 'exam' || i.assessmentType === 'past_paper' || i.assessmentType === 'test' || i.title.toLowerCase().includes('paper') || i.title.toLowerCase().includes('exam'));
      } else if (activeFilter === 'assignment') {
        list = list.filter((i) => i.assessmentType === 'assignment' || i.assessmentType === 'project' || i.title.toLowerCase().includes('project'));
      }
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
  }, [assessmentItems, isTeacher, activeFilter, selectedCat, searchQuery]);

  if (!isOpen) return null;

  const handleToggleMasterVisibility = async () => {
    const nextVal = !isMasterVisible;
    await onUpdateConfig({ showAssessmentsToStudents: nextVal });
    onToast(
      nextVal
        ? 'Assessments hub is now visible to students.'
        : 'Assessments hub is now hidden from students (Teacher only).'
    );
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onToast('Please enter an assessment title.');
      return;
    }

    setSubmitting(true);
    const normalized = url.trim() ? normalizeUrl(url) || url.trim() : '';

    const ok = await onAddAssessment({
      type: 'link',
      kind: 'assessment',
      title: title.trim(),
      url: normalized,
      assessmentType,
      cat: cat === '__unsorted' ? '' : cat,
      dueDate: dueDate.trim() || undefined,
      maxMarks: maxMarks ? Number(maxMarks) : undefined,
      note: note.trim(),
      visibleToStudents
    });

    setSubmitting(false);
    if (ok) {
      setTitle('');
      setUrl('');
      setDueDate('');
      setNote('');
      setShowAddForm(false);
      onToast(`Added assessment "${title}".`);
    }
  };

  const getAssessmentTypeBadge = (item: ShelfItem) => {
    const t = item.assessmentType || (item.title.toLowerCase().includes('quiz') ? 'quiz' : 'test');
    switch (t) {
      case 'quiz':
        return <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300">Quiz</span>;
      case 'exam':
      case 'past_paper':
        return <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300">Exam / Paper</span>;
      case 'assignment':
        return <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300">Assignment</span>;
      case 'project':
        return <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300">Project</span>;
      default:
        return <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-[var(--surface2)] text-[var(--muted)]">Assessment</span>;
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
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg m-0">Assessments & Quizzes</h3>
                <span className="badge-tag">
                  {displayedAssessments.length} task{displayedAssessments.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] m-0">
                Formative quizzes, past exam papers, revision tasks, and assignment rubrics.
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
                title="Toggle whether students can see the Assessments button"
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

        {/* Filter Bar & Teacher Add Button */}
        <div className="p-3 bg-[var(--surface)] border-b border-[var(--line)] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              className={`btn sm ${activeFilter === 'all' ? 'primary' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({assessmentItems.length})
            </button>
            <button
              type="button"
              className={`btn sm ${activeFilter === 'quiz' ? 'primary' : ''}`}
              onClick={() => setActiveFilter('quiz')}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Quizzes
            </button>
            <button
              type="button"
              className={`btn sm ${activeFilter === 'exam' ? 'primary' : ''}`}
              onClick={() => setActiveFilter('exam')}
            >
              <ClipboardList className="w-3.5 h-3.5" /> Past Papers / Exams
            </button>
            <button
              type="button"
              className={`btn sm ${activeFilter === 'assignment' ? 'primary' : ''}`}
              onClick={() => setActiveFilter('assignment')}
            >
              <AlertCircle className="w-3.5 h-3.5" /> Assignments
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
                placeholder="Search assessments…"
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
                {showAddForm ? 'Cancel' : 'Add Assessment'}
              </button>
            )}
          </div>
        </div>

        {/* Teacher Add Assessment Form */}
        {isTeacher && showAddForm && (
          <form onSubmit={handleAddSubmit} className="p-4 bg-[var(--surface2)] border-b border-[var(--line)] grid gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Create New Assessment
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addAssessmentVisible"
                  checked={visibleToStudents}
                  onChange={(e) => setVisibleToStudents(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--accent)] cursor-pointer"
                />
                <label htmlFor="addAssessmentVisible" className="text-xs cursor-pointer select-none font-semibold text-[var(--ink)]">
                  Visible to students (uncheck to keep confidential until exam day)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div className="fld sm:col-span-2">
                <label>Assessment Title</label>
                <input
                  className="inp text-sm"
                  placeholder="e.g. Unit 1.1 CPU Architecture Diagnostic Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="fld">
                <label>Type</label>
                <select
                  className="inp text-sm"
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                >
                  <option value="quiz">Formative Quiz (Google Form / Quizizz)</option>
                  <option value="exam">Official Past Paper / Mock Exam</option>
                  <option value="test">Unit Test / Written Check</option>
                  <option value="assignment">Coursework Assignment / Lab</option>
                  <option value="project">Course Project / Internal Assessment</option>
                </select>
              </div>

              <div className="fld sm:col-span-2">
                <label>Link to Quiz or Submission Task (Google Form, GitHub, or Web page)</label>
                <input
                  className="inp text-sm"
                  placeholder="https://forms.google.com/... or task URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="fld">
                <label>Due Date / Target Date (optional)</label>
                <input
                  className="inp text-sm"
                  placeholder="e.g. 2026-11-20 or Friday Lesson"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="fld">
                <label>Max Marks / Points</label>
                <input
                  type="number"
                  className="inp text-sm"
                  placeholder="25"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                />
              </div>

              <div className="fld sm:col-span-2">
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
                <label>Instructions / Guidance</label>
                <input
                  className="inp text-sm"
                  placeholder="Complete before next Monday. Calculators not permitted for section A."
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
                {submitting ? 'Creating…' : 'Publish Assessment'}
              </button>
            </div>
          </form>
        )}

        {/* Assessments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedAssessments.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FileCheck2 className="w-10 h-10 text-[var(--muted)] mx-auto mb-2 opacity-50" />
              <h4 className="font-bold text-base">No assessments listed</h4>
              <p className="text-xs text-[var(--muted)] max-w-md mx-auto mt-1">
                {searchQuery
                  ? `No assessment matches "${searchQuery}".`
                  : isTeacher
                  ? 'Add your first quiz, past paper, or coursework milestone using the button above!'
                  : 'No active assessments or tests published right now.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedAssessments.map((item) => {
                const isHidden = item.visibleToStudents === false;
                const categoryObj = categories.find((c) => c.id === item.cat);

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-blue-500/50 transition-all flex flex-col justify-between gap-2.5 ${isHidden ? 'opacity-85 border-dashed border-amber-500/40' : ''}`}
                  >
                    <div>
                      {/* Top tags */}
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getAssessmentTypeBadge(item)}

                          {categoryObj && (
                            <span className="text-[11px] text-[var(--muted)] truncate max-w-[170px]">
                              {categoryObj.name}
                            </span>
                          )}

                          {item.maxMarks !== undefined && (
                            <span className="text-[11px] font-mono text-[var(--muted)] flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-500" /> {item.maxMarks} pts
                            </span>
                          )}

                          {item.dueDate && (
                            <span className="text-[11px] font-mono text-[var(--muted)] flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-blue-500" /> {item.dueDate}
                            </span>
                          )}
                        </div>

                        {/* Teacher Hidden Badge */}
                        {isTeacher && isHidden && (
                          <span className="badge-tag hidden-from-students text-[10px] py-0.5 px-1.5 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Hidden from Students
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        className="font-bold text-sm text-[var(--ink)] hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-2 m-0"
                        onClick={() => onPreviewItem(item)}
                      >
                        {item.title}
                      </h4>

                      {/* Instructions */}
                      {item.note && (
                        <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2 m-0">
                          {item.note}
                        </p>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]/50 mt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="btn sm primary py-1 px-2.5 text-xs font-semibold"
                          onClick={() => onPreviewItem(item)}
                        >
                          Open Task
                        </button>

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

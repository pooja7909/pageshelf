import React, { useState, useMemo, useRef } from 'react';
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
  AlertCircle,
  UploadCloud,
  FileText,
  Download,
  CheckSquare,
  Lock,
  Unlock,
  Paperclip
} from 'lucide-react';
import { Category, ShelfItem, ShelfConfig, AssessmentType } from '../types';
import { normalizeUrl, formatFileSize } from '../utils/linkAnalyzer';
import {
  openItemInSeparateWindow,
  downloadShelfFile,
  openMarkSchemeInSeparateWindow,
  downloadMarkSchemeFile
} from '../utils/fileViewer';

interface AssessmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShelfItem[];
  categories: Category[];
  isTeacher: boolean;
  config: ShelfConfig;
  onAddAssessment: (item: Partial<ShelfItem>) => Promise<boolean>;
  onUpdateItem: (updated: Partial<ShelfItem>, itemIdOverride?: string) => Promise<void>;
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
  onUpdateItem,
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
  const [addMode, setAddMode] = useState<'file' | 'link'>('file');

  // Main assessment fields
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('exam');
  const [cat, setCat] = useState('__unsorted');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState<string>('50');
  const [note, setNote] = useState('');
  const [visibleToStudents, setVisibleToStudents] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // File upload state for assessment file
  const [assessmentFile, setAssessmentFile] = useState<File | null>(null);
  const [dragOverMain, setDragOverMain] = useState(false);
  const mainFileInputRef = useRef<HTMLInputElement | null>(null);

  // Mark scheme state
  const [hasMarkScheme, setHasMarkScheme] = useState(true);
  const [markSchemeMode, setMarkSchemeMode] = useState<'file' | 'link'>('file');
  const [markSchemeTitle, setMarkSchemeTitle] = useState('');
  const [markSchemeUrl, setMarkSchemeUrl] = useState('');
  const [markSchemeFile, setMarkSchemeFile] = useState<File | null>(null);
  const [markSchemeVisibleToStudents, setMarkSchemeVisibleToStudents] = useState(false);
  const [dragOverMs, setDragOverMs] = useState(false);
  const msFileInputRef = useRef<HTMLInputElement | null>(null);

  // Quick attach mark scheme modal for existing item
  const [attachingToItem, setAttachingToItem] = useState<ShelfItem | null>(null);
  const [quickMsFile, setQuickMsFile] = useState<File | null>(null);
  const [quickMsUrl, setQuickMsUrl] = useState('');
  const [quickMsVisible, setQuickMsVisible] = useState(false);

  const isMasterVisible = config.showAssessmentsToStudents !== false;

  // Filter assessment items
  const assessmentItems = useMemo(() => {
    return items.filter((item) => {
      if (item.kind === 'assessment') return true;
      if (item.assessmentType) return true;
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
        list = list.filter(
          (i) =>
            i.assessmentType === 'quiz' ||
            i.title.toLowerCase().includes('quiz') ||
            (i.url && i.url.includes('forms'))
        );
      } else if (activeFilter === 'exam') {
        list = list.filter(
          (i) =>
            i.assessmentType === 'exam' ||
            i.assessmentType === 'past_paper' ||
            i.assessmentType === 'test' ||
            i.title.toLowerCase().includes('paper') ||
            i.title.toLowerCase().includes('exam')
        );
      } else if (activeFilter === 'assignment') {
        list = list.filter(
          (i) =>
            i.assessmentType === 'assignment' ||
            i.assessmentType === 'project' ||
            i.title.toLowerCase().includes('project')
        );
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
          (i.url && i.url.toLowerCase().includes(q)) ||
          (i.fileName && i.fileName.toLowerCase().includes(q)) ||
          (i.markSchemeFileName && i.markSchemeFileName.toLowerCase().includes(q))
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

    if (addMode === 'link' && !title.trim()) {
      onToast('Please enter an assessment title.');
      return;
    }

    if (addMode === 'file' && !assessmentFile && !title.trim()) {
      onToast('Please choose an assessment file or enter a title.');
      return;
    }

    setSubmitting(true);
    try {
      let finalTitle = title.trim();
      let mainFileName = '';
      let mainExt = '';
      let mainSize = 0;
      let mainFileData = '';
      let fileBlob: File | undefined = undefined;

      if (addMode === 'file' && assessmentFile) {
        fileBlob = assessmentFile;
        mainFileName = assessmentFile.name;
        mainExt = (assessmentFile.name.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || '';
        mainSize = assessmentFile.size;
        if (!finalTitle) {
          finalTitle = assessmentFile.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
        }

        if (assessmentFile.size <= 600 * 1024) {
          const isText = ['txt', 'md', 'html', 'js', 'ts', 'py', 'java', 'json', 'csv', 'sql'].includes(mainExt);
          mainFileData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            if (isText) reader.readAsText(assessmentFile);
            else reader.readAsDataURL(assessmentFile);
          });
        }
      }

      const normalized = url.trim() ? normalizeUrl(url) || url.trim() : '';

      // Mark scheme processing
      let msFileName = '';
      let msExt = '';
      let msSize = 0;
      let msFileData = '';
      let msFileBlob: File | undefined = undefined;
      const msNormUrl = markSchemeUrl.trim() ? normalizeUrl(markSchemeUrl) || markSchemeUrl.trim() : '';

      if (hasMarkScheme && markSchemeMode === 'file' && markSchemeFile) {
        msFileBlob = markSchemeFile;
        msFileName = markSchemeFile.name;
        msExt = (markSchemeFile.name.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || '';
        msSize = markSchemeFile.size;

        if (markSchemeFile.size <= 600 * 1024) {
          const isText = ['txt', 'md', 'html', 'js', 'ts', 'py', 'java', 'json', 'csv', 'sql'].includes(msExt);
          msFileData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            if (isText) reader.readAsText(markSchemeFile);
            else reader.readAsDataURL(markSchemeFile);
          });
        }
      }

      const ok = await onAddAssessment({
        type: addMode === 'file' ? 'file' : 'link',
        kind: 'assessment',
        title: finalTitle || 'Assessment Task',
        url: normalized,
        assessmentType,
        cat: cat === '__unsorted' ? '' : cat,
        dueDate: dueDate.trim() || undefined,
        maxMarks: maxMarks ? Number(maxMarks) : undefined,
        note: note.trim(),
        visibleToStudents,
        fileName: mainFileName || undefined,
        ext: mainExt || undefined,
        size: mainSize || undefined,
        fileData: mainFileData || undefined,
        fileBlob,
        isLargeFile: mainSize > 600 * 1024,
        // Attached mark scheme
        markSchemeTitle: hasMarkScheme
          ? markSchemeTitle.trim() || `${finalTitle} - Mark Scheme`
          : undefined,
        markSchemeUrl: hasMarkScheme && markSchemeMode === 'link' ? msNormUrl : undefined,
        markSchemeFileName: hasMarkScheme && markSchemeMode === 'file' ? msFileName : undefined,
        markSchemeFileData: hasMarkScheme && markSchemeMode === 'file' ? msFileData : undefined,
        markSchemeExt: hasMarkScheme && markSchemeMode === 'file' ? msExt : undefined,
        markSchemeSize: hasMarkScheme && markSchemeMode === 'file' ? msSize : undefined,
        markSchemeVisibleToStudents: hasMarkScheme ? markSchemeVisibleToStudents : false,
        markSchemeFileBlob: msFileBlob,
        markSchemeIsLargeFile: msSize > 600 * 1024
      });

      setSubmitting(false);
      if (ok) {
        setTitle('');
        setUrl('');
        setAssessmentFile(null);
        setMarkSchemeFile(null);
        setMarkSchemeUrl('');
        setDueDate('');
        setNote('');
        setShowAddForm(false);
        onToast(`Published assessment "${finalTitle}".`);
      }
    } catch {
      setSubmitting(false);
      onToast('Error preparing assessment files.');
    }
  };

  const handleOpenAssessment = (item: ShelfItem) => {
    const win = openItemInSeparateWindow(item);
    if (win) {
      onToast(`Opened "${item.title}" in another window`);
    } else {
      onPreviewItem(item);
    }
  };

  const handleOpenMarkScheme = (item: ShelfItem) => {
    const win = openMarkSchemeInSeparateWindow(item);
    if (win) {
      onToast(`Opened mark scheme for "${item.title}"`);
    } else {
      onToast('Unable to open mark scheme (allow popups?)');
    }
  };

  const handleToggleMarkSchemeVisibility = async (item: ShelfItem) => {
    const nextVal = item.markSchemeVisibleToStudents === false;
    await onUpdateItem(
      {
        id: item.id,
        markSchemeVisibleToStudents: nextVal
      },
      item.id
    );
    onToast(
      nextVal
        ? `Mark Scheme for "${item.title}" is now visible to students.`
        : `Mark Scheme for "${item.title}" is now hidden from students.`
    );
  };

  const handleQuickAttachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachingToItem) return;

    try {
      let msFileName = '';
      let msExt = '';
      let msSize = 0;
      let msFileData = '';
      let msBlob: File | undefined = undefined;

      if (quickMsFile) {
        msBlob = quickMsFile;
        msFileName = quickMsFile.name;
        msExt = (quickMsFile.name.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || '';
        msSize = quickMsFile.size;
        if (quickMsFile.size <= 600 * 1024) {
          const isText = ['txt', 'md', 'html', 'js', 'ts', 'py', 'java', 'json', 'csv', 'sql'].includes(msExt);
          msFileData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            if (isText) reader.readAsText(quickMsFile);
            else reader.readAsDataURL(quickMsFile);
          });
        }
      }

      await onUpdateItem(
        {
          id: attachingToItem.id,
          markSchemeTitle: `${attachingToItem.title} - Mark Scheme`,
          markSchemeUrl: quickMsUrl.trim() ? normalizeUrl(quickMsUrl) || quickMsUrl.trim() : undefined,
          markSchemeFileName: msFileName || undefined,
          markSchemeFileData: msFileData || undefined,
          markSchemeExt: msExt || undefined,
          markSchemeSize: msSize || undefined,
          markSchemeVisibleToStudents: quickMsVisible,
          markSchemeFileBlob: msBlob,
          markSchemeIsLargeFile: msSize > 600 * 1024
        },
        attachingToItem.id
      );

      onToast(`Attached mark scheme to "${attachingToItem.title}".`);
      setAttachingToItem(null);
      setQuickMsFile(null);
      setQuickMsUrl('');
    } catch {
      onToast('Failed to attach mark scheme.');
    }
  };

  const getAssessmentTypeBadge = (item: ShelfItem) => {
    const t = item.assessmentType || (item.title.toLowerCase().includes('quiz') ? 'quiz' : 'test');
    switch (t) {
      case 'quiz':
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300">
            Quiz
          </span>
        );
      case 'exam':
      case 'past_paper':
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300">
            Exam / Past Paper
          </span>
        );
      case 'assignment':
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300">
            Assignment
          </span>
        );
      case 'project':
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300">
            Project
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-[var(--surface2)] text-[var(--muted)]">
            Assessment
          </span>
        );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card max-w-[960px] max-h-[92vh] flex flex-col overflow-hidden"
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
                <h3 className="font-bold text-lg m-0">Assessments & Mark Schemes</h3>
                <span className="badge-tag">
                  {displayedAssessments.length} assessment{displayedAssessments.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] m-0">
                Official past papers, formative quizzes, worksheets, and attached grading mark schemes.
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
                title="Toggle whether students can see the Assessments section"
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
              className={`btn sm ${activeFilter === 'exam' ? 'primary' : ''}`}
              onClick={() => setActiveFilter('exam')}
            >
              <ClipboardList className="w-3.5 h-3.5" /> Past Papers & Exams
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
                placeholder="Search assessments & papers…"
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
                {showAddForm ? 'Cancel' : 'Add Assessment / Paper'}
              </button>
            )}
          </div>
        </div>

        {/* Teacher Add Assessment Form (Supports File Uploads & Mark Scheme Attachment) */}
        {isTeacher && showAddForm && (
          <form
            onSubmit={handleAddSubmit}
            className="p-4 bg-[var(--surface2)] border-b border-[var(--line)] grid gap-4 max-h-[60vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Create Assessment with Mark Scheme
                </span>

                {/* Mode Selector */}
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
                    <UploadCloud className="w-3.5 h-3.5 inline mr-1" /> Upload Exam Paper / File
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
                    <ExternalLink className="w-3.5 h-3.5 inline mr-1" /> Online Form / Link
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addAssessmentVisible"
                  checked={visibleToStudents}
                  onChange={(e) => setVisibleToStudents(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--accent)] cursor-pointer"
                />
                <label
                  htmlFor="addAssessmentVisible"
                  className="text-xs cursor-pointer select-none font-semibold text-[var(--ink)]"
                >
                  Visible to students
                </label>
              </div>
            </div>

            {/* Assessment File Dropzone */}
            {addMode === 'file' && (
              <div
                className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[var(--surface)] ${
                  dragOverMain ? 'border-[var(--accent)] bg-[var(--surface2)]' : 'border-[var(--line)]'
                }`}
                tabIndex={0}
                role="button"
                onClick={() => mainFileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverMain(true);
                }}
                onDragLeave={() => setDragOverMain(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverMain(false);
                  if (e.dataTransfer.files?.[0]) {
                    setAssessmentFile(e.dataTransfer.files[0]);
                    if (!title) {
                      setTitle(e.dataTransfer.files[0].name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
                    }
                  }
                }}
              >
                <UploadCloud className="w-7 h-7 text-[var(--accent)] mb-1" />
                <b className="text-xs sm:text-sm">
                  {assessmentFile ? (
                    <span className="text-emerald-600 font-bold">
                      Selected: {assessmentFile.name} ({formatFileSize(assessmentFile.size)})
                    </span>
                  ) : (
                    'Drop assessment paper (PDF, Word, Code) here, or click to choose'
                  )}
                </b>
                <small className="text-[11px] text-[var(--muted)] mt-0.5">
                  Files of any size supported — past examination papers, diagnostics, project tasks.
                </small>
                <input
                  type="file"
                  ref={mainFileInputRef}
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setAssessmentFile(e.target.files[0]);
                      if (!title) {
                        setTitle(e.target.files[0].name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
                      }
                    }
                  }}
                />
              </div>
            )}

            {/* Assessment Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div className="fld sm:col-span-2">
                <label>Assessment Title</label>
                <input
                  className="inp text-sm"
                  placeholder="e.g. Paper 1 Systems Architecture Mock Exam"
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
                  <option value="exam">Official Past Paper / Mock Exam</option>
                  <option value="test">Unit Test / Written Check</option>
                  <option value="quiz">Formative Quiz (Google Form / Quizizz)</option>
                  <option value="assignment">Coursework Assignment / Lab</option>
                  <option value="project">Course Project / Internal Assessment</option>
                </select>
              </div>

              {addMode === 'link' && (
                <div className="fld sm:col-span-2">
                  <label>Quiz / Submission URL</label>
                  <input
                    className="inp text-sm"
                    placeholder="https://forms.google.com/... or test link"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
              )}

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
                  placeholder="50"
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
                  placeholder="Calculators not permitted for section A. Complete in 60 minutes."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {/* Attached Mark Scheme Section */}
            <div className="p-3.5 bg-[var(--surface)] border border-[var(--line)] rounded-xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasMarkSchemeToggle"
                    checked={hasMarkScheme}
                    onChange={(e) => setHasMarkScheme(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                  />
                  <label
                    htmlFor="hasMarkSchemeToggle"
                    className="text-xs sm:text-sm font-bold cursor-pointer select-none text-[var(--ink)] flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    Attach Mark Scheme / Answer Guide
                  </label>
                </div>

                {hasMarkScheme && (
                  <div className="flex items-center gap-2 bg-[var(--surface2)] px-2.5 py-1 rounded-lg border border-[var(--line)]">
                    <input
                      type="checkbox"
                      id="releaseMsCheckbox"
                      checked={markSchemeVisibleToStudents}
                      onChange={(e) => setMarkSchemeVisibleToStudents(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-600 cursor-pointer"
                    />
                    <label
                      htmlFor="releaseMsCheckbox"
                      className="text-xs cursor-pointer select-none font-semibold text-[var(--ink)] flex items-center gap-1"
                    >
                      {markSchemeVisibleToStudents ? (
                        <>
                          <Unlock className="w-3 h-3 text-emerald-600" /> Released to Students
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-amber-600" /> Keep Hidden for Teacher
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {hasMarkScheme && (
                <div className="grid gap-2.5 pt-1">
                  {/* Mark scheme mode toggle */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--muted)]">Mark Scheme Source:</span>
                    <button
                      type="button"
                      className={`px-2.5 py-1 rounded font-semibold text-xs border ${
                        markSchemeMode === 'file'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-[var(--surface2)] border-[var(--line)] text-[var(--muted)]'
                      }`}
                      onClick={() => setMarkSchemeMode('file')}
                    >
                      Upload Mark Scheme File (PDF/Doc)
                    </button>
                    <button
                      type="button"
                      className={`px-2.5 py-1 rounded font-semibold text-xs border ${
                        markSchemeMode === 'link'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-[var(--surface2)] border-[var(--line)] text-[var(--muted)]'
                      }`}
                      onClick={() => setMarkSchemeMode('link')}
                    >
                      Mark Scheme Web Link
                    </button>
                  </div>

                  {markSchemeMode === 'file' ? (
                    <div
                      className={`p-3 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[var(--surface2)] ${
                        dragOverMs ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--line)]'
                      }`}
                      tabIndex={0}
                      role="button"
                      onClick={() => msFileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverMs(true);
                      }}
                      onDragLeave={() => setDragOverMs(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverMs(false);
                        if (e.dataTransfer.files?.[0]) {
                          setMarkSchemeFile(e.dataTransfer.files[0]);
                        }
                      }}
                    >
                      <Paperclip className="w-5 h-5 text-emerald-600 mb-1" />
                      <span className="text-xs font-semibold">
                        {markSchemeFile ? (
                          <span className="text-emerald-600 font-bold">
                            Mark Scheme: {markSchemeFile.name} ({formatFileSize(markSchemeFile.size)})
                          </span>
                        ) : (
                          'Drop Mark Scheme PDF or worksheet here, or click to choose'
                        )}
                      </span>
                      <input
                        type="file"
                        ref={msFileInputRef}
                        hidden
                        onChange={(e) => {
                          if (e.target.files?.[0]) setMarkSchemeFile(e.target.files[0]);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="fld">
                      <label>Mark Scheme Web Link / Document URL</label>
                      <input
                        className="inp text-sm"
                        placeholder="https://... (Mark Scheme document link)"
                        value={markSchemeUrl}
                        onChange={(e) => setMarkSchemeUrl(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
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
                {submitting ? 'Publishing…' : 'Publish Assessment with Mark Scheme'}
              </button>
            </div>
          </form>
        )}

        {/* Quick Attach Mark Scheme Modal for existing item */}
        {isTeacher && attachingToItem && (
          <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/30 grid gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Attach Mark Scheme to "{attachingToItem.title}"
              </span>
              <button
                type="button"
                className="icon"
                onClick={() => setAttachingToItem(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAttachSubmit} className="grid gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="fld">
                  <label>Choose Mark Scheme File (PDF/Doc)</label>
                  <input
                    type="file"
                    className="inp text-xs p-1"
                    onChange={(e) => setQuickMsFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="fld">
                  <label>Or Enter Mark Scheme Link</label>
                  <input
                    className="inp text-xs"
                    placeholder="https://..."
                    value={quickMsUrl}
                    onChange={(e) => setQuickMsUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="quickMsVis"
                    checked={quickMsVisible}
                    onChange={(e) => setQuickMsVisible(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                  />
                  <label htmlFor="quickMsVis" className="text-xs font-semibold cursor-pointer">
                    Make Mark Scheme immediately visible to students
                  </label>
                </div>

                <div className="actsrow">
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => setAttachingToItem(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn sm primary">
                    Save Mark Scheme
                  </button>
                </div>
              </div>
            </form>
          </div>
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
                  ? 'Add your first past paper, exam worksheet, or quiz with an attached mark scheme using the button above!'
                  : 'No active assessments or past papers published right now.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedAssessments.map((item) => {
                const isHidden = item.visibleToStudents === false;
                const categoryObj = categories.find((c) => c.id === item.cat);
                const hasMs =
                  !!item.markSchemeFileName ||
                  !!item.markSchemeUrl ||
                  !!item.markSchemeFileData;
                const msReleased = item.markSchemeVisibleToStudents !== false;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-blue-500/50 transition-all flex flex-col justify-between gap-3 ${
                      isHidden ? 'opacity-85 border-dashed border-amber-500/40' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Top tags */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
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
                        onClick={() => handleOpenAssessment(item)}
                      >
                        {item.title}
                      </h4>

                      {/* Sub-info if file */}
                      {item.type === 'file' && (
                        <div className="text-[11px] text-[var(--muted)] font-mono flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{item.fileName || 'assessment file'}</span>
                          {item.size ? <span>· {formatFileSize(item.size)}</span> : null}
                        </div>
                      )}

                      {/* Instructions */}
                      {item.note && (
                        <p className="text-xs text-[var(--muted)] line-clamp-2 m-0">
                          {item.note}
                        </p>
                      )}

                      {/* Attached Mark Scheme Container */}
                      {hasMs ? (
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200 truncate">
                                {item.markSchemeFileName || item.markSchemeTitle || 'Mark Scheme'}
                              </div>
                              <div className="text-[10px] text-emerald-800 dark:text-emerald-300">
                                {isTeacher ? (
                                  msReleased ? (
                                    <span className="text-emerald-700 font-semibold">● Visible to students</span>
                                  ) : (
                                    <span className="text-amber-700 font-semibold">● Confidential (Hidden from students)</span>
                                  )
                                ) : msReleased ? (
                                  <span className="text-emerald-700 font-semibold">Available for revision</span>
                                ) : (
                                  <span className="text-amber-700">Releases after assessment</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Student can open if released, teacher can always open */}
                            {(isTeacher || msReleased) && (
                              <button
                                type="button"
                                className="btn sm text-xs py-1 px-2.5 bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 font-semibold"
                                onClick={() => handleOpenMarkScheme(item)}
                                title="Open mark scheme in separate desktop window"
                              >
                                <ExternalLink className="w-3 h-3" /> Mark Scheme
                              </button>
                            )}

                            {(isTeacher || msReleased) && (item.markSchemeFileName || item.markSchemeFileData) && (
                              <button
                                type="button"
                                className="icon p-1 text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
                                onClick={async () => {
                                  onToast(`Downloading mark scheme for ${item.title}…`);
                                  await downloadMarkSchemeFile(item);
                                }}
                                title="Download mark scheme"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Teacher Toggle for Mark Scheme Release */}
                            {isTeacher && (
                              <button
                                type="button"
                                className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 ${
                                  msReleased
                                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40'
                                }`}
                                onClick={() => handleToggleMarkSchemeVisibility(item)}
                                title="Toggle whether students can view this mark scheme"
                              >
                                {msReleased ? (
                                  <>
                                    <Eye className="w-3 h-3" /> Released
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3" /> Hidden
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : isTeacher ? (
                        /* Teacher Button to Attach Mark Scheme if missing */
                        <div className="pt-1">
                          <button
                            type="button"
                            className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-medium"
                            onClick={() => {
                              setAttachingToItem(item);
                              setQuickMsFile(null);
                              setQuickMsUrl('');
                              setQuickMsVisible(false);
                            }}
                          >
                            <Plus className="w-3 h-3" /> Attach Mark Scheme
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]/50 mt-1 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          className="btn sm primary py-1 px-2.5 text-xs font-semibold flex items-center gap-1"
                          onClick={() => handleOpenAssessment(item)}
                          title="Open assessment in dedicated window"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{item.type === 'file' ? 'Open Paper' : 'Open Quiz'}</span>
                        </button>

                        {/* Direct Download for File Assessments */}
                        {item.type === 'file' && (
                          <button
                            type="button"
                            className="icon"
                            onClick={async () => {
                              onToast(`Downloading ${item.fileName || item.title}…`);
                              await downloadShelfFile(item);
                            }}
                            title="Download assessment paper"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
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

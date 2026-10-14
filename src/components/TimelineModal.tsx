import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Calendar,
  ExternalLink,
  Plus,
  Eye,
  EyeOff,
  Settings,
  Globe,
  Sparkles,
  Milestone,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Category, ShelfConfig, TimelineMilestone } from '../types';
import { normalizeUrl } from '../utils/linkAnalyzer';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  isTeacher: boolean;
  config: ShelfConfig;
  onUpdateConfig: (cfg: Partial<ShelfConfig>) => Promise<void>;
  onToast: (msg: string) => void;
}

const DEFAULT_TIMELINE_URL = 'https://cs-timeline-five.vercel.app/';

const INITIAL_MILESTONES: TimelineMilestone[] = [
  {
    id: 'm1',
    title: 'Term 1 Kickoff: Computer Systems & Architecture',
    date: 'Week 1 - 4',
    phase: 'Theory & Architecture',
    description: 'CPU fundamentals, ALU, Von Neumann architecture, and primary memory.',
    visibleToStudents: true
  },
  {
    id: 'm2',
    title: 'First Formative Assessment & Logic Gate Simulator Lab',
    date: 'Week 5',
    phase: 'Assessment',
    description: 'Boolean algebra test and interactive logic circuit design submission.',
    visibleToStudents: true
  },
  {
    id: 'm3',
    title: 'Networks & Protocols: Client-Server & Cloud Infrastructure',
    date: 'Week 6 - 9',
    phase: 'Networking',
    description: 'TCP/IP layers, routing, subnetting, and network security protocols.',
    visibleToStudents: true
  },
  {
    id: 'm4',
    title: 'Midterm Exam & Practical Coding Checkpoint',
    date: 'Week 10',
    phase: 'Exam',
    description: 'Comprehensive assessment of Themes A1 & A2.',
    visibleToStudents: true
  },
  {
    id: 'm5',
    title: 'Internal Assessment (IA) Topic Selection & Starter Repo',
    date: 'Week 12',
    phase: 'Coursework',
    description: 'Define computational solution scenario and set up GitHub repository.',
    visibleToStudents: false // Hidden by default for teacher review
  }
];

export const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  categories,
  isTeacher,
  config,
  onUpdateConfig,
  onToast
}) => {
  const [viewMode, setViewMode] = useState<'app' | 'milestones'>('app');
  const [isFull, setIsFull] = useState(false);
  const [showConfigUrl, setShowConfigUrl] = useState(false);

  // External timeline URL from config or default
  const timelineUrl = config.timelineAppUrl || DEFAULT_TIMELINE_URL;
  const [inputUrl, setInputUrl] = useState(timelineUrl);
  const [inputTitle, setInputTitle] = useState(config.timelineAppTitle || 'Timeline App');

  // Keep input fields synchronized if config changes
  useEffect(() => {
    if (config.timelineAppUrl) {
      setInputUrl(config.timelineAppUrl);
    }
    if (config.timelineAppTitle) {
      setInputTitle(config.timelineAppTitle);
    }
  }, [config.timelineAppUrl, config.timelineAppTitle]);

  // Interactive milestones state (saved in localStorage or config)
  const [milestones, setMilestones] = useState<TimelineMilestone[]>(() => {
    try {
      const raw = localStorage.getItem('ps.timelineMilestones');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MILESTONES;
  });

  // Milestone Add Form
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mDate, setMDate] = useState('');
  const [mPhase, setMPhase] = useState('Theory');
  const [mDesc, setMDesc] = useState('');
  const [mVisible, setMVisible] = useState(true);

  const isMasterVisible = config.showTimelineToStudents !== false;

  const displayedMilestones = useMemo(() => {
    if (isTeacher) return milestones;
    return milestones.filter((m) => m.visibleToStudents !== false);
  }, [milestones, isTeacher]);

  if (!isOpen) return null;

  const handleToggleMasterVisibility = async () => {
    const nextVal = !isMasterVisible;
    await onUpdateConfig({ showTimelineToStudents: nextVal });
    onToast(
      nextVal
        ? 'Timeline App is now visible to students.'
        : 'Timeline App is now hidden from students (Teacher only).'
    );
  };

  const handleSaveTimelineUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(inputUrl);
    if (!normalized) {
      onToast('Please enter a valid web URL for your timeline app.');
      return;
    }

    await onUpdateConfig({
      timelineAppUrl: normalized,
      timelineAppTitle: inputTitle.trim() || 'Course Timeline App'
    });
    setShowConfigUrl(false);
    onToast('Timeline App URL updated successfully.');
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim() || !mDate.trim()) {
      onToast('Please enter a title and date/week.');
      return;
    }

    const newM: TimelineMilestone = {
      id: 'm_' + Date.now().toString(36),
      title: mTitle.trim(),
      date: mDate.trim(),
      phase: mPhase,
      description: mDesc.trim(),
      visibleToStudents: mVisible
    };

    const next = [...milestones, newM];
    setMilestones(next);
    try {
      localStorage.setItem('ps.timelineMilestones', JSON.stringify(next));
    } catch {}

    setMTitle('');
    setMDate('');
    setMDesc('');
    setShowAddMilestone(false);
    onToast(`Added milestone "${newM.title}".`);
  };

  const handleToggleMilestoneVisibility = (mId: string) => {
    const next = milestones.map((m) =>
      m.id === mId ? { ...m, visibleToStudents: m.visibleToStudents === false } : m
    );
    setMilestones(next);
    try {
      localStorage.setItem('ps.timelineMilestones', JSON.stringify(next));
    } catch {}
    const target = next.find((m) => m.id === mId);
    onToast(
      target?.visibleToStudents !== false
        ? 'Milestone visible to students.'
        : 'Milestone hidden from students (Teacher only).'
    );
  };

  const handleDeleteMilestone = (mId: string) => {
    const next = milestones.filter((m) => m.id !== mId);
    setMilestones(next);
    try {
      localStorage.setItem('ps.timelineMilestones', JSON.stringify(next));
    } catch {}
    onToast('Milestone removed.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-card ${isFull ? 'max-w-[96vw] h-[94vh]' : 'max-w-[960px] max-h-[90vh]'} flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg m-0 truncate">
                  {config.timelineAppTitle || 'Course Timeline & Roadmap'}
                </h3>
                <span className="badge-tag">
                  {viewMode === 'app' ? 'Live App' : `${displayedMilestones.length} Milestones`}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] m-0 truncate">
                Interactive schedule, syllabus pacing, project checkpoints, and deadlines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Expand / Minimize */}
            <button
              type="button"
              className="icon"
              onClick={() => setIsFull(!isFull)}
              title={isFull ? 'Restore size' : 'Expand full size'}
            >
              {isFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Teacher Master Visibility Toggle */}
            {isTeacher && (
              <button
                type="button"
                className={`btn sm ${isMasterVisible ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}
                onClick={handleToggleMasterVisibility}
                title="Toggle whether students can see the Timeline App button"
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

        {/* Navigation & Controls Bar */}
        <div className="p-2.5 bg-[var(--surface)] border-b border-[var(--line)] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className={`btn sm ${viewMode === 'app' ? 'primary' : ''}`}
              onClick={() => setViewMode('app')}
            >
              <Globe className="w-3.5 h-3.5" /> Timeline Web App
            </button>

            <button
              type="button"
              className={`btn sm ${viewMode === 'milestones' ? 'primary' : ''}`}
              onClick={() => setViewMode('milestones')}
            >
              <Milestone className="w-3.5 h-3.5" /> Course Milestones ({displayedMilestones.length})
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {timelineUrl && (
              <a
                href={timelineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn sm"
                title="Open Timeline App in a full browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open App in New Tab
              </a>
            )}

            {isTeacher && (
              <button
                type="button"
                className={`btn sm ${showConfigUrl ? 'primary' : ''}`}
                onClick={() => setShowConfigUrl(!showConfigUrl)}
                title="Change or set the URL of your existing timeline app"
              >
                <Settings className="w-3.5 h-3.5" />
                {showConfigUrl ? 'Close URL Config' : 'Configure App URL'}
              </button>
            )}

            {isTeacher && viewMode === 'milestones' && (
              <button
                type="button"
                className={`btn sm ${showAddMilestone ? 'primary' : ''}`}
                onClick={() => setShowAddMilestone(!showAddMilestone)}
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddMilestone ? 'Cancel' : 'Add Milestone'}
              </button>
            )}
          </div>
        </div>

        {/* Teacher URL Configuration Panel */}
        {isTeacher && showConfigUrl && (
          <form onSubmit={handleSaveTimelineUrl} className="p-4 bg-[var(--surface2)] border-b border-[var(--line)] grid gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-amber-600" />
                Connect Your Existing Timeline App
              </span>
              <span className="text-xs text-[var(--muted)]">
                Enter the web address of your existing timeline application
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="fld sm:col-span-2">
                <label>Timeline App URL</label>
                <input
                  className="inp text-sm url"
                  placeholder="https://poojaaro.github.io/timeline/ or your hosted timeline"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  required
                />
              </div>

              <div className="fld">
                <label>Custom Title / Label</label>
                <input
                  className="inp text-sm"
                  placeholder="e.g. 2026/2027 Syllabus Timeline"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="actsrow justify-end">
              <button
                type="button"
                className="btn sm"
                onClick={() => setShowConfigUrl(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn sm primary"
              >
                Save Timeline App URL
              </button>
            </div>
          </form>
        )}

        {/* Teacher Add Milestone Form */}
        {isTeacher && viewMode === 'milestones' && showAddMilestone && (
          <form onSubmit={handleAddMilestone} className="p-4 bg-[var(--surface2)] border-b border-[var(--line)] grid gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Add Course Milestone or Deadline
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addMilestoneVisible"
                  checked={mVisible}
                  onChange={(e) => setMVisible(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--accent)] cursor-pointer"
                />
                <label htmlFor="addMilestoneVisible" className="text-xs cursor-pointer select-none font-semibold text-[var(--ink)]">
                  Visible to students
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="fld sm:col-span-2">
                <label>Milestone Title</label>
                <input
                  className="inp text-sm"
                  placeholder="e.g. Internal Assessment Submission Checkpoint"
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  required
                />
              </div>

              <div className="fld">
                <label>Date / Week</label>
                <input
                  className="inp text-sm"
                  placeholder="e.g. Week 14 or 2026-11-28"
                  value={mDate}
                  onChange={(e) => setMDate(e.target.value)}
                  required
                />
              </div>

              <div className="fld">
                <label>Phase / Type</label>
                <select
                  className="inp text-sm"
                  value={mPhase}
                  onChange={(e) => setMPhase(e.target.value)}
                >
                  <option value="Theory">Theory & Concepts</option>
                  <option value="Practical">Practical Lab / Coding</option>
                  <option value="Assessment">Assessment & Quiz</option>
                  <option value="Exam">Exam / Past Paper</option>
                  <option value="Coursework">Coursework / Project</option>
                  <option value="Holiday">Break / Revision</option>
                </select>
              </div>

              <div className="fld sm:col-span-2">
                <label>Description / Details</label>
                <input
                  className="inp text-sm"
                  placeholder="Review rubrics and upload draft repository link"
                  value={mDesc}
                  onChange={(e) => setMDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="actsrow justify-end">
              <button
                type="button"
                className="btn sm"
                onClick={() => setShowAddMilestone(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn sm primary"
              >
                Add Milestone
              </button>
            </div>
          </form>
        )}

        {/* Main Content Area */}
        {viewMode === 'app' ? (
          <div className="flex-1 min-h-[420px] flex flex-col bg-[var(--surface2)] relative">
            <iframe
              src={timelineUrl}
              title="Course Timeline App"
              className="w-full flex-1 border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            <div className="p-2.5 bg-[var(--surface)] border-t border-[var(--line)] text-xs text-[var(--muted)] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>
                  Connected to: <code className="font-mono text-[var(--ink)]">{timelineUrl}</code>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={timelineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] font-semibold underline underline-offset-2 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> If embed is blocked, open directly
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="max-w-2xl mx-auto">
              {displayedMilestones.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-10 h-10 text-[var(--muted)] mx-auto mb-2 opacity-50" />
                  <h4 className="font-bold text-base">No timeline milestones</h4>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {isTeacher
                      ? 'Add upcoming term dates and deadlines using the button above!'
                      : 'No timeline milestones have been published yet.'}
                  </p>
                </div>
              ) : (
                <div className="relative border-l-2 border-[var(--line)] ml-4 pl-6 space-y-6">
                  {displayedMilestones.map((milestone, idx) => {
                    const isHidden = milestone.visibleToStudents === false;

                    return (
                      <div key={milestone.id} className="relative group">
                        {/* Node marker */}
                        <div
                          className={`absolute -left-[33px] top-1.5 w-4 h-4 rounded-full border-2 border-[var(--surface)] ${
                            milestone.phase === 'Exam'
                              ? 'bg-rose-500'
                              : milestone.phase === 'Assessment'
                              ? 'bg-blue-500'
                              : milestone.phase === 'Coursework'
                              ? 'bg-purple-500'
                              : 'bg-emerald-500'
                          }`}
                        />

                        {/* Milestone Card */}
                        <div
                          className={`p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-amber-500/50 transition-all ${
                            isHidden ? 'opacity-85 border-dashed border-amber-500/40' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-[var(--accent)] bg-[var(--surface2)] px-2 py-0.5 rounded flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {milestone.date}
                              </span>

                              {milestone.phase && (
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                  {milestone.phase}
                                </span>
                              )}
                            </div>

                            {/* Teacher Controls */}
                            {isTeacher && (
                              <div className="flex items-center gap-1">
                                {isHidden && (
                                  <span className="badge-tag hidden-from-students text-[10px] py-0.5 px-1.5 flex items-center gap-1 mr-1">
                                    <EyeOff className="w-3 h-3" /> Teacher Only
                                  </span>
                                )}

                                <button
                                  type="button"
                                  className="icon"
                                  onClick={() => handleToggleMilestoneVisibility(milestone.id)}
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
                                  className="icon text-[var(--warn)]"
                                  onClick={() => handleDeleteMilestone(milestone.id)}
                                  title="Delete milestone"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          <h4 className="font-bold text-sm text-[var(--ink)] m-0">
                            {milestone.title}
                          </h4>

                          {milestone.description && (
                            <p className="text-xs text-[var(--muted)] mt-1.5 m-0 leading-relaxed">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

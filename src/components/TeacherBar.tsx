import React from 'react';
import { Eye, EyeOff, Share2, KeyRound, Lock, Sparkles, ShieldCheck } from 'lucide-react';

interface TeacherBarProps {
  isTeacher: boolean;
  studentPreview: boolean;
  onToggleStudentPreview: () => void;
  onOpenVisibilityManager: () => void;
  onOpenChangePasscode: () => void;
  onLockTeacher: () => void;
  onCopyStudentLink: () => void;
  onReseedCurriculum?: () => void;
}

export const TeacherBar: React.FC<TeacherBarProps> = ({
  isTeacher,
  studentPreview,
  onToggleStudentPreview,
  onOpenVisibilityManager,
  onOpenChangePasscode,
  onLockTeacher,
  onCopyStudentLink,
  onReseedCurriculum
}) => {
  if (!isTeacher) return null;

  return (
    <div className={`banner teacher ${studentPreview ? 'border-amber-500/50' : ''}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 font-bold text-sm">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Teacher Controls
        </span>
        <span className="text-xs text-[var(--muted)]">
          {studentPreview
            ? '👁️ Previewing Student View (Controls hidden for preview)'
            : 'You have full control over tabs, links, files and student visibility.'}
        </span>
      </div>

      <div className="actsrow">
        <button
          type="button"
          className="btn sm"
          onClick={onCopyStudentLink}
          title="Copy the public link to share with students"
        >
          <Share2 className="w-3.5 h-3.5 text-[var(--accent)]" />
          Share Student Link
        </button>

        <button
          type="button"
          className={`btn sm ${studentPreview ? 'primary' : ''}`}
          onClick={onToggleStudentPreview}
          title="Toggle between full teacher editing mode and student perspective"
        >
          {studentPreview ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              Exit Student Preview
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              Preview Student View
            </>
          )}
        </button>

        <button
          type="button"
          className="btn sm"
          onClick={onOpenVisibilityManager}
          title="Manage student visibility for Extra Resources, Assessments, Timeline App, and categories"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          Student Access & Visibility
        </button>

        {onReseedCurriculum && (
          <button
            type="button"
            className="btn sm"
            onClick={onReseedCurriculum}
            title="Seed standard IB & IGCSE Computer Science syllabus topics"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Sync Syllabus
          </button>
        )}

        <button
          type="button"
          className="btn sm"
          onClick={onOpenChangePasscode}
          title="Update teacher PIN / passcode"
        >
          <KeyRound className="w-3.5 h-3.5" />
          Passcode
        </button>

        <button
          type="button"
          className="btn sm danger"
          onClick={onLockTeacher}
          title="Lock controls and switch to Student View"
        >
          <Lock className="w-3.5 h-3.5" />
          Lock Mode
        </button>
      </div>
    </div>
  );
};

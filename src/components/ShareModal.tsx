import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  Lock,
  Globe,
  Sparkles
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, onToast }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const origin = window.location.origin;
  const studentStandaloneUrl = `${origin}/student`;
  const homeStudentUrl = `${origin}/`;

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onToast(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card max-w-[620px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold m-0 text-[var(--ink)]">Student Share Links</h3>
              <p className="text-xs text-[var(--muted)] m-0">
                Safe, passcode-protected links for your students
              </p>
            </div>
          </div>
          <button type="button" className="icon" onClick={onClose} title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body space-y-4 pt-3">
          {/* Security Guarantee Note */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Passcode Protection Active:</span> Students cannot access the Teacher Dashboard. Even if they edit the URL or remove query parameters, teacher controls remain strictly locked behind your passcode.
            </div>
          </div>

          {/* Option 1: Standalone Student URL */}
          <div className="p-3.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[var(--accent)]" />
                Standalone Student URL (Recommended)
              </span>
              <span className="badge-tag bg-blue-500/15 text-blue-700 dark:text-blue-300 text-[10px] font-semibold">
                Dedicated Portal
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Clean URL with no query parameters. Always displays in Student View and permanently locks out teacher editing controls.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={studentStandaloneUrl}
                className="w-full text-xs font-mono p-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                className="btn sm primary flex-shrink-0 text-xs py-2 px-3"
                onClick={() => copyToClipboard(studentStandaloneUrl, 'standalone', 'Standalone Student URL')}
              >
                {copiedKey === 'standalone' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                  </>
                )}
              </button>
              <a
                href={studentStandaloneUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="icon border border-[var(--line)] bg-[var(--surface)] hover:text-[var(--accent)]"
                title="Preview Student View in a new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Option 2: Clean Base URL */}
          <div className="p-3.5 bg-[var(--surface2)] rounded-xl border border-[var(--line)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Course Shelf Root URL
              </span>
              <span className="badge-tag text-[10px]">Home</span>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Default homepage. Opens directly in Student View. Teacher controls are hidden and require clicking "Teacher Access" with your passcode.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={homeStudentUrl}
                className="w-full text-xs font-mono p-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--ink)] select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                className="btn sm flex-shrink-0 text-xs py-2 px-3"
                onClick={() => copyToClipboard(homeStudentUrl, 'home', 'Course Shelf Root URL')}
              >
                {copiedKey === 'home' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Passcode Security Details */}
          <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)] text-xs text-[var(--muted)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Teacher passcode protection is active.</span>
            </div>
            <span className="font-mono text-[11px] text-[var(--ink)] font-semibold">
              teacher123 (Default)
            </span>
          </div>
        </div>

        <div className="modal-footer pt-3 border-t border-[var(--line)] flex justify-end">
          <button type="button" className="btn sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

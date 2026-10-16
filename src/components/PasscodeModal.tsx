import React, { useState } from 'react';
import { Lock, Key, X, Check } from 'lucide-react';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (passcode: string) => boolean;
  currentPasscode: string;
  isChangingPasscode?: boolean;
  onChangePasscode?: (newPasscode: string) => Promise<void>;
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
  currentPasscode,
  isChangingPasscode = false,
  onChangePasscode
}) => {
  const [passcode, setPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isChangingPasscode) {
      if (passcode !== currentPasscode) {
        setError('Current passcode does not match.');
        return;
      }
      if (!newPasscode.trim() || newPasscode.length < 4) {
        setError('New passcode must be at least 4 characters.');
        return;
      }
      if (onChangePasscode) {
        try {
          await onChangePasscode(newPasscode.trim());
          setSuccess('Passcode updated successfully!');
          setTimeout(() => {
            onClose();
            setPasscode('');
            setNewPasscode('');
            setSuccess('');
          }, 1200);
        } catch {
          setError('Failed to update passcode. Check database connection.');
        }
      }
    } else {
      const ok = onUnlock(passcode.trim());
      if (ok) {
        setPasscode('');
        onClose();
      } else {
        setError('Incorrect teacher passcode. Please try again.');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[var(--accent)]" />
            <h3>{isChangingPasscode ? 'Change Teacher Passcode' : 'Teacher Access Control'}</h3>
          </div>
          <button type="button" className="icon" onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[var(--muted)] m-0">
          {isChangingPasscode
            ? 'Set a custom passcode to protect your teacher dashboard and content management controls.'
            : 'Enter the teacher passcode to access management controls, visibility settings, and add new pages or categories.'}
        </p>

        <form onSubmit={handleSubmit} className="grid gap-3 mt-1">
          <div className="fld">
            <label htmlFor="teacherPassInput">
              {isChangingPasscode ? 'Current Passcode' : 'Teacher Passcode'}
            </label>
            <input
              id="teacherPassInput"
              type="password"
              className="inp"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              autoFocus
              required
            />
          </div>

          {isChangingPasscode && (
            <div className="fld">
              <label htmlFor="newTeacherPassInput">New Passcode</label>
              <input
                id="newTeacherPassInput"
                type="password"
                className="inp"
                placeholder="Minimum 4 characters"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                required
              />
            </div>
          )}



          {error && <div className="text-sm text-[var(--warn)] font-medium">{error}</div>}
          {success && (
            <div className="text-sm text-[var(--accent)] font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {success}
            </div>
          )}

          <div className="actsrow justify-end mt-2">
            <button type="button" className="btn sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn sm primary">
              <Key className="w-3.5 h-3.5" />
              {isChangingPasscode ? 'Update Passcode' : 'Unlock Controls'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

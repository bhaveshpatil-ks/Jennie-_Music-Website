import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  ShieldAlert,
  Clock,
  Sparkles,
  Info,
  Copy,
  Check,
  Send,
  Music,
  ExternalLink,
} from 'lucide-react';
import {
  FEEDBACK_CATEGORIES,
  getCategoryPriority,
  checkFeedbackRateLimit,
  submitFeedbackReport,
} from '../../services/feedbackService';
import { useAuthStore } from '../../store/useAuthStore';
import { useLibraryStore } from '../../store/useLibraryStore';

export function FeedbackModal({ isOpen, onClose, initialContext = null, onOpenMyReports }) {
  const user = useAuthStore((state) => state.user);
  const setActiveView = useLibraryStore((state) => state.setActiveView);

  const [category, setCategory] = useState(initialContext?.category || 'playback');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [reportedItem, setReportedItem] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReport, setSuccessReport] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState({ allowed: true, remainingCount: 5 });

  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Sync category or context when opened
  useEffect(() => {
    if (isOpen) {
      if (initialContext?.category) {
        setCategory(initialContext.category);
      }
      if (initialContext?.trackTitle) {
        setSubject(`Playback issue with "${initialContext.trackTitle}"`);
      }
      if (user?.email && !contactEmail) {
        setContactEmail(user.email);
      }
      setRateLimitInfo(checkFeedbackRateLimit());
      setErrorMessage('');
      setSuccessReport(null);
    }
  }, [isOpen, initialContext, user]);

  // Handle ESC key dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCategoryObj = FEEDBACK_CATEGORIES.find((c) => c.id === category) || FEEDBACK_CATEGORIES[0];
  const autoPriority = getCategoryPriority(category);

  // Screenshot upload handler
  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Screenshot file size must be less than 5MB.');
      return;
    }

    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotDataUrl(event.target?.result);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotDataUrl(null);
    setScreenshotName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyRef = () => {
    if (successReport?.reference_id) {
      navigator.clipboard.writeText(successReport.reference_id);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!subject.trim() || subject.trim().length < 4) {
      setErrorMessage('Please enter a clear subject (minimum 4 characters).');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setErrorMessage('Please describe the issue in detail (minimum 15 characters).');
      return;
    }

    if (category === 'abuse' && (!reportedItem.trim() || reportedItem.trim().length < 3)) {
      setErrorMessage('Please identify the reported content or user identifier.');
      return;
    }

    setLoading(true);

    try {
      const report = await submitFeedbackReport({
        userId: user?.uid,
        userEmail: contactEmail.trim() || user?.email,
        category,
        subject,
        description,
        reportedItem: category === 'abuse' ? reportedItem : null,
        screenshotDataUrl,
        playerContext: initialContext,
      });

      setSuccessReport(report);
      setRateLimitInfo(checkFeedbackRateLimit());
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#111113] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 text-white select-none my-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* ─── SUCCESS VIEW ─── */}
        {successReport ? (
          <div className="py-6 text-center space-y-5 animate-luxury-fade">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Report Received</h2>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Thank you! Our engineering and safety team has received your ticket. We will investigate and resolve it promptly.
              </p>
            </div>

            {/* Reference Badge Card */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 max-w-sm mx-auto flex items-center justify-between gap-3">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">
                  Reference Ticket Number
                </span>
                <span className="text-base font-mono font-bold text-emerald-300">
                  {successReport.reference_id}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyRef}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors border border-white/10 active:scale-95"
              >
                {copiedRef ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedRef ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenMyReports) onOpenMyReports();
                  else setActiveView('feedback');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs transition-transform active:scale-95 shadow-md hover:bg-neutral-200"
              >
                Track in "My Reports"
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccessReport(null);
                  setSubject('');
                  setDescription('');
                  setReportedItem('');
                  setScreenshotDataUrl(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors border border-white/10"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        ) : (
          /* ─── FORM VIEW ─── */
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Support &amp; Community Integrity
                </span>
              </div>
              <h2 id="feedback-modal-title" className="text-xl font-bold text-white tracking-tight">
                Help &amp; Feedback
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Report a playback issue, bug, content concern, or share ideas.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Rate limit warning */}
            {!rateLimitInfo.allowed && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <Clock size={16} className="shrink-0" />
                <span>
                  Rate limit reached (max 5/hour). Please wait {rateLimitInfo.waitMinutes} minute(s).
                </span>
              </div>
            )}

            {/* Player Context Banner (If triggered from Player) */}
            {initialContext?.songId && (
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 text-white">
                    <Music size={16} />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">{initialContext.trackTitle || 'Current Track'}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{initialContext.artist}</p>
                  </div>
                </div>
                {initialContext.playbackPosition && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300 shrink-0">
                    Pos: {initialContext.playbackPosition}
                  </span>
                )}
              </div>
            )}

            {/* 1. Category Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="feedback-category" className="font-semibold text-neutral-200">
                  Issue Category <span className="text-red-400">*</span>
                </label>
                {/* Auto Priority Tag */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    autoPriority === 'high'
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : autoPriority === 'medium'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  Priority: {autoPriority}
                </span>
              </div>

              <select
                id="feedback-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-white transition-colors cursor-pointer"
              >
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 1b. Abuse Special Field (Required when category is abuse) */}
            {category === 'abuse' && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/25 space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                  <ShieldAlert size={14} />
                  <span>Reported Content or User Identifier *</span>
                </div>
                <input
                  type="text"
                  value={reportedItem}
                  onChange={(e) => setReportedItem(e.target.value)}
                  placeholder="e.g. Song ID, artist name, profile link, or playlist title"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-500/30 text-white text-xs focus:outline-none focus:border-red-400"
                />
                <p className="text-[10px] text-red-300/80">
                  Abuse reports require manual review by our Trust &amp; Safety compliance officer.
                </p>
              </div>
            )}

            {/* 2. Subject Field */}
            <div className="space-y-1">
              <label htmlFor="feedback-subject" className="text-xs font-semibold text-neutral-200">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                id="feedback-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue..."
                maxLength={100}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-white transition-colors placeholder:text-neutral-500"
              />
            </div>

            {/* 3. Description Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="feedback-description" className="font-semibold text-neutral-200">
                  Description &amp; Steps to Reproduce <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-neutral-400">{description.length}/1000</span>
              </div>
              <textarea
                id="feedback-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={currentCategoryObj.placeholder}
                maxLength={1000}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-white transition-colors placeholder:text-neutral-500 leading-relaxed resize-none"
              />
            </div>

            {/* 4. Screenshot Upload & 6. Contact Email (Two Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Contact Email */}
              <div className="space-y-1">
                <label htmlFor="feedback-email" className="text-xs font-semibold text-neutral-200">
                  Contact Email <span className="text-neutral-400 text-[10px]">(for replies)</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Attach Screenshot */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-200 block">
                  Attach Screenshot <span className="text-neutral-400 text-[10px]">(optional)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                  id="screenshot-input"
                />

                {screenshotDataUrl ? (
                  <div className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/40 border border-white/15 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <ImageIcon size={14} className="text-emerald-400 shrink-0" />
                      <span className="truncate text-[11px] text-neutral-200">{screenshotName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="text-neutral-400 hover:text-red-400 transition-colors p-1"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Upload size={13} />
                    <span>Upload Image (&lt;5MB)</span>
                  </button>
                )}
              </div>
            </div>

            {/* 5. Auto-Captured Diagnostic Context Badge */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-neutral-400 flex items-center gap-2">
              <Info size={13} className="shrink-0 text-neutral-500" />
              <span>
                Diagnostics (App v0.1.0, OS/Device type{initialContext?.songId ? ', & Track ID' : ''}) will be attached automatically to help triage.
              </span>
            </div>

            {/* Submit & Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !rateLimitInfo.allowed}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={13} />
                )}
                <span>Send Feedback</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

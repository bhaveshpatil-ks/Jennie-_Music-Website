import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  History,
  Shield,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  Mail,
  Copy,
  Check,
  RefreshCw,
  Eye,
  FileText,
  AlertTriangle,
  User,
  Smartphone,
  Music,
  Lock,
} from 'lucide-react';
import {
  FEEDBACK_CATEGORIES,
  getCategoryPriority,
  checkFeedbackRateLimit,
  submitFeedbackReport,
  getUserSubmittedReports,
  getAllReportsForAdmin,
  updateReportStatus,
} from '../services/feedbackService';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';

export function Feedback({ initialCategory = 'playback' }) {
  const user = useAuthStore((state) => state.user);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const currentTime = usePlayerStore((state) => state.currentTime);

  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'history' | 'admin'

  // Submit Form States
  const [category, setCategory] = useState(initialCategory);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [reportedItem, setReportedItem] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [attachCurrentTrack, setAttachCurrentTrack] = useState(Boolean(currentTrack));

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReport, setSuccessReport] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState({ allowed: true, remainingCount: 5 });

  // User History States
  const [myReports, setMyReports] = useState([]);

  // Admin States
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminReports, setAdminReports] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [adminSearch, setAdminSearch] = useState('');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesValue, setNotesValue] = useState('');
  const [inspectImage, setInspectImage] = useState(null);

  // Sync user email & rate limit
  useEffect(() => {
    if (user?.email && !contactEmail) {
      setContactEmail(user.email);
    }
    setRateLimitInfo(checkFeedbackRateLimit());
    setMyReports(getUserSubmittedReports());
  }, [user]);

  // Load admin reports if unlocked
  useEffect(() => {
    if (isAdminUnlocked && activeTab === 'admin') {
      fetchAdminData();
    }
  }, [isAdminUnlocked, activeTab]);

  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      const data = await getAllReportsForAdmin();
      setAdminReports(data);
    } catch (_) {}
    setAdminLoading(false);
  };

  const handleAdminUnlock = (e) => {
    e?.preventDefault();
    // Allow unlock with master passcode 'jennie2026' or if email matches owner
    const isOwner = user?.email && /bhavesh/i.test(user.email);
    if (adminPasscode.trim().toLowerCase() === 'jennie2026' || adminPasscode.trim().toLowerCase() === 'admin' || isOwner) {
      setIsAdminUnlocked(true);
      setAdminError('');
    } else {
      setAdminError('Invalid passcode. Use "jennie2026" or sign in as repository owner.');
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      return;
    }

    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotDataUrl(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!subject.trim() || subject.trim().length < 4) {
      setErrorMessage('Please provide a subject line (minimum 4 characters).');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setErrorMessage('Please describe the problem or reproduction steps (minimum 15 characters).');
      return;
    }

    if (category === 'abuse' && (!reportedItem.trim() || reportedItem.trim().length < 3)) {
      setErrorMessage('Please specify the reported content, user, or track.');
      return;
    }

    setLoading(true);

    try {
      const playerContext = attachCurrentTrack && currentTrack ? {
        songId: currentTrack.id,
        artist: currentTrack.artist,
        trackTitle: currentTrack.title,
        playbackPosition: `${Math.floor(currentTime / 60)}:${('0' + Math.floor(currentTime % 60)).slice(-2)}`,
      } : null;

      const report = await submitFeedbackReport({
        userId: user?.uid,
        userEmail: contactEmail.trim() || user?.email,
        category,
        subject,
        description,
        reportedItem: category === 'abuse' ? reportedItem : null,
        screenshotDataUrl,
        playerContext,
      });

      setSuccessReport(report);
      setMyReports(getUserSubmittedReports());
      setRateLimitInfo(checkFeedbackRateLimit());
    } catch (err) {
      setErrorMessage(err.message || 'Error submitting report.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    await updateReportStatus(reportId, newStatus);
    fetchAdminData();
    setMyReports(getUserSubmittedReports());
  };

  const handleSaveNotes = async (reportId) => {
    await updateReportStatus(reportId, undefined, notesValue);
    setEditingNotesId(null);
    fetchAdminData();
  };

  // Filter admin reports
  const filteredAdminReports = adminReports.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      const matchSubject = item.subject?.toLowerCase().includes(q);
      const matchRef = item.reference_id?.toLowerCase().includes(q);
      const matchEmail = item.contact_email?.toLowerCase().includes(q);
      if (!matchSubject && !matchRef && !matchEmail) return false;
    }
    return true;
  });

  const currentCategoryObj = FEEDBACK_CATEGORIES.find((c) => c.id === category) || FEEDBACK_CATEGORIES[0];
  const autoPriority = getCategoryPriority(category);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 select-none">
      {/* ─── PAGE HEADER & TABS ─── */}
      <div className="border-b border-white/10 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                Support &amp; Resolution Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Help &amp; Complaints
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Encounter an issue or have a recommendation? Lodge a report and track its status live.
            </p>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="flex items-center p-1 rounded-2xl bg-[#141416] border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('submit');
                setSuccessReport(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'submit'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MessageSquare size={14} />
              <span>Submit Report</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('history');
                setMyReports(getUserSubmittedReports());
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <History size={14} />
              <span>My Reports ({myReports.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Shield size={14} />
              <span>Admin Resolver</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── TAB 1: SUBMIT FEEDBACK ─── */}
      {activeTab === 'submit' && (
        <div>
          {successReport ? (
            <div className="p-8 rounded-3xl bg-[#121214] border border-white/10 text-center space-y-6 max-w-xl mx-auto animate-luxury-fade shadow-2xl">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 size={34} />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Thanks — We've Got Your Report
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
                  Your issue has been logged into our triage queue with priority rating <strong className="text-white uppercase">{successReport.priority}</strong>.
                </p>
              </div>

              {/* Reference Card */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 max-w-sm mx-auto flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                    Ticket Reference
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-300">
                    {successReport.reference_id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(successReport.reference_id);
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  {copiedRef ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedRef ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs transition-transform active:scale-95 shadow-md hover:bg-neutral-200"
                >
                  Track in My Reports
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
                  className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors border border-white/10"
                >
                  Submit Another Report
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#121214] border border-white/10 space-y-5 shadow-2xl">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center gap-2.5">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!rateLimitInfo.allowed && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2.5">
                  <Clock size={16} className="shrink-0" />
                  <span>
                    Hourly submission quota reached (max 5/hour). Please retry in {rateLimitInfo.waitMinutes} minute(s).
                  </span>
                </div>
              )}

              {/* Category Picker & Auto-Assigned Priority */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="cat-select" className="font-semibold text-neutral-200">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      autoPriority === 'high'
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : autoPriority === 'medium'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    Auto-Triaged Priority: {autoPriority}
                  </span>
                </div>

                <select
                  id="cat-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-white transition-colors cursor-pointer"
                >
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Abuse Field */}
              {category === 'abuse' && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
                    <Shield size={15} />
                    <span>Reported Content or User Identifier (Required for Abuse Reports) *</span>
                  </div>
                  <input
                    type="text"
                    value={reportedItem}
                    onChange={(e) => setReportedItem(e.target.value)}
                    placeholder="Specify track ID, playlist name, comment text, or artist profile"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-red-500/30 text-white text-xs focus:outline-none focus:border-red-400"
                  />
                  <p className="text-[11px] text-red-300/80 leading-relaxed">
                    Under platform safety protocols, abuse and content infringement reports are routed to human safety officers and will never be automatically dismissed.
                  </p>
                </div>
              )}

              {/* Currently Playing Track Auto-Attachment */}
              {currentTrack && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-white shrink-0">
                      <Music size={18} />
                    </div>
                    <div className="truncate text-xs">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Playing Context</span>
                      <p className="font-semibold text-white truncate">{currentTrack.title}</p>
                      <p className="text-neutral-400 truncate">{currentTrack.artist}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs shrink-0">
                    <input
                      type="checkbox"
                      checked={attachCurrentTrack}
                      onChange={(e) => setAttachCurrentTrack(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-white cursor-pointer"
                    />
                    <span className="text-neutral-300 hidden sm:inline">Attach track info</span>
                  </label>
                </div>
              )}

              {/* Subject */}
              <div className="space-y-1.5">
                <label htmlFor="fb-subject" className="text-xs font-semibold text-neutral-200">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  id="fb-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Song abruptly stops playing at 1:15, or Login button not responsive"
                  className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="fb-desc" className="font-semibold text-neutral-200">
                    Description &amp; Steps to Reproduce <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[11px] text-neutral-400">{description.length}/1000</span>
                </div>
                <textarea
                  id="fb-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={currentCategoryObj.placeholder}
                  maxLength={1000}
                  className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-white transition-colors leading-relaxed placeholder:text-neutral-500 resize-none"
                />
              </div>

              {/* Contact Email & Screenshot Attachment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="fb-email" className="text-xs font-semibold text-neutral-200">
                    Contact Email <span className="text-neutral-400 text-[10px]">(for resolution replies)</span>
                  </label>
                  <input
                    id="fb-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-200 block">
                    Attach Screenshot <span className="text-neutral-400 text-[10px]">(optional image)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="hidden"
                    id="page-screenshot-input"
                  />
                  {screenshotDataUrl ? (
                    <div className="flex items-center justify-between p-2 px-3 rounded-xl bg-black/60 border border-white/15 text-xs">
                      <span className="truncate text-emerald-400">{screenshotName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshotDataUrl(null);
                          setScreenshotName('');
                        }}
                        className="text-neutral-400 hover:text-red-400 text-xs ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById('page-screenshot-input')?.click()}
                      className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-medium transition-colors"
                    >
                      Choose Image File (&lt;5MB)
                    </button>
                  )}
                </div>
              </div>

              {/* Privacy Notice Disclaimer */}
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                By submitting this form, you acknowledge that technical context (operating system, browser/app version, and relevant track ID) is transmitted to assist in resolving your inquiry. See our <a href="/privacy-policy" className="text-neutral-400 underline hover:text-white">Privacy Policy</a>.
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !rateLimitInfo.allowed}
                  className="px-7 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ─── TAB 2: USER PAST REPORTS ("MY REPORTS") ─── */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Your Submitted Reports</h2>
            <button
              type="button"
              onClick={() => setMyReports(getUserSubmittedReports())}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>

          {myReports.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#121214] border border-white/10 space-y-3">
              <FileText size={32} className="mx-auto text-neutral-600" />
              <h3 className="text-sm font-semibold text-white">No Submitted Reports Found</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Any feedback, playback complaints, or bug reports you send will appear here with live resolution status.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className="mt-2 px-5 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200"
              >
                Submit a Report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myReports.map((report) => (
                <div
                  key={report.reference_id || report.id}
                  className="p-5 rounded-2xl bg-[#121214] border border-white/10 space-y-3 transition-colors hover:border-white/20"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {report.reference_id}
                      </span>
                      <span className="text-xs font-semibold text-white">{report.subject}</span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        report.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : report.status === 'in_review'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : report.status === 'closed'
                          ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      Status: {report.status || 'open'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {report.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-white/5">
                    <span>Category: <strong className="text-neutral-300 uppercase">{report.category}</strong></span>
                    <span>Submitted: {new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: ADMIN RESOLVER DASHBOARD ─── */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          {!isAdminUnlocked ? (
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-[#121214] border border-white/10 space-y-4 max-w-md mx-auto shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
                <Lock size={26} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Admin Resolver Gated Access</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Enter master support key or sign in as repository owner to manage issues.
                </p>
              </div>

              <form onSubmit={handleAdminUnlock} className="space-y-3 pt-2">
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Master Passcode (e.g. jennie2026)"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-white text-center"
                />
                {adminError && <p className="text-xs text-red-400">{adminError}</p>}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors shadow-md"
                >
                  Unlock Admin Console
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Stats Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#141416] border border-white/10">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block">Total Reports</span>
                  <span className="text-2xl font-bold text-white mt-1 block">{adminReports.length}</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">Open Tickets</span>
                  <span className="text-2xl font-bold text-amber-300 mt-1 block">
                    {adminReports.filter((r) => r.status === 'open' || !r.status).length}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 block">High Priority</span>
                  <span className="text-2xl font-bold text-red-400 mt-1 block">
                    {adminReports.filter((r) => r.priority === 'high').length}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">Resolved</span>
                  <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                    {adminReports.filter((r) => r.status === 'resolved' || r.status === 'closed').length}
                  </span>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="p-4 rounded-2xl bg-[#141416] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 flex-grow">
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search by ticket REF, subject, or email..."
                    className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none min-w-[200px]"
                  />

                  {/* Category Filter */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {FEEDBACK_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.shortLabel}</option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  {/* Priority Filter */}
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs cursor-pointer"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={fetchAdminData}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={12} className={adminLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Reports List */}
              {filteredAdminReports.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#141416] border border-white/10 text-neutral-400 text-xs">
                  No feedback tickets match the selected filters.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAdminReports.map((item) => (
                    <div
                      key={item.reference_id || item.id}
                      className="p-5 rounded-2xl bg-[#141416] border border-white/10 space-y-4 shadow-lg"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                            {item.reference_id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              item.priority === 'high'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : item.priority === 'medium'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {item.priority}
                          </span>
                          <span className="text-xs font-bold text-white">{item.subject}</span>
                        </div>

                        {/* Status Changer */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-neutral-400">Status:</span>
                          <select
                            value={item.status || 'open'}
                            onChange={(e) => handleStatusChange(item.id || item.reference_id, e.target.value)}
                            className="px-2.5 py-1 rounded-xl bg-black border border-white/20 text-xs font-semibold text-white cursor-pointer"
                          >
                            <option value="open">Open</option>
                            <option value="in_review">In Review</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </div>

                      {/* Abuse Alert Banner */}
                      {item.category === 'abuse' && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={15} className="text-red-400 shrink-0" />
                            <span><strong>Reported Content:</strong> {item.reported_item || 'Not specified'}</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                            Manual Safety Review Required
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap bg-black/40 p-3.5 rounded-xl border border-white/5">
                        {item.description}
                      </p>

                      {/* Context & Diagnostics */}
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center gap-4 text-[11px] text-neutral-400">
                        <span>Device: <strong className="text-neutral-300">{item.context?.device || 'Unknown'}</strong></span>
                        <span>App: <strong className="text-neutral-300">v{item.context?.app_version || '0.1.0'}</strong></span>
                        {item.context?.song_id && (
                          <span>Track: <strong className="text-neutral-300">{item.context?.track_title || item.context?.song_id} ({item.context?.artist})</strong></span>
                        )}
                        {item.context?.playback_position && (
                          <span>Pos: <strong className="text-neutral-300">{item.context.playback_position}</strong></span>
                        )}
                      </div>

                      {/* Screenshot & Contact Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          {item.screenshot_url && (
                            <button
                              type="button"
                              onClick={() => setInspectImage(item.screenshot_url)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white flex items-center gap-1.5 transition-colors border border-white/10"
                            >
                              <Eye size={13} />
                              <span>View Attached Screenshot</span>
                            </button>
                          )}

                          {item.contact_email && (
                            <a
                              href={`mailto:${item.contact_email}?subject=${encodeURIComponent(
                                `Re: Jennie Support Ticket [${item.reference_id}] - ${item.subject}`
                              )}`}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white flex items-center gap-1.5 transition-colors border border-white/10"
                            >
                              <Mail size={13} />
                              <span>Reply to {item.contact_email}</span>
                            </a>
                          )}
                        </div>

                        {/* Internal Admin Notes */}
                        <div className="flex items-center gap-2">
                          {editingNotesId === (item.id || item.reference_id) ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={notesValue}
                                onChange={(e) => setNotesValue(e.target.value)}
                                placeholder="Internal note..."
                                className="px-2.5 py-1 rounded-lg bg-black border border-white/20 text-xs text-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveNotes(item.id || item.reference_id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNotesId(item.id || item.reference_id);
                                setNotesValue(item.admin_notes || '');
                              }}
                              className="text-xs text-neutral-400 hover:text-white transition-colors"
                            >
                              {item.admin_notes ? `Note: ${item.admin_notes}` : '+ Add Internal Note'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Screenshot Preview Lightbox */}
      {inspectImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setInspectImage(null)}
        >
          <div className="max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl relative">
            <img src={inspectImage} alt="Report Screenshot" className="max-h-[85vh] w-auto object-contain" />
            <button
              type="button"
              onClick={() => setInspectImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Feedback;

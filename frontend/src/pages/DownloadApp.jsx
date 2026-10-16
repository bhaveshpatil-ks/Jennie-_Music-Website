import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Check, 
  Copy, 
  ExternalLink, 
  Smartphone, 
  Monitor, 
  ShieldCheck 
} from 'lucide-react';
import { useLibraryStore } from '../store/useLibraryStore';

export const DownloadApp = () => {
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const ANDROID_DIRECT_URL = '/downloads/Jennie-Music.apk';
  const ANDROID_FALLBACK_URL = 'https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP/releases/download/v1.0.37/Jennie-Music.apk';
  const WINDOWS_SHORTCUT_URL = '/downloads/Jennie-Music-Windows.url';
  const RELEASES_PAGE_URL = 'https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP/releases';

  const [downloadingAndroid, setDownloadingAndroid] = useState(false);
  const [downloadingWindows, setDownloadingWindows] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleDownloadAndroid = (e) => {
    if (e) e.preventDefault();
    setDownloadingAndroid(true);
    try {
      const link = document.createElement('a');
      link.href = ANDROID_DIRECT_URL;
      link.download = 'Jennie-Music.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (_) {
      window.location.href = ANDROID_DIRECT_URL;
    }
    setTimeout(() => setDownloadingAndroid(false), 2500);
  };

  const handleDownloadWindows = async (e) => {
    if (e) e.preventDefault();
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (_) {}
      return;
    }
    setDownloadingWindows(true);
    try {
      const link = document.createElement('a');
      link.href = WINDOWS_SHORTCUT_URL;
      link.download = 'Jennie-Music.url';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (_) {
      window.location.href = WINDOWS_SHORTCUT_URL;
    }
    setTimeout(() => setDownloadingWindows(false), 2500);
  };

  const handleCopyAndroidLink = () => {
    try {
      const urlToCopy = window.location.origin + ANDROID_DIRECT_URL;
      navigator.clipboard.writeText(urlToCopy);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (_) {}
  };

  return (
    <div className="min-h-full pb-28 text-neutral-100 bg-[#09090b]">
      {/* Top Header Navigation */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#09090b]/90 backdrop-blur-md border-b border-white/[0.08]">
        <button
          type="button"
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer group"
          aria-label="Back to music player"
        >
          <div className="w-6 h-6 rounded-md bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span>Back to Player</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <ShieldCheck size={14} className="text-neutral-300" />
          <span>Open Source Distribution</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {/* Title & Metadata */}
        <div className="mb-10 sm:mb-12">
          <div className="inline-block px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-neutral-300 text-xs font-mono uppercase tracking-wider mb-3">
            Release v1.0.23
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white mb-2">
            Download Jennie Music
          </h1>
          <p className="text-neutral-400 text-sm max-w-xl leading-relaxed">
            Select your platform below to download the application with background playback, synchronized lyrics, and hardware media key integration.
          </p>
        </div>

        {/* 2 Platform Options: Android & Windows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-12">
          {/* Option 1: Android */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#121214] border border-white/[0.08] hover:border-white/[0.15] transition-colors">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
                  <Smartphone size={22} className="stroke-[1.75]" />
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-white/5 text-neutral-400 border border-white/10">
                  Android 8.0+
                </span>
              </div>

              <h2 className="text-lg font-semibold text-white mb-1">Android</h2>
              <p className="text-xs text-neutral-400 mb-5 font-mono">
                Jennie-Music.apk • 4.5 MB
              </p>

              <ul className="space-y-2.5 mb-7 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 font-bold select-none">•</span>
                  <span>Background playback with lock screen media controls</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 font-bold select-none">•</span>
                  <span>Headphone and Bluetooth hardware button integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 font-bold select-none">•</span>
                  <span>Synchronized lyrics and client-side playlist caching</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 font-bold select-none">•</span>
                  <span>YouTube embed recovery engine for copyright restricted tracks</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={handleDownloadAndroid}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 active:scale-[0.99] text-black font-semibold text-xs tracking-tight transition-all cursor-pointer"
              >
                {downloadingAndroid ? (
                  <>
                    <Check size={15} className="text-black" />
                    <span>Downloading Jennie-Music.apk...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Download APK (Direct)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAndroidLink}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-medium border border-white/[0.06] transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check size={13} className="text-white" />
                      <span>Copied Link</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <a
                  href={ANDROID_FALLBACK_URL}
                  download="Jennie-Music.apk"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-medium border border-white/[0.06] transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Mirror Link</span>
                </a>
              </div>
            </div>
          </div>

          {/* Option 2: Windows */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-[#121214] border border-white/[0.08] hover:border-white/[0.15] transition-colors">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
                  <Monitor size={22} className="stroke-[1.75]" />
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-white/5 text-neutral-400 border border-white/10">
                  Windows 10 / 11
                </span>
              </div>

              <h2 className="text-lg font-semibold text-white mb-1">Windows</h2>
              <p className="text-xs text-neutral-400 mb-5 font-mono">
                64-bit Desktop Application
              </p>

              <ul className="space-y-2.5 mb-7 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 font-bold select-none">•</span>
                  <span>System media keys support (Play, Pause, Skip)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 font-bold select-none">•</span>
                  <span>Background execution with zero audio sleep throttling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 font-bold select-none">•</span>
                  <span>Widescreen desktop layout with synchronized lyrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-500 font-bold select-none">•</span>
                  <span>Taskbar pinning and standalone desktop window</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={handleDownloadWindows}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 active:scale-[0.99] text-black font-semibold text-xs tracking-tight transition-all cursor-pointer"
              >
                {deferredPrompt ? (
                  <>
                    <Download size={15} />
                    <span>Install Desktop App</span>
                  </>
                ) : downloadingWindows ? (
                  <>
                    <Check size={15} className="text-black" />
                    <span>Downloading Jennie Desktop...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Download for Windows</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="w-full flex items-center justify-center py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-medium border border-white/[0.06] transition-colors cursor-pointer"
              >
                <span>Continue on Web Player</span>
              </button>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="p-6 rounded-2xl bg-[#121214] border border-white/[0.08] mb-10">
          <h3 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider font-mono text-[11px]">
            Installation Reference
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-400">
            <div>
              <h4 className="text-xs font-semibold text-white mb-2">Android APK Installation</h4>
              <ol className="space-y-2 list-decimal list-inside text-neutral-300">
                <li>Download <code className="text-neutral-200 bg-white/5 px-1 py-0.5 rounded font-mono">Jennie-Music.apk</code> to your device.</li>
                <li>Tap the downloaded file and allow installation from browser settings if prompted.</li>
                <li>Confirm installation and launch the application.</li>
              </ol>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white mb-2">Windows Installation</h4>
              <ol className="space-y-2 list-decimal list-inside text-neutral-300">
                <li>Click "Get for Windows" or "Install on Windows" above.</li>
                <li>Follow the installer prompts or browser desktop app confirmation.</li>
                <li>Pin Jennie Music to your taskbar for quick access.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Bottom Verification Note */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 py-4 border-t border-white/[0.06]">
          <span>Source code and automated CI release packages are publicly accessible on GitHub.</span>
          <a
            href="https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
          >
            <span>Repository</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;

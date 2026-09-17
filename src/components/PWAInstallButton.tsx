import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Zap } from 'lucide-react';
import { haptics } from '../lib/haptics';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <div
        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-[#6FCF97] bg-[#6FCF97]/10 border border-[#6FCF97]/30 rounded-[2px]"
        title="Running as installed Progressive Web App"
      >
        <Zap className="w-2.5 h-2.5 fill-current" />
        <span className="hidden sm:inline">PWA Active</span>
      </div>
    );
  }

  return (
    <>
      {isInstallable && (
        <button
          id="pwa-install-btn"
          onClick={() => {
            haptics.tap();
            install();
          }}
          className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0E1013] bg-[#E8B347] hover:bg-[#C4952F] transition-colors rounded-[2px]"
          title="Install Iron Log to device home screen"
        >
          <Download className="w-3 h-3" />
          <span>Install</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          id="pwa-ios-guide-btn"
          onClick={() => {
            haptics.tap();
            setShowIOSGuide(true);
          }}
          className="flex items-center gap-1 px-1.5 py-1 text-[10px] font-mono text-[#8B8F98] hover:text-[#EDEEF0] border border-[#22252C] hover:border-[#8B8F98] transition-colors rounded-[2px]"
          title="Install on iOS device"
        >
          <Smartphone className="w-3 h-3 text-[#E8B347]" />
          <span>Install PWA</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3">
          <div className="w-full max-w-xs card p-4 bg-[#15171C] border border-[#2D313A] shadow-2xl relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#22252C]">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#E8B347]" />
                <h3 className="font-display text-base uppercase text-[#EDEEF0] tracking-wider">
                  Install on iOS
                </h3>
              </div>
              <button
                onClick={() => {
                  haptics.tap();
                  setShowIOSGuide(false);
                }}
                className="text-[#8B8F98] hover:text-[#EDEEF0] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#8B8F98] space-y-2.5 my-3 font-sans">
              <div className="flex items-start gap-2">
                <span className="font-mono text-xs text-[#E8B347] font-bold">1.</span>
                <span>Tap <strong className="text-[#EDEEF0]">Share</strong> (box with up arrow) in Safari.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-xs text-[#E8B347] font-bold">2.</span>
                <span>Select <strong className="text-[#EDEEF0]">Add to Home Screen</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-xs text-[#E8B347] font-bold">3.</span>
                <span>Tap <strong className="text-[#EDEEF0]">Add</strong>. Iron Log will launch offline with haptic feedback.</span>
              </div>
            </div>

            <button
              onClick={() => {
                haptics.tap();
                setShowIOSGuide(false);
              }}
              className="btn-primary w-full py-1.5 text-xs uppercase"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

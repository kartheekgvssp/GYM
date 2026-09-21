import React from 'react';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle, Shield } from 'lucide-react';
import { usePWAInstall } from '../lib/usePWAInstall';
import { useTheme } from '../lib/theme';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#14161F] border border-[#262B3A] p-6 shadow-2xl shadow-black/80 text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-[#1F2432] text-[#8E95A5] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Header */}
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-2xl bg-[#0A0B0F] border flex items-center justify-center shadow-lg"
            style={{ 
              borderColor: `${theme.primary}40`,
              color: theme.primary,
              boxShadow: `0 4px 14px ${theme.primary}15`
            }}
          >
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Install AuraFit <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded" style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}>PWA</span>
            </h3>
            <p className="text-xs text-[#8E95A5]">Full-screen native gym performance</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="py-4 text-center space-y-2">
            <CheckCircle className="w-10 h-10 mx-auto" style={{ color: theme.primary }} />
            <p className="text-sm font-semibold text-white">App is Already Installed!</p>
            <p className="text-xs text-[#8E95A5]">
              You are experiencing AuraFit in full standalone mobile mode.
            </p>
            <button
              onClick={onClose}
              className="w-full mt-3 py-2.5 rounded-full bg-[#1F2432] text-xs font-bold text-white hover:bg-[#282F42] transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Value props */}
            <div className="space-y-2.5 py-3 border-y border-[#202534] text-xs text-[#B4BCCF]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                <span>Instant offline gym access without app store downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                <span>Zero browser address bar clutter during workouts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                <span>Sub-millisecond haptic clicks & camera form check</span>
              </div>
            </div>

            {/* Platform specific guides */}
            <div className="mt-4">
              {isInstallable ? (
                /* Android / Chromium One-Tap */
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition"
                  style={{
                    backgroundColor: theme.primary,
                    color: theme.primaryContrast,
                    boxShadow: `0 4px 14px ${theme.primary}25`
                  }}
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Install App to Home Screen</span>
                </button>
              ) : isIOS ? (
                /* iOS Safari Steps */
                <div className="space-y-3 bg-[#0D0F15] p-3.5 rounded-2xl border border-[#222736]">
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
                    How to install on iOS Safari:
                  </div>
                  <div className="space-y-2 text-xs text-[#9DA5B7]">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-[#1F2432] flex items-center justify-center shrink-0 text-white font-bold text-[10px]">
                        1
                      </div>
                      <div className="flex-1">
                        Tap the <strong className="text-white inline-flex items-center gap-1"><Share className="w-3.5 h-3.5" style={{ color: theme.primary }} /> Share</strong> button in Safari’s bottom bar.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-[#1F2432] flex items-center justify-center shrink-0 text-white font-bold text-[10px]">
                        2
                      </div>
                      <div className="flex-1">
                        Scroll down and select <strong className="text-white inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5" style={{ color: theme.primary }} /> Add to Home Screen</strong>.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-[#1F2432] flex items-center justify-center shrink-0 text-white font-bold text-[10px]">
                        3
                      </div>
                      <div className="flex-1">
                        Tap <strong className="text-white">Add</strong> in the top right. Launch from your home screen!
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop / Standard Browser instructions */
                <div className="text-center space-y-2 bg-[#0D0F15] p-3.5 rounded-2xl border border-[#222736]">
                  <p className="text-xs text-[#9DA5B7]">
                    Click the install icon in your browser’s URL bar or use your browser menu to choose <strong>Install AuraFit</strong>.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-3 py-2 text-xs font-semibold text-[#8E95A5] hover:text-white transition"
            >
              Maybe Later
            </button>
          </>
        )}
      </div>
    </div>
  );
};

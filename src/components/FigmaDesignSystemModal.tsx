import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Palette, 
  Type, 
  Layout, 
  Smartphone, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useTheme, THEME_CONFIGS } from '../lib/theme';

interface FigmaDesignSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FigmaDesignSystemModal: React.FC<FigmaDesignSystemModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme, themeId, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'wireframe' | 'next_screen'>('colors');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const COLOR_PALETTE = [
    { name: `${theme.name} Primary Accent`, hex: theme.primary, role: 'Primary CTA, active states, key focus rings' },
    { name: `${theme.name} Secondary Accent`, hex: theme.secondary, role: 'Metrics, streaks, volume indicators, secondary cues' },
    { name: 'Canvas Pitch Black', hex: theme.bgCanvas, role: 'Main dark background, deep ergonomic canvas' },
    { name: 'Surface Obsidian Card', hex: theme.bgCard, role: 'Elevated cards, workout banners, modals' },
    { name: 'Inner Dark Container', hex: '#0B0D13', role: 'Stat boxes, set rows, nested inputs' },
    { name: 'Hairline Structural Border', hex: theme.borderCard, role: '1px structural borders, card separators' },
    { name: 'High-Contrast White', hex: '#FFFFFF', role: 'Headings, primary typography, active labels' },
    { name: 'Muted Athletic Slate', hex: '#8E95A5', role: 'Subtitles, secondary labels, disabled icons' },
  ];

  const TYPOGRAPHY_HIERARCHY = [
    { level: 'Hero Greeting Display', size: '32px / 2rem', weight: '800 (ExtraBold)', font: 'Plus Jakarta Sans', tracking: '-0.02em', usage: 'Welcome back, Alex' },
    { level: 'Card Title (H1)', size: '24px / 1.5rem', weight: '800 (Black)', font: 'Plus Jakarta Sans', tracking: '-0.01em', usage: "Today's Workout Banner title" },
    { level: 'Section Heading (H2)', size: '18px / 1.125rem', weight: '700 (Bold)', font: 'Plus Jakarta Sans', tracking: '0.01em', usage: 'Performance, Target Muscle Groups' },
    { level: 'Primary Body', size: '13px / 0.8125rem', weight: '500 (Medium)', font: 'Plus Jakarta Sans', tracking: 'normal', usage: 'Exercise descriptions, form tips' },
    { level: 'Technical / Numeric', size: '12px / 0.75rem', weight: '700 (Bold)', font: 'JetBrains Mono / Inter', tracking: '0.05em', usage: 'Sets, reps, timestamps, calories' },
    { level: 'Micro Pill Badges', size: '10px / 0.625rem', weight: '800 (ExtraBold)', font: 'Plus Jakarta Sans', tracking: '0.1em (Uppercase)', usage: 'TODAYS BLAST, PRO GYM, STREAK' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-[#12141D] border border-[#262D3E] shadow-2xl text-white overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#202534] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black"
              style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-wide text-white">
                Figma Specs & Design System
              </h2>
              <p className="text-xs text-[#8E95A5]">Color codes, typography scale & wireframe dimensions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1A1E2B] text-[#8E95A5] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#202534] px-4 bg-[#0D0F16] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'colors'
                ? 'font-extrabold'
                : 'border-transparent text-[#8E95A5] hover:text-white'
            }`}
            style={activeTab === 'colors' ? { borderColor: theme.primary, color: theme.primary } : undefined}
          >
            <Palette className="w-3.5 h-3.5" /> Colors (Hex)
          </button>
          <button
            onClick={() => setActiveTab('typography')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'typography'
                ? 'font-extrabold'
                : 'border-transparent text-[#8E95A5] hover:text-white'
            }`}
            style={activeTab === 'typography' ? { borderColor: theme.primary, color: theme.primary } : undefined}
          >
            <Type className="w-3.5 h-3.5" /> Typography
          </button>
          <button
            onClick={() => setActiveTab('wireframe')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'wireframe'
                ? 'font-extrabold'
                : 'border-transparent text-[#8E95A5] hover:text-white'
            }`}
            style={activeTab === 'wireframe' ? { borderColor: theme.primary, color: theme.primary } : undefined}
          >
            <Layout className="w-3.5 h-3.5" /> Figma Layout
          </button>
          <button
            onClick={() => setActiveTab('next_screen')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'next_screen'
                ? 'font-extrabold'
                : 'border-transparent text-[#8E95A5] hover:text-white'
            }`}
            style={activeTab === 'next_screen' ? { borderColor: theme.primary, color: theme.primary } : undefined}
          >
            <Smartphone className="w-3.5 h-3.5" /> Next Screen
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* TAB 1: COLOR PALETTE */}
          {activeTab === 'colors' && (
            <div className="space-y-3">
              <div className="text-xs text-[#8E95A5]">
                Tap any swatch to copy the exact HEX code directly into Figma or Tailwind:
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {COLOR_PALETTE.map((color, index) => (
                  <div
                    key={`${color.name}-${color.hex}-${index}`}
                    onClick={() => copyToClipboard(color.hex)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433] transition cursor-pointer group"
                    style={{ borderColor: copiedHex === color.hex ? theme.primary : '#1F2433' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl border border-white/15 shrink-0 shadow-md group-hover:scale-105 transition"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div>
                        <div className="text-xs font-extrabold text-white">{color.name}</div>
                        <div className="text-[10px] text-[#8E95A5] leading-tight">{color.role}</div>
                      </div>
                    </div>

                    <div 
                      className="flex items-center gap-1 font-mono text-xs font-bold bg-[#141824] px-2 py-1 rounded-lg border border-[#252C3D]"
                      style={{ color: theme.primary }}
                    >
                      <span>{color.hex}</span>
                      {copiedHex === color.hex ? (
                        <Check className="w-3 h-3" style={{ color: theme.primary }} />
                      ) : (
                        <Copy className="w-3 h-3 text-[#8E95A5]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TYPOGRAPHY GUIDE */}
          {activeTab === 'typography' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433] text-xs">
                <span className="font-bold" style={{ color: theme.primary }}>Primary Font Family:</span> Plus Jakarta Sans / Inter<br />
                <span className="font-bold" style={{ color: theme.primary }}>Numeric / Stepper Font:</span> JetBrains Mono / Space Grotesk
              </div>

              <div className="space-y-2">
                {TYPOGRAPHY_HIERARCHY.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433]">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span style={{ color: theme.primary }}>{item.level}</span>
                      <span className="font-mono text-[11px]" style={{ color: theme.secondary }}>{item.size}</span>
                    </div>
                    <div className="text-xs text-white font-medium">{item.usage}</div>
                    <div className="text-[10px] text-[#8E95A5] font-mono mt-1">
                      Weight: {item.weight} • Tracking: {item.tracking}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WIREFRAME LAYOUT DIMENSIONS FOR FIGMA */}
          {activeTab === 'wireframe' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433] space-y-1.5">
                <div className="font-bold uppercase text-[11px] tracking-wider" style={{ color: theme.primary }}>
                  Mobile Artboard Canvas
                </div>
                <div className="flex items-center justify-between text-white font-mono">
                  <span>Standard iPhone Frame:</span>
                  <span style={{ color: theme.primary }}>390 × 844 px (iPhone 14/15/16)</span>
                </div>
                <div className="flex items-center justify-between text-white font-mono">
                  <span>Android Material Frame:</span>
                  <span style={{ color: theme.primary }}>360 × 800 px</span>
                </div>
                <div className="flex items-center justify-between text-white font-mono">
                  <span>Grid Columns:</span>
                  <span>4 Columns, 16px Margins, 12px Gutter</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433]">
                  <div className="font-bold text-white mb-1">1. Top Navigation Bar</div>
                  <div className="text-[11px] text-[#8E95A5] space-y-0.5 font-mono">
                    <div>• Frame Height: 56px</div>
                    <div>• Avatar Size: 44 × 44 px (Radius: 9999px Full Circle)</div>
                    <div>• Streak Pill: 32px height, 12px padding, Radius 16px</div>
                    <div>• Notification Bell: 40 × 40 px circle</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433]">
                  <div className="font-bold text-white mb-1">2. Daily Performance Progress Card</div>
                  <div className="text-[11px] text-[#8E95A5] space-y-0.5 font-mono">
                    <div>• Total Height: 208px</div>
                    <div>• Corner Radius: 24px (rounded-3xl)</div>
                    <div>• Outer Padding: 16px</div>
                    <div>• Stat Metric Tiles: 2-column grid, 12px gutter, 12px radius</div>
                    <div>• 7-Day Consistency Pills: 38 × 38 px square tiles (Radius: 12px)</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433]">
                  <div className="font-bold text-white mb-1">3. Today's Workout Hero Banner</div>
                  <div className="text-[11px] text-[#8E95A5] space-y-0.5 font-mono">
                    <div>• Card Height: 260px min-height</div>
                    <div>• Corner Radius: 24px</div>
                    <div>• Start Workout CTA: 48px height pill (Radius: 16px)</div>
                    <div>• Gradient Overlays: Dark gradient from #0A0B0F/95 at bottom</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433]">
                  <div className="font-bold text-white mb-1">4. PhonePe Elevated Bottom Navigation Bar</div>
                  <div className="text-[11px] text-[#8E95A5] space-y-0.5 font-mono">
                    <div>• Floating Bar Width: 358px (16px lateral padding)</div>
                    <div>• Nav Bar Container Height: 64px (Radius: 24px)</div>
                    <div>• Elevated Center Camera Button: 56 × 56 px circle</div>
                    <div>• Center Button Vertical Offset: -20px elevation above top edge</div>
                    <div>• Center Button Border: 4px solid #0A0B0F</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NEXT SCREEN (ACTIVE WORKOUT TRACKING) */}
          {activeTab === 'next_screen' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433]">
                <div className="font-bold uppercase text-[11px] tracking-wider mb-1" style={{ color: theme.primary }}>
                  Active Workout Tracking Screen Specification
                </div>
                <p className="text-xs text-[#CBD3E3] leading-relaxed">
                  Triggered immediately when the user taps <strong>Start Workout</strong>. Designed for high gym ergonomics (sweaty hands, large touch targets, loud gym environments).
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433]">
                  <div className="font-bold text-white">A. Sticky Top Control Bar</div>
                  <div className="text-[#8E95A5] text-[11px] mt-0.5 font-mono">
                    Exit back button, session title, elapsed stopwatch (MM:SS) with pause/resume toggle.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433]">
                  <div className="font-bold text-white">B. Movement Focus Hero & Form Cue</div>
                  <div className="text-[#8E95A5] text-[11px] mt-0.5 font-mono">
                    80 × 80 px movement preview, target muscle pill, 1-line biomechanical form cue.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433]">
                  <div className="font-bold text-white">C. Set Matrix Table & Steppers</div>
                  <div className="text-[#8E95A5] text-[11px] mt-0.5 font-mono">
                    Columns: Set #, Weight (±2.5kg steppers), Reps (±1 rep steppers), Done (32×32px check button).
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433]">
                  <div className="font-bold text-white">D. Dynamic Rest Timer HUD</div>
                  <div className="text-[#8E95A5] text-[11px] mt-0.5 font-mono">
                    Automatically counts down 90s upon checking off a set. Includes +15s increment and Skip button.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0B0D13] border border-[#1F2433]">
                  <div className="font-bold text-white">E. Finish Workout Celebration Modal</div>
                  <div className="text-[#8E95A5] text-[11px] mt-0.5 font-mono">
                    Summary metrics: Total active duration, estimated calories burned, cumulative kg volume lifted.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Close */}
        <div className="p-4 border-t border-[#202534] bg-[#0A0B0F] flex items-center justify-between">
          <span className="text-[10px] text-[#8E95A5] font-mono">AuraFit Men's Gym System v1.0</span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition"
            style={{ backgroundColor: theme.primary, color: theme.primaryContrast }}
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Palette, CheckCircle2, Sliders, Calendar, Flame, Smartphone, RotateCcw, Check } from 'lucide-react';
import { useTheme } from '../lib/theme';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'palettes' | 'elements';
}

const SETUP_SWATCHES = [
  { name: 'Sky Cyan', hex: '#38BDF8' },
  { name: 'Gold Champagne', hex: '#D4AF37' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Sapphire Azure', hex: '#3B82F6' },
  { name: 'Emerald Sage', hex: '#10B981' },
  { name: 'Amber Bronze', hex: '#F59E0B' },
  { name: 'Coral Punch', hex: '#F43F5E' },
];

const MENU_SWATCHES = [
  { name: 'Titanium White', hex: '#FFFFFF' },
  { name: 'Electric Cyan', hex: '#38BDF8' },
  { name: 'Equinox Gold', hex: '#D4AF37' },
  { name: 'Sapphire Blue', hex: '#3B82F6' },
  { name: 'Emerald Mint', hex: '#10B981' },
  { name: 'Ember Orange', hex: '#FF5722' },
];

const BURNED_SWATCHES = [
  { name: 'Fiery Ember', hex: '#FF5722' },
  { name: 'Hyper Orange', hex: '#FF6B35' },
  { name: 'Crimson Flame', hex: '#EF4444' },
  { name: 'Solar Amber', hex: '#F59E0B' },
  { name: 'Neon Coral', hex: '#FF4081' },
  { name: 'Electric Lime', hex: '#10B981' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'elements', // Default directly to element color tuner per user request
}) => {
  const { 
    themeId, 
    theme, 
    setTheme, 
    availableThemes,
    setupColor,
    menuHighlightColor,
    burnedColor,
    setSetupColor,
    setMenuHighlightColor,
    setBurnedColor,
    resetComponentColors,
    isCustomized
  } = useTheme();

  const [activeTab, setActiveTab] = useState<'palettes' | 'elements'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="theme-selector-modal"
        className="w-full max-w-lg bg-[#0F1118] border border-[#252B3E] rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1E2333]">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-colors"
              style={{ backgroundColor: menuHighlightColor, color: '#0A0B0F' }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-wide text-white">
                Color Customizer
              </h2>
              <p className="text-[11px] text-[#8E95A5]">
                Tune setup accents, menu highlights & burned calorie meters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181C28] border border-[#2B3144] flex items-center justify-center text-[#8E95A5] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1E2333] bg-[#12141F] px-4">
          <button
            onClick={() => setActiveTab('elements')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'elements'
                ? 'border-white text-white'
                : 'border-transparent text-[#8E95A5] hover:text-white'
            }`}
            style={activeTab === 'elements' ? { borderColor: menuHighlightColor, color: menuHighlightColor } : undefined}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Key Element Colors</span>
            {isCustomized && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('palettes')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'palettes'
                ? 'border-white text-white'
                : 'border-transparent text-[#8E95A5] hover:text-white'
            }`}
            style={activeTab === 'palettes' ? { borderColor: menuHighlightColor, color: menuHighlightColor } : undefined}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme Palettes</span>
          </button>
        </div>

        {/* Tab 1: Element Color Tuner */}
        {activeTab === 'elements' && (
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            
            {/* 1. Set Up Color Section */}
            <div className="p-3.5 rounded-2xl bg-[#141622] border border-[#222738] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-[#0A0B0F]"
                    style={{ backgroundColor: setupColor }}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                      The "Set Up" Button Color
                    </h3>
                    <p className="text-[10px] text-[#8E95A5]">
                      Weekly plan CTA, schedule badges & modal highlights
                    </p>
                  </div>
                </div>

                {/* Live Preview Button */}
                <div 
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm"
                  style={{ backgroundColor: setupColor, color: '#0A0B0F' }}
                >
                  <Calendar className="w-3 h-3" />
                  <span>Set Up</span>
                </div>
              </div>

              {/* Swatches */}
              <div className="flex items-center gap-2 flex-wrap">
                {SETUP_SWATCHES.map((swatch, idx) => (
                  <button
                    key={`setup-${swatch.hex}-${idx}`}
                    onClick={() => setSetupColor(swatch.hex)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all"
                    style={{
                      borderColor: setupColor.toLowerCase() === swatch.hex.toLowerCase() ? swatch.hex : '#2B3144',
                      backgroundColor: setupColor.toLowerCase() === swatch.hex.toLowerCase() ? `${swatch.hex}25` : '#181C28',
                      color: setupColor.toLowerCase() === swatch.hex.toLowerCase() ? '#FFFFFF' : '#A6B0C3'
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: swatch.hex }} />
                    <span>{swatch.name}</span>
                  </button>
                ))}

                {/* Custom Color Input */}
                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#2B3144] bg-[#181C28] text-[11px] text-[#A6B0C3] hover:text-white cursor-pointer transition-colors">
                  <input 
                    type="color" 
                    value={setupColor} 
                    onChange={(e) => setSetupColor(e.target.value)} 
                    className="w-4 h-4 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span>Custom Hex</span>
                </label>
              </div>
            </div>

            {/* 2. Menu Bar Highlighted Color Section */}
            <div className="p-3.5 rounded-2xl bg-[#141622] border border-[#222738] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-[#0A0B0F]"
                    style={{ backgroundColor: menuHighlightColor }}
                  >
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Menu Bar Highlighted Colors
                    </h3>
                    <p className="text-[10px] text-[#8E95A5]">
                      Active tab pill, floating camera button & glowing indicators
                    </p>
                  </div>
                </div>

                {/* Live Preview Mini Navigation */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B0D13] border border-[#202534]">
                  <div 
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1"
                    style={{ backgroundColor: `${menuHighlightColor}20`, color: menuHighlightColor }}
                  >
                    <span>Home</span>
                  </div>
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-[#0A0B0F]"
                    style={{ backgroundColor: menuHighlightColor }}
                  >
                    📷
                  </div>
                </div>
              </div>

              {/* Swatches */}
              <div className="flex items-center gap-2 flex-wrap">
                {MENU_SWATCHES.map((swatch, idx) => (
                  <button
                    key={`menu-${swatch.hex}-${idx}`}
                    onClick={() => setMenuHighlightColor(swatch.hex)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all"
                    style={{
                      borderColor: menuHighlightColor.toLowerCase() === swatch.hex.toLowerCase() ? swatch.hex : '#2B3144',
                      backgroundColor: menuHighlightColor.toLowerCase() === swatch.hex.toLowerCase() ? `${swatch.hex}25` : '#181C28',
                      color: menuHighlightColor.toLowerCase() === swatch.hex.toLowerCase() ? '#FFFFFF' : '#A6B0C3'
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: swatch.hex }} />
                    <span>{swatch.name}</span>
                  </button>
                ))}

                {/* Custom Color Input */}
                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#2B3144] bg-[#181C28] text-[11px] text-[#A6B0C3] hover:text-white cursor-pointer transition-colors">
                  <input 
                    type="color" 
                    value={menuHighlightColor} 
                    onChange={(e) => setMenuHighlightColor(e.target.value)} 
                    className="w-4 h-4 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span>Custom Hex</span>
                </label>
              </div>
            </div>

            {/* 3. Burned Bars and Numbers Color Section */}
            <div className="p-3.5 rounded-2xl bg-[#141622] border border-[#222738] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: burnedColor }}
                  >
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Burned Bars & Numbers
                    </h3>
                    <p className="text-[10px] text-[#8E95A5]">
                      Calorie burned metric, progress bar fill & energetic flame
                    </p>
                  </div>
                </div>

                {/* Live Preview Calorie Stat */}
                <div className="text-right">
                  <div className="text-xs font-black" style={{ color: burnedColor }}>
                    640 <span className="text-[10px] text-[#8E95A5] font-normal">/ 800 kcal</span>
                  </div>
                  <div className="w-16 h-1.5 rounded-full bg-[#1F2538] mt-0.5 overflow-hidden">
                    <div className="h-full rounded-full w-4/5" style={{ backgroundColor: burnedColor }} />
                  </div>
                </div>
              </div>

              {/* Swatches */}
              <div className="flex items-center gap-2 flex-wrap">
                {BURNED_SWATCHES.map((swatch, idx) => (
                  <button
                    key={`burned-${swatch.hex}-${idx}`}
                    onClick={() => setBurnedColor(swatch.hex)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all"
                    style={{
                      borderColor: burnedColor.toLowerCase() === swatch.hex.toLowerCase() ? swatch.hex : '#2B3144',
                      backgroundColor: burnedColor.toLowerCase() === swatch.hex.toLowerCase() ? `${swatch.hex}25` : '#181C28',
                      color: burnedColor.toLowerCase() === swatch.hex.toLowerCase() ? '#FFFFFF' : '#A6B0C3'
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: swatch.hex }} />
                    <span>{swatch.name}</span>
                  </button>
                ))}

                {/* Custom Color Input */}
                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#2B3144] bg-[#181C28] text-[11px] text-[#A6B0C3] hover:text-white cursor-pointer transition-colors">
                  <input 
                    type="color" 
                    value={burnedColor} 
                    onChange={(e) => setBurnedColor(e.target.value)} 
                    className="w-4 h-4 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span>Custom Hex</span>
                </label>
              </div>
            </div>

            {/* Quick Reset Button if customized */}
            {isCustomized && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={resetComponentColors}
                  className="flex items-center gap-1.5 text-xs text-[#8E95A5] hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset element colors to theme defaults</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Theme Palettes */}
        {activeTab === 'palettes' && (
          <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
            {availableThemes.map((t) => {
              const isSelected = t.id === themeId;
              return (
                <button
                  key={t.id}
                  id={`theme-option-${t.id}`}
                  onClick={() => setTheme(t.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3.5 group ${
                    isSelected
                      ? 'bg-[#181D2C] shadow-lg scale-[1.01]'
                      : 'bg-[#131520] border-[#222738] hover:border-[#38415C] hover:bg-[#161926]'
                  }`}
                  style={{
                    borderColor: isSelected ? t.primary : undefined,
                    boxShadow: isSelected ? `0 8px 24px -6px ${t.primary}40` : undefined,
                  }}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Swatch Circle */}
                    <div 
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md relative overflow-hidden shrink-0 border border-white/10"
                      style={{ backgroundColor: t.primary }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                      {isSelected && (
                        <CheckCircle2 
                          className="w-5 h-5 relative z-10" 
                          style={{ color: t.primaryContrast }}
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">
                          {t.name}
                        </span>
                        {isSelected && (
                          <span 
                            className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider"
                            style={{ backgroundColor: `${t.primary}25`, color: t.primary }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8E95A5] line-clamp-1 mt-0.5">
                        {t.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: t.primary }} title="Primary" />
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: t.setupColor }} title="Setup" />
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: t.burnedColor }} title="Burned" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-[#11131E] border-t border-[#1C2030] flex items-center justify-between">
          <span className="text-[11px] text-[#717A8C]">
            Changes take effect in real time
          </span>
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
            style={{ 
              backgroundColor: menuHighlightColor, 
              color: '#0A0B0F',
            }}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

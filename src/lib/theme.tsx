import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'titanium' | 'champagne' | 'pacific' | 'sage' | 'terracotta' | 'cleanlight';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  primary: string;
  primaryHover: string;
  primaryContrast: string;
  primaryRgb: string;
  secondary: string;
  bgCanvas: string;
  bgCard: string;
  borderCard: string;
  accentBadge: string;
  previewGradient: string;
  isLight?: boolean;
  setupColor: string;
  menuHighlightColor: string;
  burnedColor: string;
}

export const THEME_CONFIGS: Record<ThemeId, ThemeConfig> = {
  titanium: {
    id: 'titanium',
    name: 'Titanium Stealth',
    tagline: 'Clean minimalist monochrome • Pure titanium on matte graphite',
    primary: '#FFFFFF',
    primaryHover: '#E5E7EB',
    primaryContrast: '#0E1015',
    primaryRgb: '255, 255, 255',
    secondary: '#94A3B8',
    bgCanvas: '#0E1015',
    bgCard: '#161822',
    borderCard: '#242838',
    accentBadge: 'bg-white/10 text-white border-white/20',
    previewGradient: 'from-white via-[#E2E8F0] to-[#94A3B8]',
    setupColor: '#38BDF8', // Crisp Sky Cyan for distinct setup call-to-action
    menuHighlightColor: '#FFFFFF', // High-contrast clean white glow
    burnedColor: '#FF5722', // Fiery energetic ember for burned calories & numbers
  },
  champagne: {
    id: 'champagne',
    name: 'Equinox Gold',
    tagline: 'Warm champagne gold & espresso slate • Luxury boutique studio',
    primary: '#D4AF37',
    primaryHover: '#C59F2D',
    primaryContrast: '#0C0D11',
    primaryRgb: '212, 175, 55',
    secondary: '#E5C583',
    bgCanvas: '#0F1014',
    bgCard: '#181820',
    borderCard: '#2B2A38',
    accentBadge: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30',
    previewGradient: 'from-[#D4AF37] via-[#E5C583] to-[#997920]',
    setupColor: '#E5C583',
    menuHighlightColor: '#D4AF37',
    burnedColor: '#FF6B35',
  },
  pacific: {
    id: 'pacific',
    name: 'Pacific Slate',
    tagline: 'Calm Atlantic sapphire & deep navy • High clarity & zero glare',
    primary: '#4F86F7',
    primaryHover: '#3B74E8',
    primaryContrast: '#FFFFFF',
    primaryRgb: '79, 134, 247',
    secondary: '#93C5FD',
    bgCanvas: '#0A0E17',
    bgCard: '#121826',
    borderCard: '#1F2942',
    accentBadge: 'bg-[#4F86F7]/15 text-[#4F86F7] border-[#4F86F7]/30',
    previewGradient: 'from-[#4F86F7] via-[#3B74E8] to-[#1E40AF]',
    setupColor: '#60A5FA',
    menuHighlightColor: '#4F86F7',
    burnedColor: '#FB923C',
  },
  sage: {
    id: 'sage',
    name: 'Alpine Sage',
    tagline: 'Restorative botanical sage & dark cedar • Organic & serene',
    primary: '#38B281',
    primaryHover: '#2F9E72',
    primaryContrast: '#071510',
    primaryRgb: '56, 178, 129',
    secondary: '#86EFAC',
    bgCanvas: '#0A110D',
    bgCard: '#111D17',
    borderCard: '#1B2F25',
    accentBadge: 'bg-[#38B281]/15 text-[#38B281] border-[#38B281]/30',
    previewGradient: 'from-[#38B281] via-[#2F9E72] to-[#14532D]',
    setupColor: '#6EE7B7',
    menuHighlightColor: '#38B281',
    burnedColor: '#F97316',
  },
  terracotta: {
    id: 'terracotta',
    name: 'Athletic Clay',
    tagline: 'Warm terracotta clay & dark carbon • Classic track heritage',
    primary: '#F06543',
    primaryHover: '#DC5432',
    primaryContrast: '#FFFFFF',
    primaryRgb: '240, 101, 67',
    secondary: '#FDBA74',
    bgCanvas: '#0F0E13',
    bgCard: '#181720',
    borderCard: '#2B2636',
    accentBadge: 'bg-[#F06543]/15 text-[#F06543] border-[#F06543]/30',
    previewGradient: 'from-[#F06543] via-[#DC5432] to-[#9A3412]',
    setupColor: '#FDBA74',
    menuHighlightColor: '#F06543',
    burnedColor: '#EF4444',
  },
  cleanlight: {
    id: 'cleanlight',
    name: 'Studio Day (Light)',
    tagline: 'Crisp studio daylight • Pure chalk white canvas with onyx accents',
    primary: '#0F172A',
    primaryHover: '#1E293B',
    primaryContrast: '#FFFFFF',
    primaryRgb: '15, 23, 42',
    secondary: '#64748B',
    bgCanvas: '#F8FAFC',
    bgCard: '#FFFFFF',
    borderCard: '#E2E8F0',
    accentBadge: 'bg-black/5 text-black border-black/10',
    previewGradient: 'from-[#0F172A] via-[#334155] to-[#64748B]',
    isLight: true,
    setupColor: '#0284C7',
    menuHighlightColor: '#0F172A',
    burnedColor: '#EA580C',
  },
};

export interface CustomComponentColors {
  setupColor?: string;
  menuHighlightColor?: string;
  burnedColor?: string;
}

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeConfig;
  setTheme: (themeId: ThemeId) => void;
  availableThemes: ThemeConfig[];
  setupColor: string;
  menuHighlightColor: string;
  burnedColor: string;
  setSetupColor: (color: string) => void;
  setMenuHighlightColor: (color: string) => void;
  setBurnedColor: (color: string) => void;
  resetComponentColors: () => void;
  isCustomized: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('aurafit_theme') as ThemeId;
    if (saved && THEME_CONFIGS[saved]) {
      return saved;
    }
    // Default to clean Titanium Stealth
    return 'titanium';
  });

  const [customColors, setCustomColors] = useState<CustomComponentColors>(() => {
    try {
      const saved = localStorage.getItem('aurafit_component_colors');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return {};
  });

  const theme = THEME_CONFIGS[themeId] || THEME_CONFIGS.titanium;

  const setupColor = customColors.setupColor || theme.setupColor;
  const menuHighlightColor = customColors.menuHighlightColor || theme.menuHighlightColor;
  const burnedColor = customColors.burnedColor || theme.burnedColor;

  const isCustomized = Boolean(
    customColors.setupColor || customColors.menuHighlightColor || customColors.burnedColor
  );

  const setSetupColor = (color: string) => {
    setCustomColors((prev) => {
      const next = { ...prev, setupColor: color };
      localStorage.setItem('aurafit_component_colors', JSON.stringify(next));
      return next;
    });
  };

  const setMenuHighlightColor = (color: string) => {
    setCustomColors((prev) => {
      const next = { ...prev, menuHighlightColor: color };
      localStorage.setItem('aurafit_component_colors', JSON.stringify(next));
      return next;
    });
  };

  const setBurnedColor = (color: string) => {
    setCustomColors((prev) => {
      const next = { ...prev, burnedColor: color };
      localStorage.setItem('aurafit_component_colors', JSON.stringify(next));
      return next;
    });
  };

  const resetComponentColors = () => {
    setCustomColors({});
    localStorage.removeItem('aurafit_component_colors');
  };

  useEffect(() => {
    localStorage.setItem('aurafit_theme', themeId);
    
    // Apply CSS variables to root element
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-primary-hover', theme.primaryHover);
    root.style.setProperty('--theme-primary-contrast', theme.primaryContrast);
    root.style.setProperty('--theme-primary-rgb', theme.primaryRgb);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-bg-canvas', theme.bgCanvas);
    root.style.setProperty('--theme-bg-card', theme.bgCard);
    root.style.setProperty('--theme-border-card', theme.borderCard);
    
    // Component specific colors
    root.style.setProperty('--theme-setup-color', setupColor);
    root.style.setProperty('--theme-menu-highlight', menuHighlightColor);
    root.style.setProperty('--theme-burned-color', burnedColor);
  }, [themeId, theme, setupColor, menuHighlightColor, burnedColor]);

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme,
        setTheme: setThemeId,
        availableThemes: Object.values(THEME_CONFIGS),
        setupColor,
        menuHighlightColor,
        burnedColor,
        setSetupColor,
        setMenuHighlightColor,
        setBurnedColor,
        resetComponentColors,
        isCustomized,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      themeId: 'titanium' as ThemeId,
      theme: THEME_CONFIGS.titanium,
      setTheme: () => {},
      availableThemes: Object.values(THEME_CONFIGS),
      setupColor: THEME_CONFIGS.titanium.setupColor,
      menuHighlightColor: THEME_CONFIGS.titanium.menuHighlightColor,
      burnedColor: THEME_CONFIGS.titanium.burnedColor,
      setSetupColor: () => {},
      setMenuHighlightColor: () => {},
      setBurnedColor: () => {},
      resetComponentColors: () => {},
      isCustomized: false,
    };
  }
  return context;
};

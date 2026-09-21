import React from 'react';
import { Home, Dumbbell, Camera, User, Sparkles } from 'lucide-react';
import { TabType } from '../types';
import { useTheme } from '../lib/theme';
import { haptics } from '../lib/haptics';

interface PhonePeFooterProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenSpecs: () => void;
}

export const PhonePeFooter: React.FC<PhonePeFooterProps> = ({
  currentTab,
  onSelectTab,
  onOpenSpecs,
}) => {
  const { theme, menuHighlightColor } = useTheme();

  const handleSelectTab = (tab: TabType) => {
    haptics.trigger(tab === 'camera' ? 'medium' : 'selection');
    onSelectTab(tab);
  };

  const handleOpenSpecs = () => {
    haptics.trigger('light');
    onOpenSpecs();
  };

  return (
    <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto pointer-events-none">
      {/* Container with backdrop blur & elevated PhonePe floating camera button */}
      <div className="relative px-4 pb-3 pt-2">
        {/* Navigation Bar shell */}
        <div className="pointer-events-auto relative flex items-center justify-between bg-[#10121A]/95 backdrop-blur-xl border border-[#232838] rounded-3xl px-3 py-1.5 shadow-2xl shadow-black/90">
          
          {/* Left Item 1: Home */}
          <button
            id="tab-btn-home"
            type="button"
            onClick={() => handleSelectTab('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all ${
              currentTab === 'home'
                ? 'font-black'
                : 'text-[#8E95A5] hover:text-white font-medium'
            }`}
            style={currentTab === 'home' ? { 
              color: menuHighlightColor,
              backgroundColor: `${menuHighlightColor}12`
            } : undefined}
          >
            <div className="relative">
              <Home className={`w-5 h-5 transition-transform ${currentTab === 'home' ? 'scale-110' : ''}`} />
            </div>
            <span className="text-[10px] tracking-tight mt-1">
              Home
            </span>
          </button>

          {/* Left Item 2: Types of Exercises */}
          <button
            id="tab-btn-exercises"
            type="button"
            onClick={() => handleSelectTab('exercises')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all ${
              currentTab === 'exercises'
                ? 'font-black'
                : 'text-[#8E95A5] hover:text-white font-medium'
            }`}
            style={currentTab === 'exercises' ? { 
              color: menuHighlightColor,
              backgroundColor: `${menuHighlightColor}12`
            } : undefined}
          >
            <div className="relative">
              <Dumbbell className={`w-5 h-5 transition-transform ${currentTab === 'exercises' ? 'scale-110' : ''}`} />
            </div>
            <span className="text-[10px] tracking-tight mt-1">
              Exercises
            </span>
          </button>

          {/* Center Item: PhonePe style Elevated Floating Camera Button */}
          <div className="relative -top-5 flex flex-col items-center mx-1.5 z-10">
            <button
              id="tab-btn-camera"
              type="button"
              onClick={() => handleSelectTab('camera')}
              aria-label="Camera Scan"
              className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ring-4 ring-[#0A0B0F] ${
                currentTab === 'camera' ? 'scale-105' : 'hover:scale-105 active:scale-95'
              }`}
              style={{
                backgroundColor: menuHighlightColor,
                color: '#0A0B0F',
                boxShadow: `0 8px 24px -2px ${menuHighlightColor}50`
              }}
            >
              {/* Pulsing ring indicator */}
              <span 
                className="absolute -inset-1 rounded-full animate-ping opacity-30 pointer-events-none" 
                style={{ backgroundColor: menuHighlightColor }}
              />
              
              <Camera className="w-6 h-6 stroke-[2.4]" />
            </button>
            <span 
              className="text-[10px] font-extrabold uppercase tracking-wider mt-1 transition-colors"
              style={{ color: currentTab === 'camera' ? menuHighlightColor : '#8E95A5' }}
            >
              Camera
            </span>
          </div>

          {/* Right Item 1: Specs & Wireframes */}
          <button
            id="tab-btn-specs"
            type="button"
            onClick={handleOpenSpecs}
            className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl text-[#8E95A5] hover:text-white transition-all"
            title="View Figma Specs & Color Palette"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-1 font-medium">
              Specs
            </span>
          </button>

          {/* Right Item 2: Me */}
          <button
            id="tab-btn-me"
            type="button"
            onClick={() => handleSelectTab('me')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all ${
              currentTab === 'me'
                ? 'font-black'
                : 'text-[#8E95A5] hover:text-white font-medium'
            }`}
            style={currentTab === 'me' ? { 
              color: menuHighlightColor,
              backgroundColor: `${menuHighlightColor}12`
            } : undefined}
          >
            <div className="relative">
              <User className={`w-5 h-5 transition-transform ${currentTab === 'me' ? 'scale-110' : ''}`} />
            </div>
            <span className="text-[10px] tracking-tight mt-1">
              Me
            </span>
          </button>

        </div>
      </div>
    </nav>
  );
};

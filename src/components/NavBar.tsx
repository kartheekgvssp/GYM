import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import { SensoryBar } from './SensoryBar';
import { Dumbbell, Cloud, HardDrive, LogOut, Sparkles } from 'lucide-react';
import { haptics } from '../lib/haptics';

export const NavBar: React.FC = () => {
  const { signOut, user, isCloudConnected, unit, setUnit } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap rounded-[2px] ${
      isActive
        ? 'bg-[#E8B347] text-[#0E1013]'
        : 'text-[#8B8F98] hover:text-[#EDEEF0] hover:bg-white/[0.03]'
    }`;

  function handleUnitSwitch(newUnit: 'kg' | 'lb') {
    haptics.step();
    setUnit(newUnit);
  }

  return (
    <header className="border-b border-[#22252C] bg-[#15171C] sticky top-0 z-40 shadow-xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          {/* Compact Brand Logo */}
          <NavLink
            to="/"
            onClick={() => haptics.tap()}
            className="flex items-center gap-1.5 py-1 pr-2 group"
          >
            <div className="w-6 h-6 bg-[#0E1013] border border-[#E8B347]/50 flex items-center justify-center text-[#E8B347] group-hover:border-[#E8B347]">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
            <span className="font-display text-xl tracking-wider text-[#EDEEF0]">
              IRON<span className="text-[#E8B347]">LOG</span>
            </span>
          </NavLink>

          {/* Navigation Links */}
          <nav className="flex items-center overflow-x-auto scrollbar-none gap-1 py-0.5">
            <NavLink
              id="nav-dashboard"
              to="/"
              end
              className={linkClass}
              onClick={() => haptics.tap()}
            >
              Dashboard
            </NavLink>
            <NavLink
              id="nav-templates"
              to="/templates"
              className={linkClass}
              onClick={() => haptics.tap()}
            >
              Templates
            </NavLink>
            <NavLink
              id="nav-log"
              to="/log"
              className={linkClass}
              onClick={() => haptics.tap()}
            >
              Log
            </NavLink>
            <NavLink
              id="nav-progress"
              to="/progress"
              className={linkClass}
              onClick={() => haptics.tap()}
            >
              Progress
            </NavLink>
          </nav>
        </div>

        {/* Action Controls & Preferences */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#22252C]">
          <div className="flex items-center gap-1.5">
            {/* Haptics & Sensory Bar */}
            <SensoryBar />

            {/* kg / lb unit switcher */}
            <div className="flex items-center border border-[#22252C] bg-[#0E1013] text-[10px] font-mono rounded-[2px] overflow-hidden">
              <button
                id="unit-kg-btn"
                type="button"
                onClick={() => handleUnitSwitch('kg')}
                className={`px-1.5 py-0.5 font-bold transition-colors ${
                  unit === 'kg' ? 'bg-[#E8B347] text-[#0E1013]' : 'text-[#8B8F98] hover:text-[#EDEEF0]'
                }`}
                title="Use Kilograms (kg)"
              >
                KG
              </button>
              <button
                id="unit-lb-btn"
                type="button"
                onClick={() => handleUnitSwitch('lb')}
                className={`px-1.5 py-0.5 font-bold transition-colors ${
                  unit === 'lb' ? 'bg-[#E8B347] text-[#0E1013]' : 'text-[#8B8F98] hover:text-[#EDEEF0]'
                }`}
                title="Use Pounds (lb)"
              >
                LB
              </button>
            </div>

            <PWAInstallButton />
          </div>

          <div className="flex items-center gap-1 pl-1">
            <button
              id="sign-out-btn"
              onClick={() => {
                haptics.tap();
                signOut();
              }}
              className="btn-ghost text-[11px] py-1 px-2 flex items-center gap-1 text-[#8B8F98] hover:text-[#EDEEF0] border-[#22252C]"
              title="Sign out of athlete profile"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

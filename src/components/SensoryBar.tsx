import React, { useEffect, useState } from 'react';
import { Smartphone, Volume2, VolumeX, Vibrate, Check, Sparkles } from 'lucide-react';
import { haptics } from '../lib/haptics';

export const SensoryBar: React.FC = () => {
  const [hapticOn, setHapticOn] = useState<boolean>(haptics.isHapticsEnabled);
  const [soundOn, setSoundOn] = useState<boolean>(haptics.isSoundEnabled);
  const [tested, setTested] = useState<boolean>(false);

  useEffect(() => {
    function onSensoryChange() {
      setHapticOn(haptics.isHapticsEnabled);
      setSoundOn(haptics.isSoundEnabled);
    }
    window.addEventListener('ironlog_sensory_changed', onSensoryChange);
    return () => window.removeEventListener('ironlog_sensory_changed', onSensoryChange);
  }, []);

  function toggleHaptics() {
    const next = !hapticOn;
    haptics.setHapticsEnabled(next);
    setHapticOn(next);
  }

  function toggleSound() {
    const next = !soundOn;
    haptics.setSoundEnabled(next);
    setSoundOn(next);
  }

  function testHapticPulse() {
    haptics.prCelebration();
    setTested(true);
    setTimeout(() => setTested(false), 2000);
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono">
      {/* Haptic Toggle Pill */}
      <button
        type="button"
        id="toggle-haptics-btn"
        onClick={toggleHaptics}
        className={`px-2 py-1 flex items-center gap-1 border rounded-[2px] transition-colors ${
          hapticOn
            ? 'border-[#E8B347]/50 text-[#E8B347] bg-[#E8B347]/10'
            : 'border-[#22252C] text-[#8B8F98] bg-[#0E1013]'
        }`}
        title={
          haptics.isVibrateSupported
            ? 'Haptics active (physical vibration + tactile click)'
            : 'Sensory click active (hardware vibration unsupported on this device)'
        }
      >
        <Vibrate className="w-3 h-3 shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {hapticOn ? 'Haptic ON' : 'Haptic OFF'}
        </span>
      </button>

      {/* Quick Test Trigger */}
      <button
        type="button"
        id="test-haptics-btn"
        onClick={testHapticPulse}
        className="px-1.5 py-1 text-[10px] uppercase font-semibold text-[#8B8F98] hover:text-[#EDEEF0] border border-[#22252C] bg-[#0E1013] rounded-[2px] transition-all hover:border-[#E8B347]/40 flex items-center gap-1"
        title="Test sensory feedback"
      >
        {tested ? <Check className="w-2.5 h-2.5 text-[#6FCF97]" /> : <Sparkles className="w-2.5 h-2.5 text-[#E8B347]" />}
        <span>{tested ? 'Fired!' : 'Pulse'}</span>
      </button>
    </div>
  );
};

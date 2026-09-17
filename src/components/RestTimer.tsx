import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Timer as TimerIcon, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { haptics } from '../lib/haptics';

const PRESETS = [60, 90, 120, 180];

interface RestTimerProps {
  onComplete?: () => void;
  sticky?: boolean;
}

export const RestTimer: React.FC<RestTimerProps> = ({ onComplete, sticky = false }) => {
  const [duration, setDuration] = useState<number>(90);
  const [remaining, setRemaining] = useState<number>(90);
  const [running, setRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(haptics.isSoundEnabled);
  const [minimized, setMinimized] = useState<boolean>(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 4 && r > 1) {
            // Tactile countdown tick on last 3 seconds
            haptics.timerTick();
          }
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            // Powerful finish haptic & buzzer alarm
            haptics.timerComplete();
            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onComplete]);

  function start() {
    haptics.tap();
    if (remaining === 0) {
      setRemaining(duration);
    }
    setRunning(true);
  }

  function pause() {
    haptics.tap();
    setRunning(false);
  }

  function reset() {
    haptics.step();
    setRunning(false);
    setRemaining(duration);
  }

  function selectPreset(sec: number) {
    haptics.step();
    setDuration(sec);
    setRemaining(sec);
    setRunning(false);
  }

  function adjustTime(delta: number) {
    haptics.step();
    setRemaining((r) => Math.max(0, r + delta));
    setDuration((d) => Math.max(0, d + delta));
  }

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    haptics.setSoundEnabled(next);
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = duration > 0 ? (remaining / duration) * 100 : 0;
  const isFinished = remaining === 0 && !running;

  if (minimized) {
    return (
      <div
        id="rest-timer-compact"
        className="card px-3 py-2 bg-[#15171C] border border-[#22252C] flex items-center justify-between shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${running ? 'bg-[#E8B347] animate-ping' : isFinished ? 'bg-[#6FCF97]' : 'bg-[#8B8F98]'}`} />
          <span className="font-mono text-sm font-bold tracking-tight text-[#EDEEF0]">
            REST {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] font-mono text-[#8B8F98]">({duration}s)</span>
        </div>

        <div className="flex items-center gap-1.5">
          {!running ? (
            <button
              onClick={start}
              className="px-2 py-1 bg-[#E8B347] text-[#14151A] text-[11px] font-bold uppercase rounded-[2px] flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-current" /> Start
            </button>
          ) : (
            <button
              onClick={pause}
              className="px-2 py-1 bg-[#2D313A] text-[#EDEEF0] text-[11px] font-bold uppercase rounded-[2px] flex items-center gap-1"
            >
              <Pause className="w-3 h-3 fill-current" /> Pause
            </button>
          )}
          <button
            onClick={() => adjustTime(30)}
            className="px-1.5 py-1 text-[11px] font-mono text-[#8B8F98] hover:text-[#EDEEF0] border border-[#22252C]"
            title="+30s"
          >
            +30s
          </button>
          <button
            onClick={() => setMinimized(false)}
            className="p-1 text-[#8B8F98] hover:text-[#EDEEF0]"
            title="Expand timer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="rest-timer-widget"
      className={`card p-3 sm:p-3.5 bg-[#15171C] border transition-colors ${
        isFinished
          ? 'border-[#6FCF97]/60 shadow-[0_0_15px_rgba(111,207,151,0.15)]'
          : running
          ? 'border-[#E8B347]/50'
          : 'border-[#22252C]'
      }`}
    >
      {/* Sleek Low-Profile Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#22252C]">
        <div className="flex items-center gap-2">
          <TimerIcon className={`w-3.5 h-3.5 ${running ? 'text-[#E8B347] animate-pulse' : 'text-[#8B8F98]'}`} />
          <span className="font-display text-sm tracking-wider uppercase text-[#EDEEF0]">
            Rest Countdown
          </span>
          {isFinished && (
            <span className="text-[10px] font-mono text-[#6FCF97] font-semibold uppercase px-1.5 py-0.2 border border-[#6FCF97]/40 bg-[#6FCF97]/10">
              Ready for Next Set!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-timer-sound-btn"
            onClick={toggleSound}
            className="text-[#8B8F98] hover:text-[#EDEEF0] p-1 text-xs flex items-center gap-1"
            title={soundEnabled ? 'Sensory sounds enabled' : 'Sensory sounds muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#E8B347]" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="text-[#8B8F98] hover:text-[#EDEEF0] p-1 text-xs"
            title="Minimize to low-profile strip"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Timer Display Row (Low profile) */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-baseline gap-2">
          <div className="font-display text-3xl sm:text-4xl tabular-nums font-bold tracking-tight text-[#EDEEF0]">
            {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
          </div>
          <span className="text-[11px] font-mono text-[#8B8F98]">/ {duration}s</span>
        </div>

        {/* Quick Steppers & Presets in a single sleek line */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => adjustTime(-15)}
            className="btn-ghost text-[11px] py-1 px-1.5 border-[#22252C] text-[#8B8F98]"
            title="-15s"
          >
            -15s
          </button>
          <button
            onClick={() => adjustTime(15)}
            className="btn-ghost text-[11px] py-1 px-1.5 border-[#22252C] text-[#8B8F98]"
            title="+15s"
          >
            +15s
          </button>
          <div className="h-4 w-px bg-[#22252C] mx-0.5" />
          {PRESETS.map((p) => (
            <button
              key={p}
              id={`timer-preset-${p}`}
              className={`text-[11px] py-1 px-2 font-mono border rounded-[2px] transition-all ${
                duration === p && !running
                  ? 'border-[#E8B347] text-[#14151A] bg-[#E8B347] font-bold'
                  : 'border-[#22252C] text-[#8B8F98] hover:text-[#EDEEF0]'
              }`}
              onClick={() => selectPreset(p)}
            >
              {p}s
            </button>
          ))}
        </div>
      </div>

      {/* Sleek Line Progress indicator */}
      <div className="w-full h-1 bg-[#0E1013] overflow-hidden mb-3 rounded-[1px]">
        <div
          className={`h-full transition-all duration-300 ${
            pct < 20 ? 'bg-[#6FCF97]' : 'bg-[#E8B347]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Primary Actions */}
      <div className="flex gap-2">
        {!running ? (
          <button
            id="timer-start-btn"
            className="btn-primary flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
            onClick={start}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{remaining < duration && remaining > 0 ? 'Resume Rest' : 'Start Rest'}</span>
          </button>
        ) : (
          <button
            id="timer-pause-btn"
            className="btn-primary flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5 bg-[#C4952F]"
            onClick={pause}
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>Pause</span>
          </button>
        )}
        <button
          id="timer-reset-btn"
          className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1 border-[#22252C] text-[#8B8F98] hover:text-[#EDEEF0]"
          onClick={reset}
          title="Reset timer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

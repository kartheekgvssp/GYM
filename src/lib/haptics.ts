/**
 * Haptic feedback utility service using the Web Vibration API.
 * Provides tactile response on user interactions, gated by browser support checks
 * and user preferences.
 */

export type HapticPattern = 
  | 'light'        // Subtle tick for general button taps / selections
  | 'medium'       // Standard click for action buttons (start, add, toggle)
  | 'heavy'        // Strong bump for prominent actions (finish, modal open)
  | 'success'      // Double pulse for successful saves / workout completion
  | 'warning'      // Attention pattern for pause, reset, or warnings
  | 'selection'    // Micro vibration for tab/slider adjustments
  | 'celebration'; // Celebratory multi-pulse for workout complete

// Defined vibration millisecond durations
const HAPTIC_PRESETS: Record<HapticPattern, number | number[]> = {
  selection: 10,
  light: 15,
  medium: 35,
  heavy: 60,
  success: [30, 60, 45],
  warning: [50, 40, 50],
  celebration: [40, 60, 60, 60, 100, 80, 120],
};

class HapticService {
  private isSupported: boolean;
  private enabled: boolean = true;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
    
    // Check localStorage preference if previously toggled
    if (typeof window !== 'undefined') {
      const storedPref = localStorage.getItem('haptics_enabled');
      if (storedPref !== null) {
        this.enabled = storedPref === 'true';
      }
    }
  }

  /**
   * Check if Vibration API is available on the current device/browser.
   */
  public hasSupport(): boolean {
    return this.isSupported;
  }

  /**
   * Check if haptic feedback is currently enabled.
   */
  public isEnabled(): boolean {
    return this.isSupported && this.enabled;
  }

  /**
   * Enable or disable haptic feedback.
   */
  public setEnabled(val: boolean): void {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem('haptics_enabled', String(val));
    }
  }

  /**
   * Trigger a named haptic pattern or custom millisecond array.
   */
  public trigger(pattern: HapticPattern | number | number[] = 'light'): boolean {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      let vibrationPattern: number | number[];

      if (typeof pattern === 'string') {
        vibrationPattern = HAPTIC_PRESETS[pattern] || HAPTIC_PRESETS.light;
      } else {
        vibrationPattern = pattern;
      }

      return navigator.vibrate(vibrationPattern);
    } catch {
      // Gracefully handle any browser security context / user-gesture restrictions
      return false;
    }
  }

  /**
   * Shortcut for tap / click feedback
   */
  public tap(): boolean {
    return this.trigger('light');
  }

  /**
   * Shortcut for workout completion celebration
   */
  public workoutComplete(): boolean {
    return this.trigger('celebration');
  }

  /**
   * Shortcut for success confirmations
   */
  public success(): boolean {
    return this.trigger('success');
  }

  /**
   * Stop any active vibrations
   */
  public cancel(): void {
    if (this.isSupported) {
      try {
        navigator.vibrate(0);
      } catch {
        // ignore
      }
    }
  }
}

export const haptics = new HapticService();

export default haptics;

import React, { useState } from 'react';
import { TabType, Exercise, WorkoutSession, DayWorkoutPlan, Weekday } from './types';
import { INITIAL_STATS, EXERCISE_DATABASE, DEFAULT_WEEKLY_PLAN } from './data/mockData';
import { HomeScreen } from './components/HomeScreen';
import { ExercisesView } from './components/ExercisesView';
import { CameraView } from './components/CameraView';
import { MeProfileView } from './components/MeProfileView';
import { ActiveWorkoutScreen } from './components/ActiveWorkoutScreen';
import { PhonePeFooter } from './components/PhonePeFooter';
import { PWAInstallModal } from './components/PWAInstallModal';
import { FigmaDesignSystemModal } from './components/FigmaDesignSystemModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { WeeklySetupModal } from './components/WeeklySetupModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [isWeeklySetupOpen, setIsWeeklySetupOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [stats, setStats] = useState(INITIAL_STATS);

  // Weekly workout setup state (stored in local state, persists across view changes)
  const [weeklyPlan, setWeeklyPlan] = useState<DayWorkoutPlan[]>(() => {
    const saved = localStorage.getItem('aurafit_weekly_plan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_WEEKLY_PLAN;
      }
    }
    return DEFAULT_WEEKLY_PLAN;
  });

  // Calculate current weekday
  const weekdayNames: Weekday[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayWeekday = weekdayNames[new Date().getDay()];
  const todayPlan = weeklyPlan.find(p => p.day === todayWeekday) || weeklyPlan[0];

  const handleSaveWeeklyPlan = (updatedPlan: DayWorkoutPlan[]) => {
    setWeeklyPlan(updatedPlan);
    localStorage.setItem('aurafit_weekly_plan', JSON.stringify(updatedPlan));
  };

  const handleStartWorkout = (workout: WorkoutSession) => {
    setActiveWorkout(workout);
  };

  const handleQuickStartExercise = (exercise: Exercise) => {
    // Create an ad-hoc session focused on this exercise
    const customWorkout: WorkoutSession = {
      id: `workout-${exercise.id}`,
      title: `${exercise.name} Protocol`,
      focus: `${exercise.muscleGroup} Focus`,
      estimatedMinutes: 25,
      difficulty: exercise.difficulty,
      calories: exercise.caloriesBurn * 2,
      bannerImage: exercise.image,
      exercises: [exercise, ...EXERCISE_DATABASE.filter((e) => e.muscleGroup === exercise.muscleGroup && e.id !== exercise.id).slice(0, 2)],
    };
    setActiveWorkout(customWorkout);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#EDEEF0] flex flex-col font-sans selection:bg-[var(--theme-primary)] selection:text-[var(--theme-primary-contrast)]">
      {/* Offline connectivity alert if network disconnects */}
      <OfflineIndicator />

      {/* Main Screen Container - Scaled to mobile ergonomics with desktop centering */}
      <main className="flex-1 w-full max-w-md mx-auto relative bg-[#0A0B0F]">
        {/* Render Tab Content */}
        {currentTab === 'home' && (
          <HomeScreen
            stats={stats}
            weeklyPlan={weeklyPlan}
            todayPlan={todayPlan}
            onOpenWeeklySetup={() => setIsWeeklySetupOpen(true)}
            onOpenThemeSelector={() => setIsThemeModalOpen(true)}
            onStartWorkout={handleStartWorkout}
            onSelectExercise={handleQuickStartExercise}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onOpenSpecs={() => setIsSpecsModalOpen(true)}
          />
        )}

        {currentTab === 'exercises' && (
          <ExercisesView
            onSelectExercise={handleQuickStartExercise}
            onQuickStart={handleQuickStartExercise}
          />
        )}

        {currentTab === 'camera' && (
          <CameraView onClose={() => setCurrentTab('home')} />
        )}

        {currentTab === 'me' && (
          <MeProfileView
            weeklyPlan={weeklyPlan}
            stats={stats}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onOpenSpecs={() => setIsSpecsModalOpen(true)}
            onOpenThemeSelector={() => setIsThemeModalOpen(true)}
          />
        )}

        {/* ACTIVE WORKOUT TRACKING SCREEN (Outlined & Interactive) */}
        {activeWorkout && (
          <ActiveWorkoutScreen
            workout={activeWorkout}
            onClose={() => setActiveWorkout(null)}
          />
        )}
      </main>

      {/* FOOTER MENU SIMILAR TO PHONEPE APP WITH CAMERA OPTION IN THE MIDDLE */}
      {/* Rendered whenever the camera is not fullscreen and active workout is closed */}
      {!activeWorkout && currentTab !== 'camera' && (
        <PhonePeFooter
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenSpecs={() => setIsSpecsModalOpen(true)}
        />
      )}

      {/* WEEKLY WORKOUT SETUP MODAL */}
      <WeeklySetupModal
        isOpen={isWeeklySetupOpen}
        onClose={() => setIsWeeklySetupOpen(false)}
        weeklyPlan={weeklyPlan}
        onSavePlan={handleSaveWeeklyPlan}
        initialSelectedDay={todayWeekday}
      />

      {/* THEME COLOR SYSTEM SELECTOR MODAL */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* PWA INSTALL MODAL (iOS & Android) */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* FIGMA DESIGN SYSTEM, COLOR PALETTE & WIREFRAME MODAL */}
      <FigmaDesignSystemModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
      />
    </div>
  );
}

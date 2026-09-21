import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { TabType, Exercise, WorkoutSession, DayWorkoutPlan, Weekday, AuthUser } from './types';
import { INITIAL_STATS, EXERCISE_DATABASE, DEFAULT_WEEKLY_PLAN } from './data/mockData';
import { auth, loadUserWorkoutData, saveUserWorkoutData } from './lib/firebase';
import { seedRequestedUsers } from './lib/seedUsers';
import { AuthScreen } from './components/AuthScreen';
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
import { haptics } from './lib/haptics';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [isWeeklySetupOpen, setIsWeeklySetupOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // User-isolated state
  const [stats, setStats] = useState(INITIAL_STATS);
  const [weeklyPlan, setWeeklyPlan] = useState<DayWorkoutPlan[]>(DEFAULT_WEEKLY_PLAN);

  // 1. Listen for Firebase Auth changes and seed initial requested accounts
  useEffect(() => {
    // Seed requested accounts in Firebase Auth and Firestore quietly
    seedRequestedUsers().catch((e) => console.warn('Seed error', e));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Derive clean username or phone number
        const rawAccount = firebaseUser.email 
          ? firebaseUser.email.replace('user_', '').replace('@aurafit.app', '') 
          : '';
        const userObj: AuthUser = {
          uid: firebaseUser.uid,
          phoneNumber: rawAccount || (firebaseUser.phoneNumber || 'Athlete Account'),
          displayName: firebaseUser.displayName || rawAccount || 'Athlete',
        };
        setCurrentUser(userObj);

        // Load strictly isolated user data
        const { weeklyPlan: userPlan, stats: userStats } = await loadUserWorkoutData(firebaseUser.uid);
        setWeeklyPlan(userPlan);
        setStats(userStats);
      } else {
        setCurrentUser(null);
        // Reset to initial clean state when logged out to prevent data leakage
        setWeeklyPlan(DEFAULT_WEEKLY_PLAN);
        setStats(INITIAL_STATS);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    haptics.trigger('selection');
    try {
      await fbSignOut(auth);
      setCurrentUser(null);
      setWeeklyPlan(DEFAULT_WEEKLY_PLAN);
      setStats(INITIAL_STATS);
      setCurrentTab('home');
      setActiveWorkout(null);
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  // Calculate current weekday
  const weekdayNames: Weekday[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayWeekday = weekdayNames[new Date().getDay()];
  const todayPlan = weeklyPlan.find(p => p.day === todayWeekday) || weeklyPlan[0];

  const handleSaveWeeklyPlan = async (updatedPlan: DayWorkoutPlan[]) => {
    setWeeklyPlan(updatedPlan);
    if (currentUser) {
      await saveUserWorkoutData(currentUser.uid, updatedPlan, stats);
    }
  };

  const handleStartWorkout = (workout: WorkoutSession) => {
    setActiveWorkout(workout);
  };

  const handleQuickStartExercise = (exercise: Exercise) => {
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

  // 2. Loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0A0B0F] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-[#38BDF8] border-t-transparent rounded-full animate-spin mb-3" />
        <div className="text-xs uppercase tracking-widest font-black text-[#8E95A5]">
          Securing Private Vault...
        </div>
      </div>
    );
  }

  // 3. Pre-login screen: Render AuthScreen if user is not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0B0F] text-[#EDEEF0] flex flex-col font-sans">
        <OfflineIndicator />
        <AuthScreen onSuccess={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#EDEEF0] flex flex-col font-sans selection:bg-[var(--theme-primary)] selection:text-[var(--theme-primary-contrast)]">
      {/* Offline connectivity alert if network disconnects */}
      <OfflineIndicator />

      {/* Main Screen Container - Scaled to mobile ergonomics with desktop centering */}
      <main className="flex-1 w-full max-w-md mx-auto relative bg-[#0A0B0F]">
        {/* Render Tab Content */}
        {currentTab === 'home' && (
          <HomeScreen
            user={currentUser}
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
            user={currentUser}
            onSignOut={handleSignOut}
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


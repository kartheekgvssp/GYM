import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { NavBar } from './components/NavBar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Templates } from './pages/Templates';
import { LogSession } from './pages/LogSession';
import { Progress } from './pages/Progress';
import { Dumbbell } from 'lucide-react';

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function SplashLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#14151A] text-[#8B8F98] gap-3">
      <div className="w-12 h-12 bg-[#1E2027] border border-[#E8B347] flex items-center justify-center text-[#E8B347] animate-pulse">
        <Dumbbell className="w-6 h-6" />
      </div>
      <div className="font-display text-2xl tracking-widest text-[#EDEEF0] uppercase">
        Loading <span className="text-[#E8B347]">Iron Log</span>...
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#14151A] text-[#EDEEF0] font-body flex flex-col selection:bg-[#E8B347] selection:text-[#14151A]">
      {user && <NavBar />}
      <OfflineIndicator />
      <main className="flex-1 pb-12">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" replace /> : <Signup />}
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <PrivateRoute>
                <Templates />
              </PrivateRoute>
            }
          />
          <Route
            path="/log"
            element={
              <PrivateRoute>
                <LogSession />
              </PrivateRoute>
            }
          />
          <Route
            path="/log/:templateId"
            element={
              <PrivateRoute>
                <LogSession />
              </PrivateRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <PrivateRoute>
                <Progress />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ThemeProvider } from './contexts/ThemeContext'
import { Login, SignUp, TradeRegistration } from './pages'
import Dashboard from './pages/Dashboard';
import SorosSimulation from './pages/SorosSimulation'
import HistoryPage from './pages/HistoryPage'
import { LoadingSpinner, AccountBlockedAlert } from './components/ui'
import { ErrorBoundary } from './components/ErrorBoundary'
import AuthConfirm from './components/AuthConfirm'
import { DashboardTest } from './test/DashboardTest'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Verificando autenticação..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Verificando autenticação..." />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// App Content Component
const AppContent: React.FC = () => {
  const { user, loading, accountBlocked, clearAccountBlocked } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-white text-lg">Verificando autenticação...</span>
        <AccountBlockedAlert
          isVisible={accountBlocked.isBlocked}
          message={accountBlocked.message}
          onClose={clearAccountBlocked}
        />
      </div>
    )
  }

  return (
    <>
      <Routes>
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trade-registration"
          element={
            <ProtectedRoute>
              <TradeRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/soros"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <SorosSimulation />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <HistoryPage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test"
          element={
            <ErrorBoundary>
              <DashboardTest />
            </ErrorBoundary>
          }
        />
        
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        
        {/* Auth confirmation route */}
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AccountBlockedAlert
        isVisible={accountBlocked.isBlocked}
        message={accountBlocked.message}
        onClose={clearAccountBlocked}
      />
    </>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <div className="App">
            <AppContent />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
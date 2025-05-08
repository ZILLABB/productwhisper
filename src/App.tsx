import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import constants
import { ROUTES } from './constants/routes';

// Import components
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import { MainLayout } from './layouts';

/**
 * Lazy-loaded page components to improve initial load time
 */
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const TrendsPage = lazy(() => import('./pages/TrendsPage'));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
// Commented out pages that are not currently needed
// const ProfilePage = lazy(() => import('./pages/ProfilePage'));
// const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
// const DashboardPage = lazy(() => import('./pages/DashboardPage'));

/**
 * Loading fallback component shown while pages are loading
 */
const PageLoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <LoadingSpinner size="large" text="Loading page..." />
  </div>
);

/**
 * Main App component that sets up routing
 */
function App() {
  // Helper function to wrap page components with ErrorBoundary and Suspense
  const withErrorBoundaryAndSuspense = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
    <ErrorBoundary>
      <Suspense fallback={<PageLoadingFallback />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Home Page */}
            <Route index element={withErrorBoundaryAndSuspense(HomePage)} />

            {/* Main Pages */}
            <Route path="search" element={withErrorBoundaryAndSuspense(SearchPage)} />
            <Route path="trends" element={withErrorBoundaryAndSuspense(TrendsPage)} />
            <Route path="compare" element={withErrorBoundaryAndSuspense(ComparisonPage)} />
            <Route path="about" element={withErrorBoundaryAndSuspense(AboutPage)} />
            <Route path="contact" element={withErrorBoundaryAndSuspense(ContactPage)} />
            <Route path="product/:id" element={withErrorBoundaryAndSuspense(ProductPage)} />

            {/* Commented out pages that are not currently needed */}
            {/* <Route path="profile" element={withErrorBoundaryAndSuspense(ProfilePage)} /> */}
            {/* <Route path="notifications" element={withErrorBoundaryAndSuspense(NotificationsPage)} /> */}
            {/* <Route path="dashboard" element={withErrorBoundaryAndSuspense(DashboardPage)} /> */}
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

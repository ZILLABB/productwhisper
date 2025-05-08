import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MemoryBank from '../components/common/MemoryBank';
import ErrorBoundary from '../components/common/ErrorBoundary';

/**
 * MainLayout component that wraps all pages with header, footer, and common elements
 */
const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />

      {/* Memory Bank (floating component) */}
      <MemoryBank />
    </div>
  );
};

export default MainLayout;

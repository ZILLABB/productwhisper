import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';

interface CompactLayoutProps {
  /**
   * Whether to use reduced padding for content
   */
  reducedPadding?: boolean;
  
  /**
   * Whether to use a narrower max-width for content
   */
  narrow?: boolean;
  
  /**
   * Whether to use a condensed header
   */
  condensedHeader?: boolean;
  
  /**
   * Whether to use a condensed footer
   */
  condensedFooter?: boolean;
  
  /**
   * Background color/gradient class
   */
  bgClass?: string;
}

/**
 * CompactLayout provides a more space-efficient layout option
 * with configurable padding, width, and header/footer options
 */
const CompactLayout: React.FC<CompactLayoutProps> = ({
  reducedPadding = false,
  narrow = false,
  condensedHeader = false,
  condensedFooter = false,
  bgClass = 'bg-gray-50'
}) => {
  return (
    <div className={`flex flex-col min-h-screen ${bgClass}`}>
      <Header condensed={condensedHeader} />
      <main 
        className={`flex-1 w-full ${narrow ? 'max-w-5xl' : 'max-w-7xl'} mx-auto 
        ${reducedPadding ? 'px-3 sm:px-4 py-4' : 'px-4 sm:px-6 lg:px-8 py-6'}`}
      >
        <Outlet />
      </main>
      <Footer condensed={condensedFooter} />
    </div>
  );
};

export default CompactLayout;

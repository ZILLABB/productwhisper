import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiMenu,
  FiX,
  FiSearch,
  FiBarChart2,
  FiRefreshCw,
  FiChevronDown,
  FiBell,
  FiSettings
} from 'react-icons/fi';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/', icon: null },
    { name: 'Search', path: '/search', icon: <FiSearch className="mr-2" /> },
    { name: 'Trends', path: '/trends', icon: <FiBarChart2 className="mr-2" /> },
    { name: 'Compare', path: '/compare', icon: <FiRefreshCw className="mr-2" /> },
  ];

  // Secondary navigation items
  const secondaryNavItems = [
    { name: 'About', path: '/about', icon: null },
    { name: 'Contact', path: '/contact', icon: null },
  ];

  // Check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
          : 'bg-white/90 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center font-display text-2xl font-bold text-primary hover:opacity-90 transition-opacity"
            >
              <img
                src="/ProductWhisper Logo Design.png"
                alt="ProductWhisper Logo"
                className="h-10 w-10 rounded-full mr-3 object-cover shadow-md border border-gray-100"
              />
              <div className="flex flex-col leading-none">
                <span className="text-primary font-bold">Product<span className="text-secondary">Whisper</span></span>
                <span className="text-xs text-gray-500 font-normal mt-0.5">Sentiment Analysis</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <div className="flex items-center space-x-1 mr-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary transition-all duration-200"
              >
                More
                <FiChevronDown className={`ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <div className="py-1">
                      {secondaryNavItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`block px-4 py-2 text-sm ${
                            isActive(item.path)
                              ? 'bg-primary/10 text-primary'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification and user buttons */}
            <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
              <button className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 transition-all duration-200">
                <FiBell size={20} />
              </button>
              <button className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 transition-all duration-200 ml-1">
                <FiSettings size={20} />
              </button>
              {/* Login/Signup buttons removed */}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <Link
              to="/search"
              className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 transition-all duration-200"
              aria-label="Search"
            >
              <FiSearch size={20} />
            </Link>
            <button
              className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 transition-all duration-200"
            >
              <FiBell size={20} />
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full text-gray-700 hover:text-primary hover:bg-gray-100 transition-all duration-200"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-4 pt-4 border-t border-gray-200 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 mb-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}

                {secondaryNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile auth buttons removed */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;

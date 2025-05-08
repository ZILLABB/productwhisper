/**
 * Application route constants
 * 
 * This file contains all the route paths used in the application
 * to ensure consistency and avoid typos when referencing routes.
 */

export const ROUTES = {
  // Main pages
  HOME: '/',
  SEARCH: '/search',
  TRENDS: '/trends',
  COMPARE: '/compare',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRODUCT: '/product/:id',
  
  // Helper function to generate product page URL with ID
  getProductRoute: (id: string | number) => `/product/${id}`,
  
  // Currently unused pages
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  DASHBOARD: '/dashboard',
};

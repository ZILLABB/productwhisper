import { Memory } from '../components/common/MemoryBank';

// Create initial memories with project information
export const initialMemories: Memory[] = [
  {
    id: '1',
    content: 'ProductWhisper is a sentiment analysis application for product reviews with modern design, using React, TypeScript, Tailwind CSS, and Framer Motion.',
    category: 'Product',
    createdAt: new Date()
  },
  {
    id: '2',
    content: 'Pages created: AboutPage.tsx, ContactPage.tsx, ComparisonPage.tsx, TrendsPage.tsx. Pages remaining: LoginPage.tsx, RegisterPage.tsx, ProfilePage.tsx, NotificationsPage.tsx, DashboardPage.tsx.',
    category: 'Frontend',
    createdAt: new Date()
  },
  {
    id: '3',
    content: 'Components created: LoadingSpinner.tsx, Toast.tsx, Header.tsx, Footer.tsx, ProtectedRoute.tsx. Contexts created: AuthContext.tsx, SearchContext.tsx, NotificationContext.tsx, SocketContext.tsx.',
    category: 'Frontend',
    createdAt: new Date()
  },
  {
    id: '4',
    content: 'Services created: api.ts, notificationService.ts. The application uses a modern design with premium colors and fonts.',
    category: 'Frontend',
    createdAt: new Date()
  },
  {
    id: '5',
    content: 'Backend structure: The backend uses Express.js with controllers, services, and routes. It includes endpoints for product data, sentiment analysis, trend analysis, and user authentication.',
    category: 'Backend',
    createdAt: new Date()
  },
  {
    id: '6',
    content: 'The TrendsPage has been updated to use the actual API endpoints from the backend, with fallback to mock data for development. It displays sentiment trends, mention counts, and aspect analysis for products.',
    category: 'Feature',
    createdAt: new Date()
  },
  {
    id: '7',
    content: 'The ComparisonPage has been updated to use the actual API endpoints from the backend, with fallback to mock data for development. It allows users to compare multiple products side by side.',
    category: 'Feature',
    createdAt: new Date()
  },
  {
    id: '8',
    content: 'Design preferences: Modern design with premium colors and fonts. The user prefers a modern and professional design for the contact page.',
    category: 'Design',
    createdAt: new Date()
  },
  {
    id: '9',
    content: 'The user prefers a modernized design for the search products page with a smaller filter section and more content.',
    category: 'Design',
    createdAt: new Date()
  },
  {
    id: '10',
    content: 'The user prefers more animations on the landing page and has a logo in the public directory that should be used as the application logo with a rounded style.',
    category: 'Design',
    createdAt: new Date()
  }
];

// Function to initialize memories in localStorage if they don't exist
export const initializeMemories = (): void => {
  const storedMemories = localStorage.getItem('productWhisperMemories');
  
  if (!storedMemories) {
    localStorage.setItem('productWhisperMemories', JSON.stringify(initialMemories));
  }
};

export default initialMemories;

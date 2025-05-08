import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple layout component
const SimpleLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <header style={{ 
        backgroundColor: '#333', 
        color: 'white', 
        padding: '1rem',
        textAlign: 'center'
      }}>
        <h1>ProductWhisper</h1>
      </header>
      <main style={{ flex: 1, padding: '1rem' }}>
        {children}
      </main>
      <footer style={{ 
        backgroundColor: '#333', 
        color: 'white', 
        padding: '1rem',
        textAlign: 'center'
      }}>
        &copy; 2023 ProductWhisper
      </footer>
    </div>
  );
};

// Simple pages
const HomePage: React.FC = () => (
  <div>
    <h2>Home Page</h2>
    <p>Welcome to ProductWhisper!</p>
  </div>
);

const AboutPage: React.FC = () => (
  <div>
    <h2>About Page</h2>
    <p>This is a simplified version of the ProductWhisper app.</p>
  </div>
);

const SimpleApp: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <SimpleLayout>
            <Routes>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
            </Routes>
          </SimpleLayout>
        } />
      </Routes>
    </Router>
  );
};

export default SimpleApp;

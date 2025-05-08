import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContentContainer } from './components/layout';
import { Button, Card } from './components/common';

// Simple layout component
const SimpleLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-primary">ProductWhisper</h1>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          &copy; 2023 ProductWhisper
        </div>
      </footer>
    </div>
  );
};

// Simple pages
const HomePage: React.FC = () => (
  <ContentContainer maxWidth="lg" padding="md" center>
    <Card variant="elevated" padding="lg">
      <h2 className="text-xl font-bold mb-4">Home Page</h2>
      <p className="mb-4">Welcome to ProductWhisper!</p>
      <Button variant="primary">Get Started</Button>
    </Card>
  </ContentContainer>
);

const AboutPage: React.FC = () => (
  <ContentContainer maxWidth="lg" padding="md" center>
    <Card variant="elevated" padding="lg">
      <h2 className="text-xl font-bold mb-4">About Page</h2>
      <p className="mb-4">This is a simplified version of the ProductWhisper app.</p>
      <Button variant="secondary">Learn More</Button>
    </Card>
  </ContentContainer>
);

const TestPage: React.FC = () => (
  <ContentContainer maxWidth="lg" padding="md" center>
    <Card variant="elevated" padding="lg">
      <h2 className="text-xl font-bold mb-4">Test Page</h2>
      <p className="mb-4">This is a test page to verify components are working.</p>
      <div className="flex space-x-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
    </Card>
  </ContentContainer>
);

const SimplifiedApp: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleLayout>
          <Routes>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="test" element={<TestPage />} />
          </Routes>
        </SimpleLayout>} />
      </Routes>
    </Router>
  );
};

export default SimplifiedApp;

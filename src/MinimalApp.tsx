import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const HomePage = () => (
  <div style={{ padding: '20px' }}>
    <h1>Home Page</h1>
    <p>This is a minimal React app to test if routing works.</p>
  </div>
);

const AboutPage = () => (
  <div style={{ padding: '20px' }}>
    <h1>About Page</h1>
    <p>This is the about page.</p>
  </div>
);

const MinimalApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MinimalApp;

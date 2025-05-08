import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App.test';
import { test } from '@jest/globals';

test('renders App component', () => {
  render(<App />)
  // Check if the component renders without crashing
  expect(document.body).toBeTruthy()
})


import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Add a basic assertion - you can customize this based on your App component
    expect(document.body).toBeInTheDocument();
  });
});

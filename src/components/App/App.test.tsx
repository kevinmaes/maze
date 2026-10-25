import App from '@/components/App';
import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Add a basic assertion - you can customize this based on your App component
    expect(document.body).toBeInTheDocument();
  });
});

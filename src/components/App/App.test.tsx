import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '@/components/App';

describe('App', () => {
  it('renders the maze and initializes generation controls', () => {
    const { container } = render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Maze Generation', level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText('Press ENTER to start')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Stop' })).toBeDisabled();
    expect(screen.getByRole('slider', { name: /Grid Columns/ })).toHaveValue(
      '15'
    );
    expect(container.querySelector('canvas')).toHaveAttribute('width', '304');
  });
});

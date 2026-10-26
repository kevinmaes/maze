import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createGrid } from '../../test/fixtures';
import { renderWithAppMachine } from '../../test/renderWithAppMachine';
import { Controls } from './Controls';

const button = (name: string) => screen.getByRole('button', { name });

describe('Controls', () => {
  it('enables the available controls and sends click events through a full session', async () => {
    const { actor, clock, user } = renderWithAppMachine(<Controls />);
    expect(button('Play')).toBeDisabled();
    expect(button('Stop')).toBeDisabled();
    expect(button('Step forward')).toBeDisabled();

    act(() => actor.send({ type: 'grid.inject', grid: createGrid() }));
    expect(button('Play')).toBeEnabled();
    expect(button('Stop')).toBeDisabled();
    expect(button('Step forward')).toBeDisabled();
    expect(screen.getByText('Press ENTER to start')).toBeInTheDocument();

    await user.click(button('Play'));
    expect(button('Pause')).toBeEnabled();
    expect(button('Stop')).toBeEnabled();
    expect(button('Step forward')).toBeDisabled();
    expect(screen.queryByText('Press ENTER to start')).not.toBeInTheDocument();

    await user.click(button('Pause'));
    expect(button('Play')).toBeEnabled();
    expect(button('Step forward')).toBeEnabled();
    await user.click(button('Step forward'));
    expect(actor.getSnapshot().matches({ Generating: 'Paused' })).toBe(true);
    await user.click(button('Play'));
    act(() => {
      for (let tick = 0; tick < 100; tick++) clock.increment(50);
    });
    expect(button('Restart')).toBeEnabled();
    expect(button('Play')).toBeDisabled();
    expect(button('Step forward')).toBeDisabled();
    await user.click(button('Restart'));
    expect(actor.getSnapshot().value).toBe('Idle');

    act(() => actor.send({ type: 'grid.inject', grid: createGrid() }));
    await user.click(button('Play'));
    await user.click(button('Stop'));
    expect(actor.getSnapshot().value).toBe('Idle');
  });

  it('supports Enter, Space, ArrowRight, Escape, and ArrowLeft shortcuts', async () => {
    const { actor, clock, user } = renderWithAppMachine(<Controls />);
    const grid = createGrid();
    act(() => actor.send({ type: 'grid.inject', grid }));

    await user.keyboard('{Enter}');
    expect(button('Pause')).toBeEnabled();
    await user.keyboard(' ');
    expect(button('Step forward')).toBeEnabled();
    expect(grid.cells.filter((cell) => cell.isVisited())).toHaveLength(1);
    await user.keyboard('{ArrowRight}');
    expect(grid.cells.filter((cell) => cell.isVisited())).toHaveLength(2);
    await user.keyboard(' ');
    expect(button('Pause')).toBeEnabled();
    await user.keyboard('{Escape}');
    expect(actor.getSnapshot().value).toBe('Idle');

    act(() => actor.send({ type: 'grid.inject', grid: createGrid() }));
    await user.keyboard('{Enter}');
    act(() => {
      for (let tick = 0; tick < 100; tick++) clock.increment(50);
    });
    expect(button('Restart')).toBeEnabled();
    await user.keyboard('{ArrowLeft}');
    expect(actor.getSnapshot().value).toBe('Idle');
  });

  it('ignores shortcuts whose controls are disabled', async () => {
    const { actor, user } = renderWithAppMachine(<Controls />);

    await user.keyboard('{Enter} {ArrowRight}{Escape}{ArrowLeft}');

    expect(actor.getSnapshot().value).toBe('Idle');
  });
});

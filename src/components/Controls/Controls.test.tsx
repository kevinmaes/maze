import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { countVisited, generationMaze } from '../../test/fixtures';
import { renderWithAppMachine } from '../../test/renderWithAppMachine';
import { Controls } from './Controls';

const button = (name: string) => screen.getByRole('button', { name });

function finish(
  actor: ReturnType<typeof renderWithAppMachine>['actor'],
  clock: ReturnType<typeof renderWithAppMachine>['clock']
) {
  act(() => {
    for (
      let tick = 0;
      tick < 300 && !actor.getSnapshot().matches('Done');
      tick++
    ) {
      clock.increment(50);
    }
  });
}

describe('Controls', () => {
  it('enables the available controls and sends click events through a full session', async () => {
    const { actor, clock, user } = renderWithAppMachine(<Controls />);
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
    finish(actor, clock);
    expect(button('Restart')).toBeEnabled();
    expect(button('Play')).toBeDisabled();
    expect(button('Step forward')).toBeDisabled();
    await user.click(button('Restart'));
    expect(actor.getSnapshot().matches({ Generating: 'Initializing' })).toBe(
      true
    );

    await user.click(button('Play'));
    await user.click(button('Stop'));
    expect(actor.getSnapshot().matches({ Generating: 'Initializing' })).toBe(
      true
    );
  });

  it('supports Enter, Space, ArrowRight, Escape, and ArrowLeft shortcuts', async () => {
    const { actor, clock, user } = renderWithAppMachine(<Controls />);
    const visitedCount = () => countVisited(generationMaze(actor));

    await user.keyboard('{Enter}');
    expect(button('Pause')).toBeEnabled();
    await user.keyboard(' ');
    expect(button('Step forward')).toBeEnabled();
    expect(visitedCount()).toBe(1);
    await user.keyboard('{ArrowRight}');
    expect(visitedCount()).toBe(2);
    await user.keyboard(' ');
    expect(button('Pause')).toBeEnabled();
    await user.keyboard('{Escape}');
    expect(actor.getSnapshot().matches({ Generating: 'Initializing' })).toBe(
      true
    );
    expect(visitedCount()).toBe(0);

    await user.keyboard('{Enter}');
    finish(actor, clock);
    expect(button('Restart')).toBeEnabled();
    await user.keyboard('{ArrowLeft}');
    expect(actor.getSnapshot().matches({ Generating: 'Initializing' })).toBe(
      true
    );
  });

  it('ignores shortcuts whose controls are disabled', async () => {
    const { actor, user } = renderWithAppMachine(<Controls />);

    await user.keyboard('{ArrowRight}{Escape}{ArrowLeft}');
    expect(actor.getSnapshot().matches({ Generating: 'Initializing' })).toBe(
      true
    );

    await user.keyboard('{Enter}');
    await user.keyboard('{ArrowRight}{ArrowLeft}');
    expect(actor.getSnapshot().matches({ Generating: 'Playing' })).toBe(true);
    expect(countVisited(generationMaze(actor))).toBe(1);
  });
});

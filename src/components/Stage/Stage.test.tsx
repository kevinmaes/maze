import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithAppMachine } from '../../test/renderWithAppMachine';
import { Stage } from './Stage';

const frames = new Map<number, FrameRequestCallback>();
let nextFrame = 1;

function flushFrames() {
  const pending = [...frames.values()];
  frames.clear();
  act(() => {
    for (const callback of pending) callback(0);
  });
}

function lastContext() {
  const getContext = vi.mocked(HTMLCanvasElement.prototype.getContext);
  return getContext.mock.results.at(-1)?.value as CanvasRenderingContext2D;
}

beforeEach(() => {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(nextFrame, callback);
    return nextFrame++;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
});

afterEach(() => {
  frames.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Stage', () => {
  it('coalesces snapshots into one draw per frame', () => {
    const { actor, clock } = renderWithAppMachine(<Stage />);
    flushFrames();
    const ctx = lastContext();
    const draws = () => vi.mocked(ctx.save).mock.calls.length;
    expect(draws()).toBe(1);

    act(() => {
      actor.send({ type: 'controls.play' });
      for (let tick = 0; tick < 5; tick++) clock.increment(50);
    });

    expect(frames.size).toBe(1);
    flushFrames();
    expect(draws()).toBe(2);
    // The cursor's inner square is drawn for the latest visited cell.
    expect(ctx.fillRect).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      10,
      10
    );
  });

  it('keeps drawing the finished maze after the algorithm actor stops', () => {
    const { actor, clock } = renderWithAppMachine(<Stage />);
    act(() => {
      actor.send({ type: 'controls.play' });
      for (
        let tick = 0;
        tick < 300 && !actor.getSnapshot().matches('Done');
        tick++
      )
        clock.increment(50);
    });
    expect(actor.getSnapshot().matches('Done')).toBe(true);

    flushFrames();

    const ctx = lastContext();
    expect(ctx.save).toHaveBeenCalled();
    expect(actor.getSnapshot().context.maze.cells.every((c) => c.visited)).toBe(
      true
    );
  });

  it('cancels the pending frame and unsubscribes on unmount', () => {
    const { actor, unmount } = renderWithAppMachine(<Stage />);
    expect(frames.size).toBe(1);

    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalled();
    expect(frames.size).toBe(0);
    act(() => actor.send({ type: 'controls.play' }));
    expect(frames.size).toBe(0);
  });
});

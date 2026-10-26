import { describe, expect, it } from 'vitest';
import { createActor, SimulatedClock } from 'xstate';
import { createGrid } from '../test/fixtures';
import { recursiveBacktrackerMachine } from './recursiveBacktracker.machine';

describe('recursiveBacktrackerMachine', () => {
  it('finishes a 3x3 maze and visits every cell', () => {
    const grid = createGrid();
    const clock = new SimulatedClock();
    const actor = createActor(recursiveBacktrackerMachine, {
      clock,
      input: { grid, fps: 20, canPlay: true, pathId: 'path' },
    }).start();

    try {
      actor.send({ type: 'generation.start' });
      for (
        let tick = 0;
        tick < 100 && actor.getSnapshot().status !== 'done';
        tick++
      ) {
        clock.increment(50);
      }

      expect(actor.getSnapshot().matches('Finished')).toBe(true);
      expect(actor.getSnapshot().status).toBe('done');
      expect(grid.cells.every((cell) => cell.isVisited())).toBe(true);
      expect(grid.cells.every((cell) => cell.getPathId() === 'path')).toBe(
        true
      );
    } finally {
      actor.stop();
    }
  });

  it('holds progress while paused and advances exactly one cell per step', () => {
    const grid = createGrid();
    const clock = new SimulatedClock();
    const actor = createActor(recursiveBacktrackerMachine, {
      clock,
      input: { grid, fps: 20, canPlay: true, pathId: 'path' },
    }).start();
    const visitedCount = () =>
      grid.cells.filter((cell) => cell.isVisited()).length;

    try {
      actor.send({ type: 'generation.start' });
      actor.send({ type: 'controls.pause' });
      const pausedCell = actor.getSnapshot().context.currentCell;
      clock.increment(500);
      expect(visitedCount()).toBe(1);
      expect(actor.getSnapshot().context.currentCell).toBe(pausedCell);

      actor.send({ type: 'controls.step.forward' });
      expect(visitedCount()).toBe(2);
      clock.increment(500);
      expect(visitedCount()).toBe(2);

      actor.send({ type: 'controls.play' });
      expect(visitedCount()).toBe(3);
      clock.increment(50);
      expect(visitedCount()).toBe(4);
    } finally {
      actor.stop();
    }
  });
});

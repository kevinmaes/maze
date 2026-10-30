import { describe, expect, it } from 'vitest';
import { createActor, SimulatedClock } from 'xstate';
import { createMaze } from '../maze/grid';
import { countVisited } from '../test/fixtures';
import { recursiveBacktrackerMachine } from './recursiveBacktracker.machine';

function start() {
  const clock = new SimulatedClock();
  const actor = createActor(recursiveBacktrackerMachine, {
    clock,
    input: {
      maze: createMaze({ columns: 3, rows: 3 }),
      fps: 20,
      canPlay: true,
    },
  }).start();
  const visitedCount = () =>
    countVisited(actor.getSnapshot().context.generation?.maze);
  return { actor, clock, visitedCount };
}

describe('recursiveBacktrackerMachine', () => {
  it('finishes a 3x3 maze and outputs it with every cell visited', () => {
    const { actor, clock } = start();

    try {
      expect(actor.getSnapshot().context.generation).toBeNull();
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
      const output = actor.getSnapshot().output;
      expect(output?.cells.every((cell) => cell.visited)).toBe(true);
      expect(output?.cells.every((cell) => cell.backtracked)).toBe(true);
      expect(actor.getSnapshot().context.generation?.cursorIndex).toBeNull();
      // The input maze is never mutated.
      expect(countVisited(actor.getSnapshot().context.maze)).toBe(0);
    } finally {
      actor.stop();
    }
  });

  it('holds progress while paused and advances exactly one cell per step', () => {
    const { actor, clock, visitedCount } = start();

    try {
      actor.send({ type: 'generation.start' });
      actor.send({ type: 'controls.pause' });
      const paused = actor.getSnapshot().context.generation;
      clock.increment(500);
      expect(visitedCount()).toBe(1);
      expect(actor.getSnapshot().context.generation).toBe(paused);

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

  it('ignores a step before generation starts', () => {
    const { actor, visitedCount } = start();

    try {
      actor.send({ type: 'controls.step.forward' });

      expect(actor.getSnapshot().context.generation).toBeNull();
      expect(visitedCount()).toBe(0);
    } finally {
      actor.stop();
    }
  });

  it('keeps its context serializable', () => {
    const { actor, clock } = start();

    try {
      actor.send({ type: 'generation.start' });
      clock.increment(200);

      const { context } = actor.getSnapshot();
      expect(JSON.parse(JSON.stringify(context))).toEqual(context);
    } finally {
      actor.stop();
    }
  });
});

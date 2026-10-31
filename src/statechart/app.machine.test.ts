import { describe, expect, it } from 'vitest';
import { createActor, SimulatedClock } from 'xstate';
import { countVisited, generationMaze } from '../test/fixtures';
import { appMachine } from './app.machine';

describe('appMachine', () => {
  it('creates a maze, plays, pauses, steps, and stops', () => {
    const clock = new SimulatedClock();
    const actor = createActor(appMachine, { clock }).start();
    const visitedCount = () => countVisited(generationMaze(actor));

    try {
      // Idle builds the maze from generationParams and moves straight on.
      expect(actor.getSnapshot().matches({ Generating: 'Initializing' })).toBe(
        true
      );
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(true);
      expect(actor.getSnapshot().context.maze).toMatchObject({
        columns: 15,
        rows: 15,
      });
      expect(visitedCount()).toBe(0);

      actor.send({ type: 'controls.play' });
      expect(actor.getSnapshot().matches({ Generating: 'Playing' })).toBe(true);
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(false);
      actor.send({ type: 'controls.pause' });
      expect(actor.getSnapshot().matches({ Generating: 'Paused' })).toBe(true);
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(false);
      clock.increment(500);
      expect(visitedCount()).toBe(1);

      actor.send({ type: 'controls.step.forward' });
      expect(actor.getSnapshot().matches({ Generating: 'Paused' })).toBe(true);
      expect(visitedCount()).toBe(2);
      clock.increment(500);
      expect(visitedCount()).toBe(2);

      const stopped = actor.getSnapshot().children.generationAlgorithm;
      actor.send({ type: 'controls.stop' });
      expect(actor.getSnapshot().matches({ Generating: 'Initializing' })).toBe(
        true
      );
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(true);
      clock.increment(500);
      expect(
        countVisited(stopped?.getSnapshot().context.generation?.maze)
      ).toBe(2);
      expect(visitedCount()).toBe(0);
      expect(countVisited(actor.getSnapshot().context.maze)).toBe(0);
    } finally {
      actor.stop();
    }
  });

  it('completes generation and restarts from Done', () => {
    const clock = new SimulatedClock();
    const actor = createActor(appMachine, { clock }).start();

    try {
      actor.send({
        type: 'generation.param.set',
        generationParam: { name: 'gridColumns', value: 5 },
      });
      actor.send({ type: 'controls.play' });
      for (
        let tick = 0;
        tick < 100 && !actor.getSnapshot().matches('Done');
        tick++
      ) {
        clock.increment(50);
      }
      expect(actor.getSnapshot().value).toBe('Done');
      const { maze } = actor.getSnapshot().context;
      expect(maze.cells).toHaveLength(5 * 15);
      expect(maze.cells.every((cell) => cell.visited)).toBe(true);
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(false);

      actor.send({ type: 'app.restart' });

      expect(actor.getSnapshot().matches({ Generating: 'Initializing' })).toBe(
        true
      );
      expect(countVisited(actor.getSnapshot().context.maze)).toBe(0);
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(true);
    } finally {
      actor.stop();
    }
  });

  it('updates a generation parameter and starts over with a new maze', () => {
    const clock = new SimulatedClock();
    const actor = createActor(appMachine, { clock }).start();
    const params = actor.getSnapshot().context.generationParams;

    try {
      actor.send({ type: 'controls.play' });

      actor.send({
        type: 'generation.param.set',
        generationParam: { name: 'fps', value: 200 },
      });

      expect(actor.getSnapshot().matches({ Generating: 'Initializing' })).toBe(
        true
      );
      expect(actor.getSnapshot().context.generationParams).toEqual({
        ...params,
        fps: 200,
      });
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(true);

      actor.send({
        type: 'generation.param.set',
        generationParam: { name: 'gridRows', value: 5 },
      });
      expect(actor.getSnapshot().context.maze).toMatchObject({
        columns: 15,
        rows: 5,
      });
    } finally {
      actor.stop();
    }
  });
});

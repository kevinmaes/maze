import { describe, expect, it } from 'vitest';
import { createActor, SimulatedClock } from 'xstate';
import { createGrid } from '../test/fixtures';
import { appMachine } from './app.machine';

describe('appMachine', () => {
  it('injects a grid, plays, pauses, steps, and stops', () => {
    const clock = new SimulatedClock();
    const actor = createActor(appMachine, { clock }).start();
    const grid = createGrid();
    const visitedCount = () =>
      grid.cells.filter((cell) => cell.isVisited()).length;

    try {
      expect(actor.getSnapshot().value).toBe('Idle');
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(true);

      actor.send({ type: 'grid.inject', grid });
      expect(actor.getSnapshot().matches({ Generating: 'Initializing' })).toBe(
        true
      );
      expect(actor.getSnapshot().context.grid).toBe(grid);
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(true);

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
      actor.send({ type: 'controls.stop' });
      expect(actor.getSnapshot().value).toBe('Idle');
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(true);
      clock.increment(500);
      expect(visitedCount()).toBe(2);
    } finally {
      actor.stop();
    }
  });

  it('completes generation and restarts from Done', () => {
    const clock = new SimulatedClock();
    const actor = createActor(appMachine, { clock }).start();
    const grid = createGrid();

    try {
      actor.send({ type: 'grid.inject', grid });
      actor.send({ type: 'controls.play' });
      for (
        let tick = 0;
        tick < 100 && !actor.getSnapshot().matches('Done');
        tick++
      ) {
        clock.increment(50);
      }
      expect(actor.getSnapshot().value).toBe('Done');
      expect(grid.cells.every((cell) => cell.isVisited())).toBe(true);
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(false);

      actor.send({ type: 'app.restart' });

      expect(actor.getSnapshot().value).toBe('Idle');
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(true);
    } finally {
      actor.stop();
    }
  });

  it('updates a generation parameter and returns to Idle', () => {
    const clock = new SimulatedClock();
    const actor = createActor(appMachine, { clock }).start();
    const params = actor.getSnapshot().context.generationParams;

    try {
      actor.send({ type: 'grid.inject', grid: createGrid() });
      actor.send({ type: 'controls.play' });

      actor.send({
        type: 'generation.param.set',
        generationParam: { name: 'fps', value: 200 },
      });

      expect(actor.getSnapshot().value).toBe('Idle');
      expect(actor.getSnapshot().context.generationParams).toEqual({
        ...params,
        fps: 200,
      });
      expect(actor.getSnapshot().hasTag('levers enabled')).toBe(true);
    } finally {
      actor.stop();
    }
  });
});

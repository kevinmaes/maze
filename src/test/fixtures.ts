import type { ActorRefFrom } from 'xstate';
import type { Maze } from '../maze/types';
import type { appMachine } from '../statechart/app.machine';

/** Deterministic `[0, 1)` source (mulberry32) so generated mazes repeat. */
export function seededRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function countVisited(maze: Maze | undefined) {
  return maze?.cells.filter((cell) => cell.visited).length ?? 0;
}

/** The maze as the running algorithm actor currently sees it. */
export function generationMaze(actor: ActorRefFrom<typeof appMachine>) {
  return actor.getSnapshot().children.generationAlgorithm?.getSnapshot().context
    .generation?.maze;
}

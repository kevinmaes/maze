import type { ActorRefFrom } from 'xstate';
import Cell from '../components/generation/Cell';
import type { CellPosition } from '../components/generation/Cell/types';
import Grid from '../components/generation/Grid';
import type { Maze } from '../maze/types';
import type { appMachine } from '../statechart/app.machine';

export function canvasContext() {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) throw new Error('Canvas context is unavailable');
  return context;
}

export function createGrid(columns = 3, rows = 3, startIndex = 0) {
  return new Grid(canvasContext(), columns, rows, startIndex);
}

export const cellStyle = {
  backtrackColor: 'backtrack',
  borderColor: 'border',
  edgeColor: 'edge',
  borderWeight: 1,
  size: 20,
  cursorColor: 'cursor',
  visitedColor: 'visited',
};

export function createCell(position: Partial<CellPosition> = {}) {
  return new Cell(
    canvasContext(),
    {
      column: 1,
      row: 1,
      index: 4,
      isBlocked: false,
      isEnd: false,
      isStart: false,
      edges: new Set(),
      ...position,
    },
    cellStyle
  );
}

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

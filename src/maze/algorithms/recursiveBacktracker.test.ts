import { describe, expect, it } from 'vitest';
import { countVisited, seededRng } from '../../test/fixtures';
import { createMaze, getCell, getNeighbors } from '../grid';
import type { Direction, Maze } from '../types';
import {
  type RecursiveBacktrackerState,
  recursiveBacktracker,
} from './recursiveBacktracker';

const { init, step, isDone } = recursiveBacktracker;
const env = (rng: () => number) => ({ rng, now: 1_000 });

function generate(maze: Maze, rng: () => number) {
  let state = init(maze, env(rng));
  let steps = 0;
  while (!isDone(state) && steps <= maze.cells.length) {
    state = step(state, env(rng));
    steps++;
  }
  return { state, steps };
}

const towards: Record<
  Direction,
  [opposite: Direction, (index: number, columns: number) => number]
> = {
  Top: ['Bottom', (index, columns) => index - columns],
  Right: ['Left', (index) => index + 1],
  Bottom: ['Top', (index, columns) => index + columns],
  Left: ['Right', (index) => index - 1],
};

/** Undirected passages between cells, derived from the open walls. */
function passages(maze: Maze) {
  const links = new Set<string>();
  for (const cell of maze.cells) {
    for (const [direction, standing] of Object.entries(cell.walls)) {
      if (standing || cell.edges[direction as Direction]) continue;
      const [opposite, move] = towards[direction as Direction];
      const other = move(cell.index, maze.columns);
      // Every passage is open from both sides.
      expect(getCell(maze, other).walls[opposite]).toBe(false);
      links.add([cell.index, other].sort((a, b) => a - b).join('-'));
    }
  }
  return [...links].map((link) => link.split('-').map(Number));
}

function hasCycle(maze: Maze) {
  const parent = maze.cells.map((cell) => cell.index);
  const root = (index: number): number =>
    parent[index] === index ? index : root(parent[index] as number);
  return passages(maze).some(([a = 0, b = 0]) => {
    const [rootA, rootB] = [root(a), root(b)];
    if (rootA === rootB) return true;
    parent[rootA] = rootB;
    return false;
  });
}

describe('recursiveBacktracker', () => {
  it('visits the start cell on init', () => {
    const maze = createMaze({ columns: 3, rows: 3, startIndex: 4 });

    const state = init(maze, { now: 42 });

    expect(state).toMatchObject({
      stack: [4],
      currentIndex: 4,
      cursorIndex: 4,
    });
    expect(getCell(state.maze, 4)).toMatchObject({
      visited: true,
      lastVisitedAt: 42,
    });
    expect(countVisited(state.maze)).toBe(1);
    expect(isDone(state)).toBe(false);
  });

  it.each([
    [0, 1],
    [0.3, 5],
    [0.99, 3],
    [1, 3],
  ])('picks a neighbor with random value %f', (random, expected) => {
    const state = init(createMaze({ columns: 3, rows: 3, startIndex: 4 }), {
      now: 0,
    });

    const next = step(
      state,
      env(() => random)
    );

    expect(next.currentIndex).toBe(expected);
    expect(next.cursorIndex).toBe(expected);
    expect(next.stack).toEqual([4, expected]);
    expect(getCell(next.maze, expected).visited).toBe(true);
    expect(getNeighbors(next.maze, 4).map((cell) => cell.index)).toContain(
      expected
    );
  });

  it('connects each new cell to the cell it came from', () => {
    const state = init(createMaze({ columns: 3, rows: 3 }), { now: 0 });

    const next = step(
      state,
      env(() => 0)
    );

    expect(getCell(next.maze, 0).walls.Right).toBe(false);
    expect(getCell(next.maze, 1).walls.Left).toBe(false);
  });

  it('advances exactly one new cell per step', () => {
    const rng = seededRng(7);
    let state = init(createMaze({ columns: 4, rows: 4 }), env(rng));

    for (let visited = 2; visited <= 16; visited++) {
      state = step(state, env(rng));
      expect(countVisited(state.maze)).toBe(visited);
    }
    expect(isDone(state)).toBe(false);
    state = step(state, env(rng));
    expect(isDone(state)).toBe(true);
  });

  it('backtracks from a dead end and marks the abandoned path', () => {
    // 3x1: start in the middle, go right, dead end, back to the middle, go left.
    const maze = createMaze({ columns: 3, rows: 1, startIndex: 1 });
    let state = init(
      maze,
      env(() => 0)
    );
    state = step(
      state,
      env(() => 0)
    );
    expect(state.currentIndex).toBe(2);

    state = step(
      state,
      env(() => 0)
    );

    expect(state.currentIndex).toBe(0);
    expect(state.stack).toEqual([1, 0]);
    expect(getCell(state.maze, 2).backtracked).toBe(true);
    expect(getCell(state.maze, 1).backtracked).toBe(false);
  });

  it('finishes a single-cell maze with no cursor', () => {
    const state = init(createMaze({ columns: 1, rows: 1 }), { now: 0 });

    const done = step(
      state,
      env(() => 0)
    );

    expect(isDone(done)).toBe(true);
    expect(done).toMatchObject({
      stack: [],
      currentIndex: 0,
      cursorIndex: null,
    });
    expect(getCell(done.maze, 0).backtracked).toBe(true);
    expect(
      step(
        done,
        env(() => 0)
      )
    ).toEqual(done);
  });

  it.each([
    [3, 3, 1],
    [3, 3, 2],
    [5, 5, 3],
    [5, 5, 4],
    [7, 4, 5],
  ])('generates a perfect %ix%i maze (seed %i)', (columns, rows, seed) => {
    const maze = createMaze({ columns, rows });

    const { state, steps } = generate(maze, seededRng(seed));

    expect(isDone(state)).toBe(true);
    expect(steps).toBe(maze.cells.length);
    expect(state.maze.cells.every((cell) => cell.visited)).toBe(true);
    expect(state.maze.cells.every((cell) => cell.backtracked)).toBe(true);
    expect(passages(state.maze)).toHaveLength(maze.cells.length - 1);
    expect(hasCycle(state.maze)).toBe(false);
    expect(state.cursorIndex).toBeNull();
    expect(state.currentIndex).toBe(maze.startIndex);
  });

  it('never visits or opens blocked cells', () => {
    const blockedIndices = new Set([6, 7, 8, 12]);
    const maze = createMaze({ columns: 5, rows: 5, blockedIndices });

    const { state } = generate(maze, seededRng(9));

    expect(isDone(state)).toBe(true);
    for (const cell of state.maze.cells) {
      expect(cell.visited).toBe(!blockedIndices.has(cell.index));
      if (cell.blocked) expect(cell.walls).toEqual(getCell(maze, 0).walls);
    }
    expect(passages(state.maze)).toHaveLength(25 - blockedIndices.size - 1);
    expect(hasCycle(state.maze)).toBe(false);
  });

  it('keeps state immutable and serializable', () => {
    const rng = seededRng(11);
    const first = init(createMaze({ columns: 3, rows: 3 }), env(rng));
    const copy: RecursiveBacktrackerState = structuredClone(first);

    const next = step(first, env(rng));

    expect(first).toEqual(copy);
    expect(next).not.toBe(first);
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
  });

  it('defaults to Math.random', () => {
    const { state } = generate(
      createMaze({ columns: 4, rows: 3 }),
      Math.random
    );
    const noRng = step(init(createMaze({ columns: 2, rows: 1 }), { now: 0 }), {
      now: 0,
    });

    expect(isDone(state)).toBe(true);
    expect(noRng.currentIndex).toBe(1);
  });
});

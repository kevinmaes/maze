import { connect, getEligibleNeighbors, updateCell } from '../grid';
import type { Maze } from '../types';
import type { GenerationState, MazeAlgorithm } from './types';

export interface RecursiveBacktrackerState extends GenerationState {
  /** Indices of the current path, from the start cell to the current cell. */
  readonly stack: readonly number[];
}

function visit(maze: Maze, index: number, now: number) {
  return updateCell(maze, index, { visited: true, lastVisitedAt: now });
}

export const recursiveBacktracker: MazeAlgorithm<RecursiveBacktrackerState> = {
  init: (maze, { now }) => ({
    maze: visit(maze, maze.startIndex, now),
    stack: [maze.startIndex],
    currentIndex: maze.startIndex,
    cursorIndex: maze.startIndex,
  }),

  step: (state, { rng = Math.random, now }) => {
    let { maze, currentIndex } = state;
    const stack = [...state.stack];

    // Backtrack along the path until a cell has an unvisited neighbor.
    for (let top = stack.at(-1); top !== undefined; top = stack.at(-1)) {
      const neighbors = getEligibleNeighbors(maze, top);
      const pick = Math.min(
        Math.floor(rng() * neighbors.length),
        neighbors.length - 1
      );
      const next = neighbors[pick];
      if (next) {
        maze = visit(connect(maze, top, next.index), next.index, now);
        return {
          maze,
          stack: [...stack, next.index],
          currentIndex: next.index,
          cursorIndex: next.index,
        };
      }
      stack.pop();
      maze = updateCell(maze, top, { backtracked: true });
      currentIndex = top;
    }

    return { maze, stack, currentIndex, cursorIndex: null };
  },

  isDone: (state) => state.stack.length === 0,
};

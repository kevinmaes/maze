import { connect, getEligibleNeighbors, updateCell } from '../grid';
import type { Maze } from '../types';
import type { AlgorithmEnv, GenerationState, MazeAlgorithm } from './types';

/*
 * The recursive backtracker as small pure transitions, so a statechart can
 * model each phase (Seeking, Advancing, Backtracking) as its own state:
 *
 *   findNeighbors → isDeadEnd ? backtrack (until isBackAtStart) : advance
 *
 * `recursiveBacktracker.step` chains the same functions for callers that only
 * need one new cell per call.
 */

export interface RecursiveBacktrackerState extends GenerationState {
  /** Indices of the current path, from the start cell to the current cell. */
  readonly stack: readonly number[];
  /** Unvisited neighbors of the cell on top of the stack, from findNeighbors. */
  readonly eligibleNeighbors: readonly number[];
}

function visit(maze: Maze, index: number, now: number) {
  return updateCell(maze, index, { visited: true, lastVisitedAt: now });
}

function init(maze: Maze, { now }: AlgorithmEnv): RecursiveBacktrackerState {
  return {
    maze: visit(maze, maze.startIndex, now),
    stack: [maze.startIndex],
    eligibleNeighbors: [],
    currentIndex: maze.startIndex,
    cursorIndex: maze.startIndex,
  };
}

/** Finds the unvisited neighbors of the cell on top of the stack. */
export function findNeighbors(
  state: RecursiveBacktrackerState
): RecursiveBacktrackerState {
  const top = state.stack.at(-1);
  return {
    ...state,
    eligibleNeighbors:
      top === undefined
        ? []
        : getEligibleNeighbors(state.maze, top).map((cell) => cell.index),
  };
}

export function isDeadEnd(state: RecursiveBacktrackerState) {
  return state.eligibleNeighbors.length === 0;
}

/** Moves to a random eligible neighbor, opening the wall between them. */
export function advance(
  state: RecursiveBacktrackerState,
  { rng = Math.random, now }: AlgorithmEnv
): RecursiveBacktrackerState {
  const { eligibleNeighbors, stack } = state;
  const from = stack.at(-1);
  const pick = Math.min(
    Math.floor(rng() * eligibleNeighbors.length),
    eligibleNeighbors.length - 1
  );
  const next = eligibleNeighbors[pick];
  if (from === undefined || next === undefined) {
    return state;
  }
  return {
    maze: visit(connect(state.maze, from, next), next, now),
    stack: [...stack, next],
    eligibleNeighbors: [],
    currentIndex: next,
    cursorIndex: next,
  };
}

/** Pops the dead-end cell off the path and marks it as backtracked. */
export function backtrack(
  state: RecursiveBacktrackerState
): RecursiveBacktrackerState {
  const top = state.stack.at(-1);
  if (top === undefined) {
    return state;
  }
  return {
    maze: updateCell(state.maze, top, { backtracked: true }),
    stack: state.stack.slice(0, -1),
    eligibleNeighbors: [],
    currentIndex: top,
    cursorIndex: null,
  };
}

/** Every cell has been backtracked off the path, so the maze is complete. */
export function isBackAtStart(state: RecursiveBacktrackerState) {
  return state.stack.length === 0;
}

function step(
  state: RecursiveBacktrackerState,
  env: AlgorithmEnv
): RecursiveBacktrackerState {
  let next = findNeighbors(state);
  while (isDeadEnd(next) && !isBackAtStart(next)) {
    next = findNeighbors(backtrack(next));
  }
  return isBackAtStart(next) ? next : advance(next, env);
}

export const recursiveBacktracker: MazeAlgorithm<RecursiveBacktrackerState> = {
  init,
  step,
  isDone: isBackAtStart,
};

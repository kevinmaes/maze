import type { Maze } from '../types';

interface AlgorithmEnv {
  /** Returns a number in [0, 1). Defaults to Math.random; inject a seeded source in tests. */
  rng?: () => number;
  /** Time in ms recorded on newly visited cells. */
  now: number;
}

/** The state every generation algorithm exposes to the app and renderer. */
export interface GenerationState {
  readonly maze: Maze;
  /** The cell the algorithm is working from. */
  readonly currentIndex: number;
  /** The most recently visited cell, or null once the algorithm is done. */
  readonly cursorIndex: number | null;
}

/**
 * A pure, step-wise maze generation algorithm. Each `step` advances to one new
 * cell (backtracking first if needed) so the app can animate one cell per tick.
 */
export interface MazeAlgorithm<State extends GenerationState> {
  init: (maze: Maze, env: AlgorithmEnv) => State;
  step: (state: State, env: AlgorithmEnv) => State;
  isDone: (state: State) => boolean;
}

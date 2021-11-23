import type { Cell, CellMethods } from '../components/generation/Cell';
import type { Grid, GridMethods } from '../components/generation/Grid';

export interface Settings {
  gridColumns: number;
  gridRows: number;
  startIndex: number;
  pathId: string;
  fps: number;
}

export type CurrentCell = Cell | CellMethods;
type StackCell = Cell | CellMethods;

export type ContextGrid = Grid | GridMethods;

export interface MazeGenerationContext {
  settings: Settings;
  grid: ContextGrid | undefined;
  currentCell: CurrentCell | undefined;
  eligibleNeighbors: Cell[];
  stack: StackCell[];
}

export type MazeGenerationEvent =
  | { type: 'INJECT_REFS'; gridRef: any }
  | { type: 'RESTART' };

export type Typestate =
  | {
      value: 'idle';
      context: {
        settings: Settings;
        grid: undefined;
        currentCell: undefined;
        eligibleNeighbors: [];
        stack: StackCell[];
      };
    }
  | {
      value: 'start';
      context: {
        settings: Settings;
        grid: undefined;
        currentCell: undefined;
        eligibleNeighbors: [];
        stack: StackCell[];
      };
    }
  | {
      value: 'seek';
      context: {
        settings: Settings;
        grid: ContextGrid;
        currentCell: CurrentCell;
        eligibleNeighbors: [];
        stack: [];
      };
    }
  | {
      value: 'advance';
      context: {
        settings: Settings;
        grid: Grid | ContextGrid;
        currentCell: CurrentCell;
        eligibleNeighbors: [];
        stack: [];
      };
    }
  | {
      value: 'backtrack';
      context: {
        settings: Settings;
        grid: Grid | ContextGrid;
        currentCell: CurrentCell;
        eligibleNeighbors: [];
        stack: [];
      };
    }
  | {
      value: 'complete';
      context: {
        settings: Settings;
        grid: Grid | ContextGrid;
        currentCell: CurrentCell;
        eligibleNeighbors: [];
        stack: [];
      };
    };

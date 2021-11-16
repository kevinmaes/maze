import type { Cell, CellMethods } from '../generation/Cell';
import type { Grid, GridMethods } from '../generation/Grid';

export interface Settings {
  gridColumns: number;
  gridRows: number;
  startIndex: number;
  pathId: string;
}

type CurrentCell = Cell | CellMethods;
// type NeighborCell = Cell | CellMethods;
type StackCell = Cell | CellMethods;

export type ContextGrid = Grid | GridMethods;
// type ContextGrid = GridMethods;

export interface MazeGenerationContext {
  settings: Settings;
  grid: ContextGrid | undefined;
  currentCell: CurrentCell | undefined;
  unvisitedNeighbors: Cell[];
  // stack: CellMethods[];
  stack: StackCell[];
}

export type MazeGenerationEvent = { type: 'RESTART' };

export type Typestate =
  | {
      value: 'start';
      context: {
        settings: Settings;
        grid: undefined;
        currentCell: undefined;
        unvisitedNeighbors: [];
        stack: StackCell[];
      };
    }
  | {
      value: 'seek';
      context: {
        settings: Settings;
        grid: ContextGrid;
        currentCell: CurrentCell;
        unvisitedNeighbors: [];
        stack: [];
      };
    }
  | {
      value: 'advance';
      context: {
        settings: Settings;
        grid: Grid | ContextGrid;
        currentCell: CurrentCell;
        unvisitedNeighbors: [];
        stack: [];
      };
    }
  | {
      value: 'backtrack';
      context: {
        settings: Settings;
        grid: Grid | ContextGrid;
        currentCell: CurrentCell;
        unvisitedNeighbors: [];
        stack: [];
      };
    }
  | {
      value: 'complete';
      context: {
        settings: Settings;
        grid: Grid | ContextGrid;
        currentCell: CurrentCell;
        unvisitedNeighbors: [];
        stack: [];
      };
    };

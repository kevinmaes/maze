import type { Cell, CellMethods } from '../components/generation/Cell';
import type { Grid, GridMethods } from '../components/generation/Grid';

interface Settings {
  fps: number; // Received from parent along with pause/play events.
  gridColumns: number; // Passed down from parent.
  gridRows: number; // Passed down from parent.
  pathId: string; // Owned by the algorithm.
  startIndex: number; // Owned by the algorithm.
}

export type ICell = Cell & CellMethods;

export type ContextGrid = Grid & GridMethods;

export interface MazeGenerationContext {
  settings: Settings;
  grid: ContextGrid | undefined;
  currentCell: ICell | undefined;
  eligibleNeighbors: Cell[];
  stack: ICell[];
}

export type MazeGenerationEvent =
  | { type: 'INJECT_REFS'; gridRef: any }
  | { type: 'RESTART' };

interface BaseContext {
  settings: Settings;
  eligibleNeighbors: [];
  stack: ICell[];
}

interface InitialContext extends BaseContext {
  grid: undefined;
  currentCell: undefined;
}

interface Context extends BaseContext {
  grid: ContextGrid;
  currentCell: ICell;
}

export type Typestate =
  | {
      value: 'idle';
      context: InitialContext;
    }
  | {
      value: 'start';
      context: InitialContext;
    }
  | {
      value: 'seek';
      context: Context;
    }
  | {
      value: 'advance';
      context: Context;
    }
  | {
      value: 'backtrack';
      context: Context;
    }
  | {
      value: 'complete';
      context: Context;
    };

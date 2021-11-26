import type { Cell, CellMethods } from '../components/generation/Cell';
import type { Grid, GridMethods } from '../components/generation/Grid';

interface Settings {
  gridColumns: number;
  gridRows: number;
  startIndex: number;
  pathId: string;
  fps: number;
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

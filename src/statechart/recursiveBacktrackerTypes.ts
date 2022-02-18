import type { Cell, CellMethods } from '../components/generation/Cell';
import type { Grid, GridMethods } from '../components/generation/Grid';

export type ICell = Cell & CellMethods;

export type ContextGrid = Grid & GridMethods;

export interface MazeGenerationContext {
  currentCell: ICell | undefined;
  eligibleNeighbors: Cell[];
  fps: number;
  grid: ContextGrid | undefined;
  pathId: string;
  stack: ICell[];
  startIndex: number;
}

export type InjectRefsEvent = {
  type: 'INJECT_REFS';
  gridRef: any;
  value: any;
  context: Context;
};
export type RestartEvent = { type: 'RESTART'; value: any; context: Context };

export type MazeGenerationEvent = InjectRefsEvent | RestartEvent;

interface BaseContext {
  eligibleNeighbors: Cell[];
  stack: ICell[];
}

interface Context extends BaseContext {
  grid: ContextGrid;
  currentCell: ICell;
  fps: number;
  pathId: string;
  stack: ICell[];
  startIndex: number;
}

export type Typestate =
  | {
      value: 'idle';
      type: string;
      context: Context;
    }
  | {
      value: 'start';
      type: string;
      context: Context;
    }
  | {
      value: 'seek';
      type: string;
      context: Context;
    }
  | {
      value: 'advance';
      type: string;
      context: Context;
    }
  | {
      value: 'backtrack';
      type: string;
      context: Context;
    }
  | {
      value: 'complete';
      type: string;
      context: Context;
    };

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

export type InjectFPSEvent = { type: 'INJECT_FPS'; fps: number };
export type InjectRefsEvent = { type: 'INJECT_REFS'; gridRef: any };
export type RestartEvent = { type: 'RESTART' };

export type MazeGenerationEvent =
  | InjectFPSEvent
  | InjectRefsEvent
  | RestartEvent;

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
      context: Context;
    }
  | {
      value: 'start';
      context: Context;
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

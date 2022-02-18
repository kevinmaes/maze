import type { Cell, CellMethods } from '../components/generation/Cell';
import type { Grid, GridMethods } from '../components/generation/Grid';

export type ICell = Cell & CellMethods;

export type ContextGrid = Grid & GridMethods;

export interface MazeGenerationContext {
  // Generation Params passed down from parent machine.
  fps: number;
  grid: ContextGrid | undefined;
  pathId: string;
  stack: ICell[];
  startIndex: number;
  // Specific context props, local to this machine.
  currentCell: ICell | undefined;
  eligibleNeighbors: Cell[];
}

export type InjectRefsEvent = {
  type: 'INJECT_REFS';
  gridRef: any;
  value: any;
  context: MazeGenerationContext;
};
export type RestartEvent = {
  type: 'RESTART';
  value: any;
  context: MazeGenerationContext;
};

export type MazeGenerationEvent = InjectRefsEvent | RestartEvent;

export type Typestate =
  | {
      value: 'idle';
      type: string;
      context: MazeGenerationContext;
    }
  | {
      value: 'start';
      type: string;
      context: MazeGenerationContext;
    }
  | {
      value: 'seek';
      type: string;
      context: MazeGenerationContext;
    }
  | {
      value: 'advance';
      type: string;
      context: MazeGenerationContext;
    }
  | {
      value: 'backtrack';
      type: string;
      context: MazeGenerationContext;
    }
  | {
      value: 'complete';
      type: string;
      context: MazeGenerationContext;
    };

import { Ref } from 'react';
import type { Cell, CellMethods } from '../components/generation/Cell';
import type { Grid, GridMethods } from '../components/generation/Grid';

export type ICell = Cell & CellMethods;

export type ContextGrid = Grid & GridMethods;

export interface MazeGenerationContext {
  canPlay: boolean;
  currentCell: ICell | undefined;
  eligibleNeighbors: Cell[];
  fps: number;
  grid: ContextGrid | undefined;
  pathId: string;
  stack: ICell[];
  startIndex: number;
}

export enum MazeGenerationEventId {
  INJECT_REFS = 'INJECT_REFS',
  START = 'START',
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  STEP_FORWARD = 'STEP_FORWARD',
  UPDATE = 'UPDATE',
}

export type InjectRefsEvent = {
  type: MazeGenerationEventId.INJECT_REFS;
  gridRef: Ref<Grid>;
};

export type StartEvent = {
  type: MazeGenerationEventId.START;
};

export type PlayEvent = {
  type: MazeGenerationEventId.PLAY;
};

export type PauseEvent = {
  type: MazeGenerationEventId.PAUSE;
};

export type StepForwardEvent = {
  type: MazeGenerationEventId.STEP_FORWARD;
};

export type UpdateEvent = {
  type: MazeGenerationEventId.UPDATE;
};

export type MazeGenerationEvent =
  | InjectRefsEvent
  | StartEvent
  | PlayEvent
  | PauseEvent
  | StepForwardEvent
  | UpdateEvent;

export type Typestate =
  | {
      value: 'maze-idle';
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

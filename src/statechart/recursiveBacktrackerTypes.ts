import { Ref } from 'react';
import type { Cell, CellMethods } from '../components/generation/Cell';
import { ICell } from '../components/generation/Cell/types';
import type { Grid, GridMethods } from '../components/generation/Grid';

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
  DONE = 'DONE',
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

export type DoneEvent = {
  type: MazeGenerationEventId.DONE;
};

export type MazeGenerationEvent =
  | InjectRefsEvent
  | StartEvent
  | PlayEvent
  | PauseEvent
  | StepForwardEvent
  | UpdateEvent
  | DoneEvent;

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

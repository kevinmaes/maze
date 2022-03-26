import { Ref } from 'react';
import { Grid } from '../components/generation/Grid';
import { MazeGenerationEventId } from './recursiveBacktrackerTypes';

export enum GenerationParamsId {
  BORDER_WEIGHT = 'borderWeight',
  CELL_SIZE = 'cellSize',
  FPS = 'fps',
  GRID_COLUMNS = 'gridColumns',
  GRID_ROWS = 'gridRows',
}

export type GridRef = Ref<Grid>;

export interface GenerationParams {
  // Needed only by the State/Grid/Cells (not the algorothm).
  borderWeight: number; // Passed down to Grid/cell.

  // Needed only by the State/Grid/Cells (not the algorothm).
  cellSize: number; // Passed down to Grid/cell.

  // Maybe controlled by the App but passed down to the
  // algo machine so it can set up its own timer
  // but still be overridden by play/pause functionality.
  fps: number; // Passed down to algo along with pause/play.

  // Needed only by the State/Grid/Cells (not the algorothm).
  gridColumns: number; // Passed down to algo.

  // Needed only by the State/Grid/Cells (not the algorothm).
  gridRows: number; // Passed down to algo.
}

export interface AppMachineContext {
  mazeId: string;
  generationParams: GenerationParams;
  gridRef: GridRef | undefined;
  generationSessionId: number;
}

export enum AppMachineState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  GENERATING = 'generating',
  PLAYING = 'playing',
  PAUSED = 'paused',
  DONE = 'done',
}

export type AppMachineStateType = `${AppMachineState}`;

export enum AppMachineEventId {
  START_OVER = 'START_OVER',
  PLAY = 'PLAY',
  STOP = 'STOP',
  PAUSE = 'PAUSE',
  STEP_FORWARD = 'STEP_FORWARD',
  STEP_BACK = 'STEP_BACK',
  SET_GENERATION_PARAM = 'SET_GENERATION_PARAM',
  INJECT_REFS = 'INJECT_REFS',
}

export type SetGenerationParamEvent = {
  type: AppMachineEventId.SET_GENERATION_PARAM;
  name: string;
  value: number;
};

export type AppMachineEvent =
  | { type: AppMachineEventId.PLAY }
  | { type: AppMachineEventId.STOP }
  | { type: AppMachineEventId.PAUSE }
  | { type: AppMachineEventId.START_OVER }
  | { type: AppMachineEventId.STEP_FORWARD }
  | { type: AppMachineEventId.STEP_BACK }
  | SetGenerationParamEvent
  | {
      type: AppMachineEventId.INJECT_REFS;
      gridRef: any;
    }
  | { type: MazeGenerationEventId.UPDATE }
  | { type: MazeGenerationEventId.DONE };

export type Typestate =
  | {
      value: AppMachineState.IDLE;
      context: AppMachineContext;
    }
  | {
      value: AppMachineState.GENERATING;
      context: AppMachineContext;
    }
  // | {
  //     [AppMachineState.GENERATING]: AppMachineState.INITIALIZING;
  //   }
  | {
      value: AppMachineState.PLAYING;
      context: AppMachineContext;
    }
  | {
      value: AppMachineState.PAUSED;
      context: AppMachineContext;
    }
  | {
      value: AppMachineState.DONE;
      context: AppMachineContext;
    };

export enum GenerationParamsId {
  BORDER_WEIGHT = 'borderWeight',
  CELL_SIZE = 'cellSize',
  FPS = 'fps',
  GRID_COLUMNS = 'gridColumns',
  GRID_ROWS = 'gridRows',
}

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

export interface AppContext {
  mazeId: string;
  generationParams: GenerationParams;
}

export enum AppMachineState {
  IDLE = 'idle',
  INITIALIZATION = 'initialization',
  GENERATION = 'generation',
  PLAYING = 'generation.playing',
  PAUSED = 'generation.paused',
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
}

export type AppMachineEvent =
  | { type: AppMachineEventId.PLAY }
  | { type: AppMachineEventId.STOP }
  | { type: AppMachineEventId.PAUSE }
  | { type: AppMachineEventId.START_OVER }
  | { type: AppMachineEventId.STEP_FORWARD }
  | { type: AppMachineEventId.STEP_BACK }
  | {
      type: AppMachineEventId.SET_GENERATION_PARAM;
      name: string;
      value: number;
    };

export type Typestate =
  | {
      value: AppMachineState.IDLE;
      context: AppContext;
    }
  | {
      value: AppMachineState.INITIALIZATION;
      context: AppContext;
    }
  | {
      value: AppMachineState.PLAYING;
      context: AppContext;
    }
  | {
      value: AppMachineState.PAUSED;
      context: AppContext;
    }
  | {
      value: AppMachineState.DONE;
      context: AppContext;
    };

export interface GenerationParams {
  borderWeight: number; // Passed down to Grid/cell.
  cellSize: number; // Passed down to Grid/cell.
  fps: number; // Passed down to algo along with pause/play.
  gridColumns: number; // Passed down to algo.
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
}

export type AppMachineEvent =
  | { type: AppMachineEventId.PLAY }
  | { type: AppMachineEventId.STOP }
  | { type: AppMachineEventId.PAUSE }
  | { type: AppMachineEventId.START_OVER }
  | { type: AppMachineEventId.STEP_FORWARD }
  | { type: AppMachineEventId.STEP_BACK };

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

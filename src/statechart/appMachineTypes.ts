export interface GenerationParams {
  borderWeight: number;
  cellSize: number;
  fps: number;
  gridColumns: number;
  gridRows: number;
}

export interface AppContext {
  mazeId: string;
  generationParams: GenerationParams;
}

export enum PlaybackMachineState {
  IDLE = 'idle',
  INITIALIZATION = 'initialization',
  PLAYING = 'playing',
  PAUSED = 'paused',
  DONE = 'done',
}

export type PlaybackMachineStateType = `${PlaybackMachineState}`;

export enum EventId {
  START_OVER = 'START_OVER',
  PLAY = 'PLAY',
  STOP = 'STOP',
  PAUSE = 'PAUSE',
  STEP_FORWARD = 'STEP_FORWARD',
  STEP_BACK = 'STEP_BACK',
}

export type PlaybackEvent =
  | { type: EventId.PLAY }
  | { type: EventId.STOP }
  | { type: EventId.PAUSE }
  | { type: EventId.START_OVER }
  | { type: EventId.STEP_FORWARD }
  | { type: EventId.STEP_BACK };

export type Typestate =
  | {
      value: PlaybackMachineState.IDLE;
      context: AppContext;
    }
  | {
      value: PlaybackMachineState.INITIALIZATION;
      context: AppContext;
    }
  | {
      value: PlaybackMachineState.PLAYING;
      context: AppContext;
    }
  | {
      value: PlaybackMachineState.PAUSED;
      context: AppContext;
    }
  | {
      value: PlaybackMachineState.DONE;
      context: AppContext;
    };

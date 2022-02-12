export type PlaybackContext = {
  mazeId: string;
};

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
      context: PlaybackContext;
    }
  | {
      value: PlaybackMachineState.INITIALIZATION;
      context: PlaybackContext;
    }
  | {
      value: PlaybackMachineState.PLAYING;
      context: PlaybackContext;
    }
  | {
      value: PlaybackMachineState.PAUSED;
      context: PlaybackContext;
    }
  | {
      value: PlaybackMachineState.DONE;
      context: PlaybackContext;
    };

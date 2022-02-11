export type PlaybackContext = {
  mazeId: string;
};

export type PlaybackEvent =
  | { type: 'PLAY' }
  | { type: 'STOP' }
  | { type: 'PAUSE' }
  | { type: 'START_OVER' }
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACK' };

export type Typestate =
  | {
      value: 'idle';
      context: PlaybackContext;
    }
  | {
      value: 'initialization';
      context: PlaybackContext;
    }
  | {
      value: 'playing';
      context: PlaybackContext;
    }
  | {
      value: 'paused';
      context: PlaybackContext;
    }
  | {
      value: 'done';
      context: PlaybackContext;
    };

export type PlaybackContext {
  mazeId: string;
};

export type PlaybackEvent =
  | { type: 'START_PLAY' }
  | { type: 'STOP_PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'REPLAY' }


export type Typestate =
  | {
      value: 'idle';
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


 

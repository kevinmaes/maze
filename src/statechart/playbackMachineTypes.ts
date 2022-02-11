export type PlaybackContext {
  mazeId: string;
};

export type PlaybackEvent 
  | { type: 'START_PLAY' }
  | { type: 'STOP_PLAY' }
  | { type: 'PAUSE_PLAY' }
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


 

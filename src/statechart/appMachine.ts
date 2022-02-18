import { spawn } from 'xstate';
import { createMachine, assign, StateMachine } from 'xstate';
import {
  GenerationParams,
  AppMachineContext,
  AppMachineEvent,
  AppMachineEventId,
  Typestate,
  GenerationAlgorithmActor,
} from './appMachineTypes';
import { recursiveBacktrakerMachine } from './recursiveBacktrackerMachine';
import {
  MazeGenerationContext,
  MazeGenerationEvent,
} from './recursiveBacktrackerTypes';

const FPS_DEFAULT = 30;
const BORDER_WEIGHT_DEFAULT = 2;
const GRID_SIZE_DEFAULT = 15;

const CellSize = {
  DEFAULT: 20,
  MIN: 10,
  MAX: 25,
};

const defaultGenerationParams: GenerationParams = {
  borderWeight: BORDER_WEIGHT_DEFAULT,
  cellSize: CellSize.DEFAULT,
  fps: FPS_DEFAULT,
  gridColumns: GRID_SIZE_DEFAULT,
  gridRows: GRID_SIZE_DEFAULT,
};

const initialAppMachineContext: AppMachineContext = {
  mazeId: '',
  generationParams: defaultGenerationParams,
  generationAlgorithmRef: undefined,
};

export const appMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0BLCAbMAxAAoAyAggJqKioD2sWALlrQHbUgAeiAjAGwAWDAA4ADMJ4AmAJzDJPYQFY+PAOwAaEAE9EiyQGYMi6T0U9RauWtUBfG5rSYYrMACdkzVlGysmWZLhYAF5YXgScsIweYBjIAGaMbhgAkgByyQAqAPppGQCiAEoAamQkHHQMzGwc3AgCfJJGosoCFgJmioqiApo6daLSGKr6onydSooC+gL1dg7oGM5uHqHeqLjIWqvEZACqAMp55fR+1UhciML6jfKqos18j6rC0ny9iK2DMtICPPpd7TEs3sIEcizALncnjWGy2YX2GQA8kRjpUWOxzrV+EIxBIZFYlCoetpENJRBhXiZpNSxGNFMIBHNQQsllDVhh1pttgiyAVsoiioVUacMaBamZhBgeCZ9KpjLI+GThO8ENM+FL6voqQoBDJRkywayVl4ObDtsKqqKLggeKZBl0xu1RKpZNN9CqBD8htTZXIBqpTDwDSyIctoRzkABXWCQYjkKjnCoimqXKYU-5ymZ8f6dN4k1XtIamSSSCyKYbNYTBpyhtkm1BRmMQAgIvJELIAMURBQA6ryACIW9EphA-RQYUQl17mPhyT08FXTceTySKqn6BSSYHzGuQ41rRuxodnMW8O1NR1dF1XKaLgSqDDZgal6SSSbTV7VjAQNiEHl8rIBSFRMTktEdV3HF5FH0fRBAgz0xhVPgAwnExPTfEZnjMOwQVYWgIDgDgwRwfBjytWpdRVDojDuK5RC1eoVEUL8jXDUI-ACYJVjIkcRnJKCYLgx1XkUD0LCLe5bVg5CpmYkFDVrfdTS5LweMxRBkMlcRVBfNQ7UkZV81aIR5Ekv4nlkljFPDBto0gNTT1HQQMF1VoxHMAzEKMv5H1GF432M8tJCsvdoQc61JFUdUBNg3VhK8vpIsaZp-iXZ0tWC+SFh-FxwqxHMhj0AxXzVboqP+ERqUnJ0oOpas8t4Qy+gUCd7novQfmEMZYP0HCbCAA */
  createMachine<AppMachineContext, AppMachineEvent, Typestate>(
    {
      context: initialAppMachineContext,
      id: 'app',
      initial: 'idle',
      states: {
        idle: {
          on: {
            PLAY: {
              target: '#app.generating',
            },
          },
        },
        generating: {
          initial: 'initializing',
          states: {
            initializing: {
              after: {
                INIT_INTERVAL: {
                  target: '#app.generating.playing',
                },
              },
            },
            playing: {
              always: {
                cond: 'isFinished',
                target: '#app.done',
              },
              on: {
                PAUSE: {
                  target: '#app.generating.paused',
                },
                STOP: {
                  target: '#app.idle',
                },
                START_OVER: {
                  target: '#app.generating.initializing',
                },
              },
            },
            paused: {
              always: {
                cond: 'isFinished',
                target: '#app.done',
              },
              on: {
                PLAY: {
                  target: '#app.generating.playing',
                },
                STEP_FORWARD: {
                  target: '#app.generating.paused',
                },
              },
            },
          },
        },
        done: {
          on: {
            START_OVER: {
              target: '#app.generating',
            },
          },
        },
      },
    },
    {
      guards: {
        isFinished: (context: AppMachineContext) => false,
      },
      actions: {
        // createGenerationAlgorithmMachine: assign({
        //   generationAlgorithmRef: (ctx, event) => {
        //     // return 'xxx';
        //     return spawn(recursiveBacktrakerMachine, 'mazegen');
        //   },
        // }),
      },
      delays: {
        INIT_INTERVAL: () => {
          return 1000;
        },
      },
    }
  );

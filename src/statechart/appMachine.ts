import { createTextChangeRange } from 'typescript';
import { createMachine, assign } from 'xstate';
import {
  GenerationParams,
  AppContext,
  AppMachineEvent,
  AppMachineEventId,
  Typestate,
} from './appMachineTypes';

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

export const appMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0BLCAbMAxAAoAyAggJqKioD2sWALlrQHbUgAeiA7AJwBWDAAYAHAEYAbABZxsyX1HC+AGhABPRACZpWjKIDMo-jy3iB04VsmiAvrbVpMWVkyzJcWAF7JmbApywjL5gGMgAZoxgAE4YAJIAcnEAKgD6ickAogBKAGpkJBx0DH7sSFyIAlpqmgh8whh8CloGAsI2kgI84vaO6BgwrDG+LlAYqLjI6qMEAMrJZNlpAPK5OUX0bmwc3AgCNhiyfAbirQY2XaI1iAY8Dadiolr8sgICPQ4gTgNgQ9EjrDGEymMyIZAAqrNMhsSiwyqBdjpxBhxFo+DxRDIjDx+NUNIhpDwDCJhN0DIIDMJZFoBL0vv1BsNmIDxpNpoC5sllkQYVt4RU9gcjiczhcMdcEDo9IZjOizBYrPs6d9Gf9mUC2TNeaUdpUheJjqcBOdRJcJQIlPpDOTJNZJPb0cqGb8maNxsgAK6wSDEchUcrFPm6yVVfTSU3k8zCcRycQSyx8Q5aNE2W5o0mSJ2YVUAoGe70QTmZIipABiy2yAHVFgARbVw4NnRqtHgyO7J0THSTxsQYIlU86yIknWmfFUutVu1D5n317blXb7USHA0i41iq74hDSAzE7ptY2CKSZsf9CBsQjzRYrNbZOf83adhrtTE4mPSdF8VRbySnDA2dplF3cl+AMexPlYWgIDgDhvhwfB72DSQcQwZ4DHDURZX4X8JR0aR-2kW1OhpRRrAtLNsFcZgPG8EZ5xoTYdQXRBxHaRMmmkNpuj4Ql3wlSRhAaNF+w3doPj6bMJ1zVkQUBRDmIQYx4xjVDKR3GRxGHcwKJzdV3S9SB5IRG4iQwXcbFOGxBAEnR4xQk5CNJLpw0HHSpPVIyBUkAwJV3IRW1RaN0NfaRpAo88hk83ZW3w+0Pz4VjxEMFoBH48xDkw0kiQxSwDC0LMou0TdaiSklBIEDiux4C0T3sIA */
  createMachine<AppContext, AppMachineEvent, Typestate>(
    {
      context: {
        mazeId: '',
        generationParams: defaultGenerationParams,
      },
      id: 'app',
      initial: 'idle',
      on: {
        [AppMachineEventId.SET_GENERATION_PARAM]: {
          actions: assign({
            generationParams: ({ generationParams }, { name, value }) => ({
              ...generationParams,
              [name]: value,
            }),
          }),
          internal: true,
        },
      },
      states: {
        idle: {
          on: {
            PLAY: {
              target: '#app.initialization',
            },
          },
        },
        initialization: {
          after: {
            INIT_INTERVAL: {
              target: '#app.generating',
            },
          },
        },
        generating: {
          initial: 'playing',
          states: {
            playing: {
              always: {
                cond: 'isFinished',
                target: '#app.done',
              },
              on: {
                START_OVER: {
                  target: '#app.initialization',
                },
                PAUSE: {
                  target: '#app.generating.paused',
                },
                STOP: {
                  target: '#app.idle',
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
              target: '#app.initialization',
            },
          },
        },
      },
    },
    {
      guards: {
        isFinished: (context: AppContext) => false,
      },
      delays: {
        INIT_INTERVAL: () => {
          return 1000;
        },
      },
    }
  );

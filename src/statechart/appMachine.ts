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
  generationAlgorithmRef: 'default',
};

export const appMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0BLCAbMAxAAoAyAggJqKioD2sWALlrQHbUgAeiAjAAwB2DAGYAnKJ4BWYQCYZA4VIAsMgDQgAnogC0MqRgE8AbAA4jEqaJNKVAX1vq0mLKyZZkuLAC9kzNgU5YRl8wDGQAM0YwACcMAEkAOTiAFQB9ROSAUQAlADUyEg46Bj92JC4dSR4eDBlBUwE5YRM+PiN1LQRtYSVhDFaTUQFRMXkBJR57R3QMGFYY3xcoDFRcZA0lggBlZLJstIB5XJyi+jc2Dm4uySUMHhlJIyejJSH7jp0TEwwVJQFJL5iHiiP5KKYgJyzMDzaKLVjLVbrTZEMgAVS2mVOJRYZVAV26JhqE0kfBuxkMknEkg+CB4tyUVRupJM0hJfB4AnBkLmC2Y8JWaw28O2yQORCx51xFWut3uj2er0Mak0Oj0kgMxjMFkp1jsDghMx5sL5CMFmwlpUulVlD2eLzeys69xkInk1lafCsIMGXMN0N5SxWyAArrBIMRyFRysVJVausJzBhzEZhIIFEZWgnhDTtK87rIjMNRKY5CMbr7MEa4QiQ2GICLMkRUgAxA7ZADqewAIhacXHdKYk56eAm+CyM6JqSr430qhJM7qRiZOfruf7jYHULXw72LuV8Tc7raFQ6czJbu7pCYZOOpAmjBWMBA2IQdntDsdsrupVdgUJZAI5h-EBsgAjSxh8Bgjx8EoY72tYcj2PqrC0BAcAcJCOD4N+caHo0LI8C0fCjIWU6dNof5DrIgzSHISiDGCq4zC4bgeN4ix7jQZyWvuiDCAIQhNFU7JSMMzTZtOlgGK8HKNFU16GCYj5ViaApIvCOG8V0wG1PUy5NER7SSdIUEUr0iiGI0vTKeu1ZBqGkCaXiqqev0chmByDwFgIJg0sI6ptFUdTGKIY6SI8NkwtWTnStobK6YB+kyM0rRGeRzp3Oy1gZjIDSiDIoiPs+8wxb+Kh3MCIIpo8PRPGRvA+UmChWNewj+QJK7TKgpWVP5CUNAZqU5sSGBDIS4ytHoCiMfYQA */
  createMachine<AppMachineContext, AppMachineEvent, Typestate>(
    {
      context: initialAppMachineContext,
      id: 'app',
      initial: 'idle',
      states: {
        idle: {
          on: {
            PLAY: {
              target: '#app.initialization',
            },
          },
        },
        initialization: {
          entry: 'createGenerationAlgorithmMachine',
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
        isFinished: (context: AppMachineContext) => false,
      },
      actions: {
        createGenerationAlgorithmMachine: assign({
          generationAlgorithmRef: (ctx) => {
            return 'xxx';
            // return { ...ctx, generationAlgorithmRef: 'xxx' };
            // const ref = spawn(recursiveBacktrakerMachine, 'mazegen');
            // return ref;
          },
        }),
      },
      delays: {
        INIT_INTERVAL: () => {
          return 1000;
        },
      },
    }
  );

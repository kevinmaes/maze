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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0BLCAbMAxAAoAyAggJqKioD2sWALlrQHbUgAeiAjAGwAWDAA4ADMJ4AmAJzDJPYQFY+PAOwAaEAE9EAgXwyLp0gMySTw1T1HnVAXzua0mGKzAAnZM1ZRsrJljIuFgAXlg+BJywjF5gGMgAZoweGACSAHKpACoA+hlZAKIASgBqZCQcdAzMbBzcCKpyIqrywgJSAiY2Gtq6wiYY0pKqijIj3S0CDk7oGK4eXuG+qLjIWkvEZACqAMoFlfQBtUhcvDyjhv2KAtKCRiYtmjoIAv0YN3ySAqomsoojwj40xAzjmYDcnm8y1W6wiOyyAHkiAdqix2Cd6vwhGIJDI5AplDwBE9ENJRIM+NIsXwlKoyd9gaD5pClhgVmsNvCyEVcgiSsUUUd0aB6v1hIZ-lTjKpGhYTCSXpJySZOiYTIJRF0bEDHCDZszFj42TCNoKasLTggiXTmjJvpZpKNRHwFUYeBgHpJ-sMiSZFGrGfrwQsoWzkABXWCQYjkKgnKpCupnQQemx4vTDTWSBXtaSDKSia6FnhdHhEwMuYMso2oCNRiAEeEFIg5ABiCKKAHVuQARM1opNWyR8RQe4SOwuib6-Pgu3ovHh5+S3TV8VSU8SzitgiGG5Z16P944i3jfPOWO2NOlOufPPRCJXtQGiRdiX7bg1QggQNhxcIAN1oABrOJPzRMhcCgWh3CYAALABbABZZAAGNYPCMAjwteotRER01UEYdrluRQc1UIRRGMFVzgUARlCmXVQR-NxGyybleX5IosMHIi8P9dUBCIj5SPncj3Uafo6XVVRREaRQHF1VhaAgOAOFBHB8G4jFdGzedrHJaxXh+EtxC6WQPyrPc-ACIJQiWLSTwQT53WHJV5EUJRznHMjRzJGkLCVNQR2ECzd1DdlYSgBzLWMcU6Ief1zlkgRnTIuLnTFQL1w80KQ1ZWtI0gaLMUkNoMDpKc5DJL1FB4HNLBETU6Rkr4FADRigzC+z40Oc0ePXPiCMEkdhIVYdyULNUPM1LoR3LDrMGYzCetRY9LX4Aay0sfp5AShQFT4Mx3haaxjCVB5GgrYreGEBUFAUuwgA */
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
          invoke: {
            id: 'generationAlgorithmMachine',
            src: 'generationAlgorithmMachine',
            data: (context: AppMachineContext) => ({
              currentCell: undefined,
              eligibleNeighbors: [],
              ...context.generationParams,
            }),
            onDone: [
              {
                target: '#app.generating.initializing',
              },
            ],
          },
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
      services: {
        generationAlgorithmMachine: () => {
          // Can switch between algorithm machines by checking context here.
          return recursiveBacktrakerMachine;
        },
      },
      delays: {
        INIT_INTERVAL: () => {
          return 1000;
        },
      },
    }
  );

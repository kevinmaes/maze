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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0BLCAbMAxAAoAyAggJqKioD2sWALlrQHbUgAeiAjAGwAWDAA4ADMJ4AmAJzDJPYQFY+PAOwAaEAE9EK1RlUrFPAZMkC+q1dIC+NzWkwxWYAE7JmrKNlZMsyXCwALywvAk5YRg8wDGQAM0Y3DABJADlkgBUAfTSMgFEAJQA1MhIOOgZmNg5uBAE5DEVRZQFRE2NFJoFNHQRFAGZ+jGlRUT5pCdFJVQEFOwd0DGc3D1DvVFxkLTXiMgBVAGU88vo-aqQuRCVJDHlVUeU+S2FpPh7EAaGLaVnVTp5RK0BPMQI4lmAXO5POtNtswgcMgB5IgnSosdgXWr8IRiCQyOQKZQmd4IEbDcY8CayMadYTA+ygxbLKFrDAbLY7BFkArZRFFQqos4Y0C1AbCDCUnj9P4TYTjUQabSIAT3DD9fhNPidRQWVSSEFg5mrLxs2E7QVVYWXBA8BTSRo0gRNazCfoCfokwQ8NVO+5-VSUxTmA1MiEraFs5AAV1gkGI5CoFwqQpqVz4Q2k-UUfwEFiznTeSrq4xESh4AxUrSzIacYZZJtQ0djEAICLyRCyADFEQUAOrcgAiFvRqdJWowUxkKjGcgE0h4JO+Euk036SjdzrpNfBkON6ybceH5xFvDtDq1ToVsjdHqLc6EalU-Uk4isVZ426N0IIEDYMVCAButAANYxIadZ7gggG0AAxqsbAANqiAAukeVq1IID7iFOaiSIMZgktijSfJmz7WP0zTbr+Lithk3K8vyBRoaOkjji8nyCKxOqvIoJLWIotxGMYUhrp0-R2AyrC0BAcAcGCOD4MxmLKpIhGjBKgLCHS7GqHKH4MuBu4RqEfgBMEaxKSeCDPqIIjSBxpgXjxJJBgJWmjC+trzkoiifhBEbsnCUCWda4ziq+L7zgGigrsILmSOK0oTE+zSZlqflGayjYxpAIW1LIQimK0YgAglWoudKBiGJmCgSLpki+QZoaZV4eWIFOdkOVxc7lUWG4YOmhjyNI9wKs09ILJg1FgG1NqiQYQZ4Subp8ICnoNLmAyEoYgyUjWs0KIRwgSTYQA */
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
          // initial: 'initializing',
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

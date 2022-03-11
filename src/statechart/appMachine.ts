import { createMachine, assign, send, interpret } from 'xstate';
import {
  GenerationParams,
  AppMachineContext,
  AppMachineEvent,
  Typestate,
  SetGenerationParamEvent,
} from './appMachineTypes';
import { generationAlgorithmMachine } from './recursiveBacktrackerMachine';
import { InjectRefsEvent } from './recursiveBacktrackerTypes';

const FPS_DEFAULT = 1;
const BORDER_WEIGHT_DEFAULT = 2;
const GRID_SIZE_DEFAULT = 2;

const CellSize = {
  DEFAULT: 20,
  MIN: 10,
  MAX: 25,
};

export const defaultGenerationParams: GenerationParams = {
  borderWeight: BORDER_WEIGHT_DEFAULT,
  cellSize: CellSize.DEFAULT,
  fps: FPS_DEFAULT,
  gridColumns: GRID_SIZE_DEFAULT,
  gridRows: GRID_SIZE_DEFAULT,
};

const initialAppMachineContext: AppMachineContext = {
  mazeId: '',
  generationParams: defaultGenerationParams,
  gridRef: undefined,
};

export const appMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0MB2YBOyALgJbZQanEnIA2xAXqVAMQAKAMgIICaioqAe1hViA7HxAAPRAFoAjACYAnBgDsADgXq5SgCxy5ANgCsCgMwAaEAE9EZgAy6M9uWeNLDZ9WYdeAvn5WaJg4+ERMGKg0yNZMbJwAqgDKAKISgsIkYhLSCPLKapraegYm5la2COrGGCbuGvbGBmZGqgFB6FhguAQkZJHRsWTMSQAqAPKs6UIi2UhSiLpmqhhKxvZKSvYbni4KFXbLGD7G+qoK7nK6uurtIMFdPeH9qMgArrCQbFy88xmz4nmuXyKg0Wh0+iMpksNkQEIw3l0GnOchRqjagXunVCvQirw+XzGKVYAH0AGLjABKAHVOJSACLTTKiQGgYHXOS1QyGXQeVSGao3U4HBByDYIrSePluQwKVRmO4PHHPFgQMRgCjYABuAgA1hrlVlsJwaFABHgqAALAC2AFlkABjS2kMBMgE5RZmDBixr2VS6LTqdT89QimQtQwI05mBS6dybU6oxWdNW4EajOmjEnjABqKUpbqNHryNxUJl5Ea0vMMSjDYqcWgUcnW63Me1ud2wAggcAkD2IEBorr+MyLQMQp0j6kaqPRukMqNjIrMvNWZgTBhn3OTIW6YT65Eo1DojDIhZZxfDXmOC7jNZu-phlQjtTk2lLelUSguO8e+7xgxMOecxsosjjeqiM72F4SL7LCCDmAotTTi4b4KOC-q-oaeLvJ8EDAayCx5D4KgXFo6Jflc9iyoYIqxkhXj8hy0HQeoSgdh0u5PAeBGXvONTcjyfICqcgphguGBNPYTbqIY-LsW4GKcRgqbDvwo4XuOeTNl60E1sY7iGI0xjLKoYboZGigeNZGgGY4SlYqgvFaTITReuWSiVuo1a1vB4ZsRKK4eNReh+nIAQBEAA */
  createMachine<AppMachineContext, AppMachineEvent, Typestate>({
    context: initialAppMachineContext,
    schema: { context: {} as AppMachineContext, events: {} as AppMachineEvent },
    id: 'app',
    initial: 'idle',
    states: {
      idle: {},
      generating: {
        invoke: {
          src: 'childMachine',
          id: 'generationAlgorithmMachine',
          onDone: [
            {
              target: '#app.done',
            },
          ],
        },
        initial: 'initializing',
        states: {
          initializing: {
            on: {
              PLAY: {
                target: '#app.generating.playing',
              },
            },
          },
          playing: {
            entry: 'startGenerationAlgorithmMachine',
            on: {
              PAUSE: {
                actions: 'pauseGenerationAlgorithmMachine',
                target: '#app.generating.paused',
              },
              STOP: {
                target: '#app.idle',
              },
            },
          },
          paused: {
            on: {
              PLAY: {
                actions: 'playGenerationAlgorithmMachine',
                target: '#app.generating.playing',
              },
              STEP_FORWARD: {
                actions: 'stepGenerationAlgorithmMachine',
                target: '#app.generating.paused',
              },
            },
          },
        },
      },
      done: {
        entry: 'rr78k',
        on: {
          START_OVER: {
            target: '#app.generating',
          },
        },
      },
    },
  }).withConfig({
    actions: {
      storeGridRef: assign<AppMachineContext, any>(
        (_, event: InjectRefsEvent) => {
          return {
            gridRef: event.gridRef,
          };
        }
      ),
      updateGenerationParams: assign<AppMachineContext, AppMachineEvent>({
        generationParams: ({ generationParams }, event) => {
          const { name, value } = event as SetGenerationParamEvent;
          return {
            ...generationParams,
            [name]: value,
          };
        },
      }),
      startGenerationAlgorithmMachine: send('START', {
        to: 'generationAlgorithmMachine',
      }),
      playGenerationAlgorithmMachine: send('PLAY', {
        to: 'generationAlgorithmMachine',
      }),
      pauseGenerationAlgorithmMachine: send('PAUSE', {
        to: 'generationAlgorithmMachine',
      }),
      stepGenerationAlgorithmMachine: send('STEP_FORWARD', {
        to: 'generationAlgorithmMachine',
      }),
      receiveChildUpdate: () => {},
    },
    services: {
      childMachine: () => {
        // Can switch between algorithm machines by checking context here.
        return generationAlgorithmMachine;
      },
    },
    delays: {
      INITIALIZATION_DELAY: () => {
        return 3000;
      },
    },
  });

const service = interpret(appMachine).onTransition((state) => {
  console.log('appMachine:', state.value);
});

service.start();

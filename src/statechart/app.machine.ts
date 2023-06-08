import { createMachine, ContextFrom } from 'xstate';
import {
  GenerationParams,
  AppMachineContext,
  AppMachineEvent,
} from './appMachineTypes';
import { generationAlgorithmMachine } from './recursiveBacktracker.machine';

const FPS_DEFAULT = 30;
const BORDER_WEIGHT_DEFAULT = 2;
const GRID_SIZE_DEFAULT = 15;

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
  generationSessionId: new Date().getTime(),
};

export const appMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEMB2YBOyALgJYD22AdKsgQLYWxiEDaADALqKiqmzEnkuIAB6IAtAE4ATBIoSAHAGZWU+QDYA7Gplr5AGhABPcQBYJrCgEZ50xRICsa1pZP2HAX3cG0qCgEkIABswDDwwADNYCmJsACswAGMWDiEePgFsIVEEMQ0TCykTeVZFJzc1ZSkDYxzFe0sKVXtFE1VLR3qNe09vdAoAcTBcAhJsKAwIYlhUQORDCgBXVAgiMDZOJBA0-jJMzez5KQ1G+w1WIqk61i7q8Qk1CkUtdQlS+XlLKXsTHpAfAaG+CIMXGOCBGQo4RiUwAFutUrwdoJ9og1EUrK8TMprlJ2op9EZxPZ7BQlPZ1BoZOVzhpfv9BsNgWN-NgdshAsQAF4gjAJciEPCkQJRGZzeGbbYZLLiRSFRoUiqOSysComW45S4WZRdVyWUpaZp0voM8EgigABVmhh5fOwAqFIuQC0Y4u4iKlKIQl3kpIk7WKT0sTlY5PVYi+snaCg+IcpijxRt8JpGZstcxt-MFwoYhFIqFdW3du2lOQ0il9GiU5gjlbLYZcJgoRScHy0r2uh0TAMZoygFqdjAgvMzDqoVoLkuLnsKjda3zs2lclQ0YbqDSaLTaHUsXS7yaZffNA8gw7tWaisFz+ZSEqLyNA2Vy5ZslbsKjctcUYZMD3aQaDpQ7u8Eg-F4fzGoCKbMkezonra9rZpeYC+OEpB4AA7jQEATneewPqiP6PCBKraJcsoaJYq52I0TzSCq0iOLK3Rgf8AAi5AhP8YSXjQyQbG66RTvhOSvA8ZbKGouiXFIagOOq7RNro8hnGo5LFJ0iieGB2CkBAcBCD4CKCfeIh3PIjbiSRhyyrJ9hhm4UiNCY7Q6jJ3ygb0vgBMERlInhpk5OoFgfnUNi6OcZirqojzxk4pRmHYUh7pBB6+R6wliM0PrKqcXTxuZSgroSOT2OcFBaPG+UBhIGh5MlPZmn4rIkOyXIgmlQkBWIZgWDltXNNYRSlGGmqPNc3z1PqqmaSxEENdBVrtbexn+Y+nzlpYLi1bK2LFEcI3NOVEjSDVWifLVKj1aa0HHhAHUmdkjiyBUlgOM4qgySNpSNCqLjWOYNU7moXbsbg92raipVWIclJSLiskyFUxX4k2cNOAoXwqmYoGeEAA */
  createMachine({
    schema: {
      context: {} as AppMachineContext,
      events: {} as AppMachineEvent,
    },
    tsTypes: {} as import('./app.machine.typegen').Typegen0,
    context: initialAppMachineContext,
    id: 'app',
    initial: 'Idle',
    states: {
      Idle: {
        on: {
          'refs.inject': {
            actions: ['storeGridRef'],
            target: 'Generating',
          },
        },
      },
      Generating: {
        initial: 'Initializing',
        invoke: {
          id: 'generationAlgorithmMachine',
          src: 'childMachine',
          data: (ctx) => {
            const defaultChildMachineContext = {
              canPlay: true,
              currentCell: undefined,
              eligibleNeighbors: [],
              stack: [],
              startIndex: 0,
            };

            const childContext: ContextFrom<typeof generationAlgorithmMachine> =
              {
                ...defaultChildMachineContext,
                fps: ctx.generationParams.fps,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                grid: (ctx.gridRef as any).current,
                pathId: ctx.generationSessionId.toString(),
              };

            return childContext;
          },
        },
        on: {
          'display.update': {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            actions: [() => {}],
          },
          'generation.finish': {
            target: 'Done',
          },
        },
        states: {
          Initializing: {
            on: {
              'controls.play': {
                target: 'Playing',
              },
            },
          },
          Playing: {
            onEntry: 'startGenerationAlgorithmMachine',
            on: {
              'controls.pause': {
                actions: ['pauseGenerationAlgorithmMachine'],
                target: 'Paused',
              },
              'controls.stop': {
                actions: ['refreshGenerationSessionId'],
                target: '#app.Idle',
              },
            },
          },
          Paused: {
            on: {
              'controls.play': {
                actions: ['playGenerationAlgorithmMachine'],
                target: 'Playing',
              },
              'controls.stop': {
                actions: ['refreshGenerationSessionId'],
                target: '#app.Idle',
              },
              'controls.step.forward': {
                actions: ['stepGenerationAlgorithmMachine'],
              },
            },
          },
        },
      },
      Done: {
        on: {
          'app.restart': {
            actions: ['refreshGenerationSessionId'],
            target: 'Idle',
          },
        },
      },
    },
    on: {
      'generation.param.set': {
        actions: ['updateGenerationParams'],
        target: 'Idle',
      },
    },
  });

// const service = interpret(appMachine).subscribe((state) => {
//   console.log('appMachine:', state.value);
// });

// service.start();

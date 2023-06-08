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
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEMB2YBOyALgJYD22AdKsgQLYWxiEDaADALqKiqmzEnkuIAB6IAtAE4ATBIoSAHAGZWU+QDYA7Gplr5AGhABPcQBYJrCgEZ50xRICsa1pZP2HAX3cG0qCgEkIABswDDwwADNYCmJsACswAGMWDiEePgFsIVEEMQ0TCykTeVZFJzc1ZSkDYxzFe0sKVXtFE1VLR3qNe09vdAoAcTBcAhJsKAwIYlhUQORDCgBXVAgiMDZOJBA0-jJMzez5KQ1G+w1WIqk61i7q8Qk1CkUtdQlS+XlLKXsTHpAfAaG+CIMXGABFyGsUptthksog1EUrK8TMprlJ2op9EZxPZ7BQlPZ1BoZOVzhpfv9BsNgWN-NgdshAsQAF4gjAJciEPCkQJRGZzdapXg7QT7cSKQqNIkVRyWVgVEy3HKXCzKLquSylLTNCl9KlA0ZQCgABVmhjZHOwXJ5fOQC0YguhwthYoQl3k+Ik7WKT0sTlYhKVYi+snaCg+AeJigxut8+pGIJNZotnO5vIYhFIqEd3GduzhOQ0ik9GiU5hDpaLQZcJgoRScHy0r2uh1jAOphpNdsYEHZqZtVDNOa2edFoGyhVrrW+dm0rkqGiDdQaTRabQ6li6bfjNKNxu7kD7VrTUVgmezUNz6XzrtyxZspbsKjclcUQZMD3afr9pU37wkPxeH8eqAgmtL7vah6Wta6ZnmAvjhKQeAAO40BAw4wje47wh+jwAfK2iXBKGiWEudiNE80jytIjgSt0QH-OCuAYP8YRnjQyQbFeIp7NhOSvA8RbKGouiXFIagOEq7R1ro8hnGohLFJ0iieEB2CkBAcBCD4QrXmOIh3PItZCQRhwShJ9hBm4UiNCY7TquJ3yAb0vgBMEuk8QWYjqBYL51DYujnGYS6qI80ZOKUZh2FI26gbuHkunxYjNB6cqnF00ZGUoi7Yjk9jnBQWjRplPoSBoeSxR2iZ+PSJCMiyIIJVhBk5GYFhpeVzTWEUpRBiqjzXN89RagpKkMSBVXgcmYxNfp2RiJ8xaWC45USqixRHH1zSFRI0hlVonzlSolUGomEE9rNvEtY4sgVJYDjOKo4l9aUjTyi41jmGVm5qG2TFgJdBYKe1hzElI6ISTIVS5Zidbg04ChfPKZiAZ4QA */
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
          Done: {
            target: 'Done',
          },
          'display.update': {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            actions: [() => {}],
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

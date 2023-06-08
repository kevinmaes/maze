import { createMachine, assign, sendParent } from 'xstate';

import type { IGrid } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { ICell } from '../components/generation/Cell';
import { Ref } from 'react';

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwHZgE4EMAuBLA9igIIA2U+6u2AFgLYCymAxtbmgMQCSKAVmE9gAE6MADNYAbQAMAXUSgADvlhUCKeSAAeiALQAOAJwA6AIx6pJgGwBWKdYBMAZmt7LlgDQgAnoj2Ojlnq21tYGhib2AOxSACwAvnGeqBg4aqTklDQMzKwcAAokmF7SckggSip4hBraCJGBRtEmMWEGjnb2Jp4+CM1GDpYxjo7NlpEGJtbxiSDJWFXEZBRUdIwsbGDseZgArrBgJRoVqtVltc0hjXr2MZZS9gaRDm3diI56jSZSBt+uk5ExFoJJJgNDzNJLTKrHIbdgAZWwYAUglEFAA7ph0BBDmVjgsar47v1Io5AZZ7HprtEYq8EI5IkYYuYTE89EzIiYDJZgbNQSkFulllk1rkwEZaJgAF5gHS4CAkTYIzHYHGKZQndRnRBuIxcyycpnNMxk2nGgKWAzWdpuWwGG56HlzVKEQVQ7LrNBGWDYZVsKDsTTenBizCiRHoAAUcIAotGANIAfU4ADkACrRgBKADUiAAZACU7CdAshK3doq9PvQeBQUFV5XV+K1CCGDM6rhiU2i1hM9NNrlMbliYxCYXsgUdfPBLtLwphnv2YAA1n72PW8WoCb17jF+m0JtZIk9xkF+5ZB3dx2zBhNHPZJ2DnYsMmWRRsjJgIAA3TAoJir9dG03ZsIikKRdTvKRHHJAxAVuDxvDeaCjGuC0JliaJDG5GZiwhF85w9ENv1-f9awDINEQ-MMMCjWNExTdNszzQtcJnfDoUIj9iL-P1AMqYDQFqWDrACKYyWcPRexGWkHn8ZoRnGGwTF7G4H35PChQ4isACNmCXbAsCYFcyL4jUt2U64jDAocYiaTtIlpK1-HpPQSTGGInCkVy1OnZ9NPLd9dKMgy9IAkxSjVfjTkE3wwKMKIWXJKQAV7MJHOGIwXLcgFPO8nkUHwCA4A0Vi-LdN80COIDoq0XRewZMwLBsDoJLcWkdEiexdQcCxhmGVxYJ8p9XVfecxQlaVZXlMAqqizUYoQfQ23sewHBGQ8LD0ftdzcS16TGLz7k5IaS3YgKFyrGsoFmsyQImTLoKsLCYmUl7TWcUwfn264QgUk6NPKsavTAZc-RupsFqPLqPP1EkoluTr7FNJlTDZLyewR0dHH+tj-Iqoifx42twYE2reiezK3HeVKuVsJHEN6FHjXR0YnlCbGcKnYbZy0wK9JCoywdxar5rJ5TLDkjlyQcKISTtWkXq6iZAg5KRBkSh1OcfU68aB0Q2FwWBqEgEmavOTkTE+UkBjGSTblpfURJUpl7QtDyTASBIgA */
  createMachine({
    tsTypes: {} as import("./recursiveBacktracker.machine.typegen").Typegen0,
    schema: {
      context: {} as {
        canPlay: boolean;
        currentCell: ICell | undefined;
        eligibleNeighbors: ICell[];
        fps: number;
        grid: IGrid | undefined;
        pathId: string;
        stack: ICell[];
        startIndex: number;
      },
      events: {} as
        | {
            type: 'Inject refs';
            params: { gridRef: Ref<IGrid> };
          }
        | {
            type: 'Start';
          }
        | {
            type: 'Play';
          }
        | {
            type: 'Pause';
          }
        | {
            type: 'Step forward';
          }
        | {
            type: 'Update';
          }
        | {
            type: 'Done';
          },
    },
    id: 'generationAlgorithmMachine',
    initial: 'maze-idle',
    states: {
      'maze-idle': {
        on: {
          Start: {
            target: 'starting',
          },
        },
      },
      starting: {
        entry: ['initGeneration', 'visitStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: 'seeking',
          },
        },
      },
      seeking: {
        entry: ['findNeighbors', sendParent({ type: 'Update' })],
        always: {
          target: 'advancing',
        },
      },
      advancing: {
        entry: ['pickNextCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: 'seeking',
          },
        },
        always: {
          cond: 'isDeadEnd',
          target: 'backtracking',
        },
      },
      backtracking: {
        entry: 'popFromStack',
        always: [
          {
            cond: 'isBackAtStart',
            target: 'finished',
          },
          {
            target: 'seeking',
          },
        ],
      },
      finished: {
        entry: sendParent({ type: 'Done' }),
      },
    },
    on: {
      'Inject refs': {
        target: '.maze-idle',
      },
      Play: {
        actions: 'play',
        target: '.seeking',
      },
      Pause: {
        actions: 'pause',
      },
      'Step forward': {
        target: '.seeking',
      },
    },
  }).withConfig({
    guards: {
      canIPlay: (ctx) => ctx.canPlay,
      isDeadEnd: ({ eligibleNeighbors }) => eligibleNeighbors.length === 0,
      isBackAtStart: ({ stack }) => stack.length === 0,
    },
    actions: {
      initGeneration: assign({
        currentCell: (ctx) => (ctx.grid as IGrid).getStartCell(),
      }),
      visitStartCell: (ctx) => {
        const currentCell = (ctx.grid as IGrid).getStartCell();
        return currentCell.visit(null, ctx.pathId);
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      play: assign({ canPlay: (_) => true }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      pause: assign({ canPlay: (_) => false }),
      findNeighbors: assign({
        eligibleNeighbors: ({ grid, currentCell }) =>
          (grid as IGrid).getEligibleNeighbors(currentCell as ICell),
      }),
      pickNextCell: assign(({ grid, pathId, startIndex, currentCell }) => {
        const verifiedGrid = grid as IGrid;
        return {
          currentCell: seek({
            grid: verifiedGrid,
            pathId,
            current: currentCell as ICell,
            startIndex,
          }),
        };
      }),
      pushToStack: assign(({ stack, currentCell }) => {
        if (currentCell) {
          stack.push(currentCell);
        }
        return { stack };
      }),
      popFromStack: assign(({ stack }) => {
        const prevCell = stack.pop() as ICell;
        prevCell?.setAsBacktrack();
        return { stack, currentCell: prevCell };
      }),
    },
    delays: {
      SEEK_INTERVAL: ({ fps }) => 1000 / fps,
    },
  });

// const service = interpret(generationAlgorithmMachine).subscribe((state) => {
//   console.log('recursiveBacktrackerMachine:', state.value);
// });

// service.start();

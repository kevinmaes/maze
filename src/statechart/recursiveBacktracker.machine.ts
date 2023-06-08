import { createMachine, assign, sendParent } from 'xstate';

import type { IGrid } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { ICell } from '../components/generation/Cell';
import { Ref } from 'react';

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwHZgE4EMAuBLA9igIIA2U+6u2AFgLYCymAxtbmgMTpgBmsAdGwBWYJtgDaABgC6iUAAd8sKgRSyQAD0QBaAMwBGAJx99Adh0GAHBZ0AWCwCYLJmwBoQAT216TfJzoCsEgBsznoSEgYmwQC+0W6oGDgqpOSUNAzMrBxMhNjo+CT8ciSY7pIySCAKSniEapoI-v56fPb2Zv6R-hYGQTZ6bp4IWvZGPXYmVk029jr23bHxYGhYtcRkFFR0jCxsYOw5KHkFRZgArrBg5WrVynWVDSaWfP42Bt7+zgYzIYOIr-ZjLNJjYJBYghIbEEdIsQAlVskNmltpk9gdcvlCnxYNgwHI+NwKAB3TDoCDXSq3Nb1RBBQx8PSOILfew2fTtHR-YaTBnfHQQ8w6EyvIJBWHwpKEFKbdI7LJgPi0TAALzAWlwEBI+wla2x2FJ4mkN0Ud1UDy8fT4BgMYL6eh0Dsh1i5emZvgkYScEiZ1va4uWiTW0uRGV2aD1BrYUHY6hxOAVmG4uPQAAoAMoAUQzAGkAPoASQAcgAVDMAJQAakQADIASnYOsRqS2oflEfQeBQUAp8hN1PNCFGFmMNhsJiCFhs3T61pdJhao2FJmFEhM9j0b39K0l62bstR4bTYDAAGso+we1U+yoaQhrEEXm91-b-HMQgY5wuusvAmuNwYt0DJsZRRMMEwgAA3TAUCYc9LypG8Bz0bxhyaVlxyFSF7CCOdAQkfxsPw9oHGQwCESlJEWzlPY+EwSDoNgrsYzjXFaKTDB0yzPMi1LSsa3rRsKL3UC2zoqCYKjeDr3uUBHlfXwLGaWwHW6Vd7C5OkGSiAJMIkcwzDIndgyog8FQAI2YE88ksuCjUpaSzVkxAXwkYw6VGIJmm+D1OQ8RBsJ0F5wh6MwLEZUcYTiOEA3I3cQNbGiLKYKysGSuC9AqXsakQpyEEZeTmmcewwSaYJXD8hA3z4Ox2Tme0eg9ExYiilB8AgOA1EEuKQ2otBjWymSNG0fkfFMcwrFsBwnHKoYtFdfw+BCRxgnePQvJsQyg0o-cwMVFU1Q1LV+tNW9dG8BlCuZcduj0e8XTdCwPTBKIfQMP0oq64ydrbOMOyjY7+1ysw+DBKEwWsMJ+Tel1iqBQxiv5BHsI2j6YqM7aRJoo9T3++yBscoaEAhB8dCsDdRnmJT-BdB1jDWoImRFYVrE24CetM2j6IkrsAZywmDE+VpRwMIUPPw5CacC-R-AZ8Eme6SKlm3LbhIS8MkpSmyebxk6kIdFoCIZ61IkenCKo3EmIn18Ewhl71WaE+LeoVbg2FwWBqEgXnBoae0IRBicNyhaERdmLlSYW8FoRmWZwRtUdmuiIA */
  createMachine({
    tsTypes: {} as import('./recursiveBacktracker.machine.typegen').Typegen0,
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
            type: 'refs.inject';
            params: { gridRef: Ref<IGrid> };
          }
        | {
            type: 'generation.start';
          }
        | {
            type: 'controls.play';
          }
        | {
            type: 'controls.pause';
          }
        | {
            type: 'controls.step.forward';
          }
        | {
            type: 'display.update';
          },
    },
    id: 'generationAlgorithmMachine',
    initial: 'maze-idle',
    states: {
      'maze-idle': {
        on: {
          'generation.start': {
            target: 'starting',
          },
        },
      },
      starting: {
        entry: ['initGeneration', 'visitStartCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: 'Seeking',
          },
        },
      },
      Seeking: {
        entry: ['findNeighbors', sendParent({ type: 'display.update' })],
        always: {
          target: 'advancing',
        },
      },
      advancing: {
        entry: ['pickNextCell', 'pushToStack'],
        after: {
          SEEK_INTERVAL: {
            cond: 'canIPlay',
            target: 'Seeking',
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
            target: 'Seeking',
          },
        ],
      },
      finished: {
        entry: sendParent({ type: 'generation.finish' }),
      },
    },
    on: {
      'refs.inject': {
        target: '.maze-idle',
      },
      'controls.play': {
        actions: 'play',
        target: '.Seeking',
      },
      'controls.pause': {
        actions: 'pause',
      },
      'controls.step.forward': {
        target: '.Seeking',
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

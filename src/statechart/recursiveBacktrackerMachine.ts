import { createMachine, assign, sendParent } from 'xstate';

import type { IGrid } from '../components/generation/Grid';

import { seek } from '../components/generation/seek';
import { ICell } from '../components/generation/Cell';
import { Ref } from 'react';

export const generationAlgorithmMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QwHZgE4EMAuBLA9igIIA2U+6u2AFgLYCymAxtbmgMQCSKAVmE9gAE6MADNYAbQAMAXUSgADvlhUCKeSAAeiALQAOAJwA6AIx6pJgOwAWS5YCsU+wDYpAZgA0IAJ6ITUowMrKSlnA0MDA0sAJjc3AF94r1QMHDVSckoaBmZWDgAFEkxvaTkkECUVPEINbQQHPSNrN3t7a2s9PTtIgy9fBB0TaKN3ZxiDZ2drWNDoxOSwNCxq4jIKKjpGFjYwdnyiAFUAZQBRUo1K1Rryup1ovRMjSxMp6ylmvWapA2s+xDdopYjPYJmFms57C0DHMkiAUst0mssptcjt2EdsGAFIJRBQAO6YdAQc7lS4rWqIPQg0zRaJSLrWMzvaK-Hx+AJBSwhMIRKKxBKw+FpQgZdbZLZ5MBGWiYABeYB0uAgJF2RwAKkQAEpqkmKZRXdQ3RCOJqMyImew2aauTxshBmaxGSYGSGWMb0qTREwGeZwxapFai5E5bZoIywbCEvAoKDsTQRnBSzCiTHoAAUpxOAGkAPqcAByapOmoAakQADIASnYQsDSI2Icl4cj6GjUF1FX15KNCGaQK9eimbS59hMbksf3tg9Mk3eY1a4Wizj0vtriMyDYlO3DYDAAGs2LGO2S1BT7Z7HSC3EFLQ5LOF7JOzM4Z64l58pkEAav-QiRfXxVRMNMAgAA3TAUCYQ92GPLtTx7IYQkCAEpHvB5PTMSc3GsewRmdZx-BdJwugFBYlmFVYN0A0MkzAiCoJjOME0xIxk1TDMTmzPNC2LMsqxrX8KKDTcgNo8DIMPWCqng0A6h+XCIXaaxnBaB44hMSdogMNxTGaKwJlHMcWR-ci6yolEaKMAAjZg92wLAmAPRipINM8TDMYZuRUpxmjcPRsMnW9AiXNxULecd3hMEyA3XMULKbGzHPs2zoIkEwyj1aTrlkxB72GLk3DMOI2jaExWX6VoAjMTplOXew6U9RJYRQfAIDgDQ13-czGx2C44OyrRdDHIEmSsWwHCcG1Jx0SJgQtKw9BZAwQnCaxor-Si4p6sMZXlRVlTAPqssNHKBi6IxaWierCstCw9CfT4nTCV13XML0fUFQSzK2rcwwTVtDyO1yEKCIw4gI5cJkZMqNLtMdcO9dw3UW1pCssdahIA+Lt1gXcnKgIHu1OuxhmtKwARsMZaSfDpTE+elR2Uhwrwx77g1+sT6MB0l+pOwb7ReRo3EmPyx0iCFPRpxoHQZsr5xZz7TNi9nROs2zksc7nMuB073JU0xnhBMIxwBQrJxwl97HMRdrAfM10cVmKup+1XRDYXBYGoSBCZk-n3NB55sLaPyXWXe67VnIxPiu0KrEsCm1qaoA */
  createMachine({
    tsTypes: {} as import('./recursiveBacktrackerMachine.typegen').Typegen0,
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

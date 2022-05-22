import { Ref } from 'react';
import { ICell } from '../components/generation/Cell/types';
import type { IGrid } from '../components/generation/Grid';

export interface MazeGenerationContext {
  canPlay: boolean;
  currentCell: ICell | undefined;
  eligibleNeighbors: ICell[];
  fps: number;
  grid: IGrid | undefined;
  pathId: string;
  stack: ICell[];
  startIndex: number;
}

export type MazeGenerationEvent =
  | {
      type: 'INJECT_REFS';
      gridRef: Ref<IGrid>;
    }
  | {
      type: 'START';
    }
  | {
      type: 'PLAY';
    }
  | {
      type: 'PAUSE';
    }
  | {
      type: 'STEP_FORWARD';
    }
  | {
      type: 'UPDATE';
    }
  | {
      type: 'DONE';
    };

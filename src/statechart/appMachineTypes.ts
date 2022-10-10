import { Ref } from 'react';
import { IGrid } from '../components/generation/Grid';

export enum GenerationParamsId {
  BORDER_WEIGHT = 'borderWeight',
  CELL_SIZE = 'cellSize',
  FPS = 'fps',
  GRID_COLUMNS = 'gridColumns',
  GRID_ROWS = 'gridRows',
}

export type GridRef = Ref<IGrid>;

export interface GenerationParams {
  // Needed only by the State/Grid/Cells (not the algorothm).
  borderWeight: number; // Passed down to Grid/cell.

  // Needed only by the State/Grid/Cells (not the algorothm).
  cellSize: number; // Passed down to Grid/cell.

  // Maybe controlled by the App but passed down to the
  // algo machine so it can set up its own timer
  // but still be overridden by play/pause functionality.
  fps: number; // Passed down to algo along with pause/play.

  // Needed only by the State/Grid/Cells (not the algorothm).
  gridColumns: number; // Passed down to algo.

  // Needed only by the State/Grid/Cells (not the algorothm).
  gridRows: number; // Passed down to algo.
}

export interface AppMachineContext {
  mazeId: string;
  generationParams: GenerationParams;
  gridRef: GridRef | undefined;
  generationSessionId: number;
}

export type AppMachineEvent =
  | { type: 'PLAY' }
  | { type: 'STOP' }
  | { type: 'PAUSE' }
  | { type: 'START_OVER' }
  | { type: 'STEP_FORWARD' }
  | {
      type: 'SET_GENERATION_PARAM';
      name: string;
      value: number;
    }
  | {
      type: 'INJECT_REFS';
      gridRef: GridRef;
    }
  | { type: 'UPDATE' }
  | { type: 'DONE' };

export type AppMachineEventId = AppMachineEvent['type'];

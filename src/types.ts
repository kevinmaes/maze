export interface AlgorithmGenerationParams {
  // Maybe controlled by the App but passed down to the
  // algo machine so it can set up its own timer
  // but still be overridden by play/pause functionality.
  fps: number;
}

export interface GenerationParams extends AlgorithmGenerationParams {
  // Needed only by the State/Grid/Cells (not the algorithm).
  borderWeight: number; // Passed down to Grid/cell.

  // Needed only by the State/Grid/Cells (not the algorithm).
  cellSize: number; // Passed down to Grid/cell.

  // Needed only by the State/Grid/Cells (not the algorithm).
  gridColumns: number;

  // Needed only by the State/Grid/Cells (not the algorithm).
  gridRows: number;
}

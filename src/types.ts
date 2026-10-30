export interface AlgorithmGenerationParams {
  // Maybe controlled by the App but passed down to the
  // algo machine so it can set up its own timer
  // but still be overridden by play/pause functionality.
  fps: number;
}

export interface GenerationParams extends AlgorithmGenerationParams {
  // Needed only by the renderer (not the algorithm).
  borderWeight: number;

  // Needed only by the renderer (not the algorithm).
  cellSize: number;

  // Used to create the maze (not the algorithm).
  gridColumns: number;

  // Used to create the maze (not the algorithm).
  gridRows: number;
}

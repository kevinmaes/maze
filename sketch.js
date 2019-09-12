const FRAME_RATE = null;

const CELL_SIZE = 25;
const BORDER_WEIGHT = 0.5 * CELL_SIZE;
const GRID_COLUMNS = 5;
const GRID_ROWS = 5;
const CELL_TOTAL = GRID_COLUMNS * GRID_ROWS;
const START_INDEX = 0;
const END_INDEX = CELL_TOTAL - 1;

let currentCellA;
let currentCellZ;
let nextA;
let nextZ;
const stackA = [];
const stackZ = [];

let solutionCurrentCell;
let nextNextCell;
let solutionStack = [];

const grid = {
  rows: GRID_ROWS,
  cols: GRID_COLUMNS,
  cells: [],
};

function setup() {
  createCanvas(1000, 1000);
  createGrid(GRID_ROWS * GRID_COLUMNS, CELL_SIZE);
}

function createGrid(cellTotal, cellSize) {
  const middleColIndex = Math.floor(GRID_COLUMNS / 2);
  const middleRowIndex = Math.floor(GRID_ROWS / 2);
  const middleIndex = middleRowIndex * GRID_COLUMNS + middleRowIndex;

  for (let index = 0; index < cellTotal; index++) {
    const cell = new Cell({
      index,
      grid,
      size: cellSize,
      borderWeight: BORDER_WEIGHT,
      visitedColor: 'rgb(208, 222, 247)',
      isStart: index === START_INDEX,
      isMiddle: index === middleIndex,
      isEnd: index === END_INDEX,
    });

    // if (getIsBlockedInternal(cell)) {
    //   cell.blockedInternal = true;
    //   cell.visited = true;
    // }

    // if (getIsBlockedExternal(cell)) {
    //   cell.blockedExternal = true;
    //   cell.visited = true;
    // }

    grid.cells.push(cell);
  }
}

let pathsConnected = false;

function draw() {
  frameRate(FRAME_RATE);
  background('white');

  // Seek path A
  currentCellA = seek({
    pathId: 'a',
    current: currentCellA,
    startIndex: START_INDEX,
    stack: stackA,
  });

  // Seek path Z.
  currentCellZ = seek({
    pathId: 'z',
    current: currentCellZ,
    endIndex: END_INDEX,
    stack: stackZ,
  });

  if (!pathsConnected && !currentCellA) {
    const middleRowIndex = Math.floor(GRID_ROWS / 2);

    for (
      let i = middleRowIndex * GRID_COLUMNS;
      i < (middleRowIndex + 1) * GRID_COLUMNS;
      i++
    ) {
      const thisMiddleRowCell = grid.cells[i];
      const cellANeighbors = thisMiddleRowCell.getNeighbors(grid);

      if (cellANeighbors.length) {
        const otherPathNeighbor = cellANeighbors.find(cell =>
          cell.hasDifferentPathId(thisMiddleRowCell)
        );

        if (otherPathNeighbor) {
          thisMiddleRowCell.connect(otherPathNeighbor);
          pathsConnected = true;
          // console.log(
          //   'Paths connect between indices:',
          //   thisMiddleRowCell.index,
          //   otherPathNeighbor.index
          // );
          break;
        }
      }
    }
  }

  //   if(pathsConnected) {
  //     // Implement solution here?
  //     solutionCurrentCell = seekSolution({
  //       pathId: 's',
  //       current: solutionCurrentCell,
  //       stack: solutionStack,
  //     });

  //     console.log('solutionCurrentCell', solutionCurrentCell);

  //   }

  // Draw all cells.
  for (let cell of grid.cells) {
    cell.draw();
  }
}

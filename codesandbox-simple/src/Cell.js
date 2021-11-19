export default class Cell {
  constructor({ index, rowIndex, colIndex }) {
    this.index = index;
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;

    this.visited = false;
  }

  isVisited() {
    return this.visited;
  }

  visit() {
    this.visited = true;

    return this;
  }
}

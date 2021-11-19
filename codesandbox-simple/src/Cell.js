export default class Cell {
  constructor({ index, rowIndex, colIndex }) {
    this.index = index;
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;

    this.visited = false;
  }

  getConnections() {
    return this.connections;
  }

  isVisited() {
    return this.visited;
  }

  visit(prevCell, pathId) {
    this.visited = true;

    return this;
  }
}

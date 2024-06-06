class GameOfLife {
  constructor(rows, cols) {
    this.rows = rows; // Number of rows in the board
    this.cols = cols; // Number of columns in the board
    this.liveCells = new Set(); // Set to track live cells using a hash of their coordinates
  }

  // Initialize the board with the initial state of live cells
  initializeBoard(initialState) {
    this.liveCells.clear();
    initialState.forEach(([row, col]) => {
      this.liveCells.add(this.hash(row, col));
    });
  }

  // Get the next generation of the board
  getNextGeneration() {
    const newLiveCells = new Set();
    const potentialCells = new Set();

    // Add all live cells and their neighbors to potentialCells
    this.liveCells.forEach((hash) => {
      const [row, col] = this.unhash(hash);
      potentialCells.add(hash); // Add the live cell itself
      this.getNeighbors(row, col).forEach((neighbor) => {
        potentialCells.add(neighbor);
      });
    });

    // Process all potential cells to determine the new generation of live cells
    potentialCells.forEach((hash) => {
      const [row, col] = this.unhash(hash);
      const liveNeighbors = this.countLiveNeighbors(row, col);
      if (this.liveCells.has(hash)) {
        if (liveNeighbors === 2 || liveNeighbors === 3) {
          newLiveCells.add(hash);
        }
      } else {
        if (liveNeighbors === 3) {
          newLiveCells.add(hash);
        }
      }
    });

    this.liveCells = newLiveCells;
  }

  // Count the live neighbors of a cell
  countLiveNeighbors(row, col) {
    return this.getNeighbors(row, col).reduce((count, hash) => {
      return count + (this.liveCells.has(hash) ? 1 : 0);
    }, 0);
  }

  // Get the neighbors of a cell, accounting for wrap-around (toroidal array)
  getNeighbors(row, col) {
    const neighbors = [];
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      for (let xOffset = -1; xOffset <= 1; xOffset++) {
        if (yOffset === 0 && xOffset === 0) continue; // Skip the cell itself
        const r = (row + yOffset + this.rows) % this.rows;
        const c = (col + xOffset + this.cols) % this.cols;
        neighbors.push(this.hash(r, c));
      }
    }
    return neighbors;
  }

  // Convert row and column to a hash for set storage
  hash(row, col) {
    return `${row},${col}`;
  }

  // Convert a hash back to row and column
  unhash(hash) {
    return hash.split(',').map(Number);
  }

  // Get the current state of the board
  getBoard() {
    return {
      size: { rows: this.rows, cols: this.cols },
      liveCells: Array.from(this.liveCells).map((hash) => this.unhash(hash)),
    };
  }

  // Get the current state of the board for saving
  getBoardState() {
    return {
      size: { rows: this.rows, cols: this.cols },
      liveCells: Array.from(this.liveCells).map((hash) => this.unhash(hash)),
    };
  }
}

module.exports = GameOfLife;

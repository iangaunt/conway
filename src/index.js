// The width and height of the grid displayed.
const WIDTH = 50;
const HEIGHT = WIDTH / 2;

// Character constants to store the alive and dead cell icons.
const DEAD_CELL = "•";
const ALIVE_CELL = "@";

const ECOSYSTEM = document.getElementsByClassName("ecosystem")[0];

// Contains a 2-d array of size [HEIGHT, WIDTH] where each individual
// index contains the HTML element of the cell at [i, j].
let cells = [];

// Stores all active cells to check (alive cells or cells with >=1 neighbor).
let cellsToCheck = new Set();

// Variables to store the game state.
let playing = false;
let runningInterval = null;

/**
 * Toggles the current state of the cell, setting it to
 * alive or dead depending on its internal character.
 * 
 * @param {HTMLElement} element - The element to toggle.
 */
function toggleCellState(r, c) {
    let element = cells[wrapAround(r, HEIGHT)][wrapAround(c, WIDTH)];
    
    if (element.innerHTML === DEAD_CELL) {
        for (let i = r - 1; i <= r + 1; i++) {
            for (let j = c - 1; j <= c + 1; j++) {
                cellsToCheck.add(cells[wrapAround(i, HEIGHT)][wrapAround(j, WIDTH)]);
            }
        } 

        element.innerHTML = ALIVE_CELL;

        element.classList.remove("dead");
        element.classList.add("alive");
    } else {
        for (let i = r - 1; i <= r + 1; i++) {
            for (let j = c - 1; j <= c + 1; j++) {
                if (getAliveNeighbors(wrapAround(i, HEIGHT), wrapAround(j, WIDTH)) == 1) {
                    cellsToCheck.delete(cells[wrapAround(i, HEIGHT)][wrapAround(j, WIDTH)]);
                }
            }
        } 
        
        element.innerHTML = DEAD_CELL;

        element.classList.remove("alive");
        element.classList.add("dead");
    }
}

/**
 * Constructs an empty board of cells. Runs at the beginning of
 * the website and when the "Reset" button is pressed.
 */
function buildCells() {
    cells = [];
    cellsToCheck = new Set();

    while (ECOSYSTEM.firstElementChild) {
        ECOSYSTEM.removeChild(ECOSYSTEM.firstElementChild);
    }

    for (let row = 0; row < WIDTH; row++) {
        let r = [];
        for (let col = 0; col < HEIGHT; col++) {
            r.push(DEAD_CELL);
        }
        cells.push(r);
    }
    
    for (let i = 0; i < HEIGHT; i++) {
        let row = document.createElement("div");

        for (let j = 0; j < WIDTH; j++) {
            let cell = document.createElement("p");
            cell.innerHTML = DEAD_CELL;
            cell.classList.add("dead");

            cell.row = i; cell.col = j;

            cell.style.height = (ECOSYSTEM.offsetHeight / HEIGHT) + "px";
            cell.style.width = (ECOSYSTEM.offsetWidth / WIDTH) + "px";

            cell.onclick = function() { toggleCellState(i, j) };

            cells[i][j] = cell;
            row.appendChild(cell);
        }
        ECOSYSTEM.appendChild(row);
    }
}

function runGeneration() {
    if (playing == false) {
        playing = true;
        document.getElementById("play").innerHTML = "> Pause";

        runningInterval = setInterval(function() {
            console.log("hello");
            nextGeneration();
        }, 250);
    } else {
        playing = false;
        document.getElementById("play").innerHTML = "> Play";

        if (runningInterval != null) clearInterval(runningInterval);
    }
}

/**
 * Updates all relevant cells on the board (those which contain at least
 * one live neighbor) to their new status on the board, and calculates the 
 * next cells which we will check in the next generation.
 */
function nextGeneration() {
    let updatedCells = new Map();
    let updatedCellsToCheck = new Set();

    for (let cell of cellsToCheck) {
        let neighbors = getAliveNeighbors(cell.row, cell.col);

        updatedCells.set(cell, cell.innerHTML);
        if (cell.innerHTML === ALIVE_CELL) {
            if (neighbors != 2 && neighbors != 3) {
                updatedCells.set(cell, DEAD_CELL);
            }
        } else {
            if (neighbors == 3) {
                updatedCells.set(cell, ALIVE_CELL)
            }
        }
        
        if (neighbors != 0) {
            let row = cell.row; 
            let col = cell.col;

            for (let i = row - 1; i <= row + 1; i++) {
                for (let j = col - 1; j <= col + 1; j++) {
                    updatedCellsToCheck.add(cells[wrapAround(i, HEIGHT)][wrapAround(j, WIDTH)]);
                }
            } 
        }
    }

    for (let cell of updatedCells.keys()) {
        let c = cells[cell.row][cell.col].innerHTML;
        if (c != updatedCells.get(cell)) {
            toggleCellState(cell.row, cell.col);
        }
    }

    cellsToCheck = updatedCellsToCheck;
}

/**
 * Returns the amount of alive neighbors in the 8 cells 
 * surrounding the cell positioned at row, col.
 * 
 * @param {number} row - The row of the cell. 
 * @param {number} col - The column of the cell.
 * @returns {number} - The amount of alive neighbors in the 8 surrounding cells.
 */
function getAliveNeighbors(row, col) {
    let alive = 0;

    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            if (i == row && j == col) continue;

            let cell = cells[wrapAround(i, HEIGHT)][wrapAround(j, WIDTH)];
            console.log(wrapAround(i, HEIGHT) + " : " + wrapAround(j, WIDTH));
            
            if (cell.innerHTML === ALIVE_CELL) {
                alive++;
            }
        }
    }

    return alive;
}

/**
 * Wraps the number n around the range 0 - upper, bounding it
 * inside that range. Mainly used to fetch tiles on the opposite
 * side of the grid.
 * 
 * If n > upper, then it will return the remainder of n / upper.
 * If n < 0, then it will return the sum of upper and n (essentially substracting).
 * 
 * @param {number} n - The value to be wrapped (can be in the domain -infinity to infinity).
 * @param {number} upper - The upper boundary of the range to wrap.
 * @returns - The wrapped value n in the range 0 -upper.
 */
function wrapAround(n, upper) {
    if (n < 0) return upper - 1 + n;
    if (n > upper) return n % upper;

    return n;
}

buildCells();
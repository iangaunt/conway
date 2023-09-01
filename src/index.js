const WIDTH = 40;
const HEIGHT = 20;

const DEAD_CELL = "•";
const ALIVE_CELL = "@";

const ECOSYSTEM = document.getElementsByClassName("ecosystem")[0];

let cells = [];
let cellsToCheck = new Set();

let playing = false;
let runningInterval = null;

/**
 * Toggles the current state of the cell, setting it to
 * alive or dead depending on its internal character.
 * 
 * @param {HTMLElement} element - The element to toggle.
 */
function toggleCellState(r, c) {
    let element = cells[r][c];
    
    if (element.innerHTML === DEAD_CELL) {
        for (let i = r - 1; i <= r + 1; i++) {
            for (let j = c - 1; j <= c + 1; j++) {
                cellsToCheck.add(cells[i][j]);
            }
        } 

        element.innerHTML = ALIVE_CELL;

        element.classList.remove("dead");
        element.classList.add("alive");
    } else {
        for (let i = r - 1; i <= r + 1; i++) {
            for (let j = c - 1; j <= c + 1; j++) {
                cellsToCheck.delete(cells[i][j]);
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

function nextGeneration() {
    let updatedCells = new Map();
    let updatedCellsToCheck = new Set();

    for (let cell of cellsToCheck) {
        let neighbors = getAliveNeighbors(cell.row, cell.col);

        /*
        Any live cell with two or three live neighbours survives.
        Any dead cell with three live neighbours becomes a live cell.
        All other live cells die in the next generation. Similarly, all other dead cells stay dead.
        */
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
 * Returns the amount of neighbors which are alive, given the
 * coordinate of a cell on the cells grid.
 */
function getAliveNeighbors(row, col) {
    let alive = 0;

    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            if (i == row && j == col) continue;

            let cell = cells[wrapAround(i, HEIGHT)][wrapAround(j, WIDTH)];
            if (cell.innerHTML === ALIVE_CELL) {
                alive++;
            }
        }
    }

    return alive;
}

/**
 * Wraps the number n around the range 0 - upper.
 * @param {*} n 
 * @param {*} upper 
 * @returns 
 */
function wrapAround(n, upper) {
    if (n < 0) return upper + n;
    if (n > upper) return n % upper;

    return n;
}

buildCells();
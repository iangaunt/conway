const WIDTH = 40;
const HEIGHT = 20;

const DEAD_CELL = "•";
const ALIVE_CELL = "@";

const ECOSYSTEM = document.getElementsByClassName("ecosystem")[0];

let cells = [];

/**
 * Toggles the current state of the cell, setting it to
 * alive or dead depending on its internal character.
 * 
 * @param {HTMLElement} element - The element to toggle.
 */
function toggleCellState(element) {
    if (element.innerHTML === DEAD_CELL) {
        element.innerHTML = ALIVE_CELL;

        element.classList.remove("dead");
        element.classList.add("alive");
    } else {
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

            cell.style.height = (ECOSYSTEM.offsetHeight / HEIGHT) + "px";
            cell.style.width = (ECOSYSTEM.offsetWidth / WIDTH) + "px";

            cell.onclick = function() { toggleCellState(cell) };

            row.appendChild(cell);
        }
        ECOSYSTEM.appendChild(row);
    }
}

buildCells();
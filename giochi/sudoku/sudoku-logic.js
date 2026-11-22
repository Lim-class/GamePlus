const gridSize = 9;
let solution = [];
let puzzle = [];

function startNewGame() {
    generateSudoku();
    renderGrid();
}

function generateSudoku() {
    // Soluzione base valida
    solution = [
        [5,3,4,6,7,8,9,1,2], [6,7,2,1,9,5,3,4,8], [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3], [4,2,6,8,5,3,7,9,1], [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4], [2,8,7,4,1,9,6,3,5], [3,4,5,2,8,6,1,7,9]
    ];
    // Rimuove numeri casualmente (difficoltà)
    puzzle = solution.map(row => row.map(cell => (Math.random() > 0.4 ? cell : null)));
}

function renderGrid() {
    const gridEl = document.getElementById('sudoku-grid');
    gridEl.innerHTML = '';
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const input = document.createElement('input');
            input.type = 'tel';
            input.maxLength = 1;
            input.className = 'sudoku-cell';
            
            if (puzzle[r][c] !== null) {
                input.value = puzzle[r][c];
                input.readOnly = true;
                input.classList.add('fixed');
            } else {
                input.classList.add('user-input');
                input.oninput = function() {
                    this.value = this.value.replace(/[^1-9]/g, '');
                    this.classList.remove('error');
                };
            }
            input.dataset.row = r;
            input.dataset.col = c;
            gridEl.appendChild(input);
        }
    }
}

function checkSolution() {
    const inputs = document.querySelectorAll('.sudoku-cell.user-input');
    inputs.forEach(input => {
        const r = input.dataset.row;
        const c = input.dataset.col;
        if (input.value != "" && input.value != solution[r][c]) {
            input.classList.add('error');
        } else if (input.value != "") {
            input.classList.remove('error');
        }
    });
}

function getHint() {
    const inputs = Array.from(document.querySelectorAll('.sudoku-cell.user-input'))
                        .filter(i => i.value == "");
    if (inputs.length > 0) {
        const randomInput = inputs[Math.floor(Math.random() * inputs.length)];
        const r = randomInput.dataset.row;
        const c = randomInput.dataset.col;
        randomInput.value = solution[r][c];
        randomInput.classList.add('hint');
        randomInput.readOnly = true;
    }
}

// Avvio automatico
window.onload = startNewGame;
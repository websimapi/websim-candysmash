export default class Board {
    constructor(size, candyTypes, onMatchCallback) {
        this.size = size;
        this.candyTypes = candyTypes;
        this.onMatch = onMatchCallback;
        this.grid = [];
        this.boardElement = document.getElementById('game-board');
        this.candySize = this.boardElement.clientWidth / size;
        this.setupBoard();
    }

    setupBoard() {
        this.boardElement.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
        this.boardElement.style.width = `${this.size * 50}px`;
        this.boardElement.style.height = `${this.size * 50}px`;
        this.candySize = 50;
    }

    initialize() {
        for (let row = 0; row < this.size; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.size; col++) {
                this.grid[row][col] = this.createCandy(row, col, true);
            }
        }
        // Ensure no matches on start
        while(this.findAllMatches().length > 0) {
            this.processMatches(true);
        }
    }

    createCandy(row, col, isInitializing = false) {
        const type = this.candyTypes[Math.floor(Math.random() * this.candyTypes.length)];
        const candy = document.createElement('div');
        candy.classList.add('candy');
        candy.dataset.row = row;
        candy.dataset.col = col;
        candy.dataset.type = type;
        candy.style.backgroundImage = `url(${type})`;
        candy.style.width = `${this.candySize}px`;
        candy.style.height = `${this.candySize}px`;
        
        if (isInitializing) {
            candy.style.top = `${row * this.candySize}px`;
        } else {
            // Start above the board for falling animation
            candy.style.top = `${-this.candySize}px`;
        }
        
        candy.style.left = `${col * this.candySize}px`;
        this.boardElement.appendChild(candy);

        // Animate falling into place
        if(!isInitializing) {
            setTimeout(() => {
                candy.style.top = `${row * this.candySize}px`;
            }, 10);
        }
        return candy;
    }

    async swapCandies(candy1, candy2) {
        const r1 = parseInt(candy1.dataset.row);
        const c1 = parseInt(candy1.dataset.col);
        const r2 = parseInt(candy2.dataset.row);
        const c2 = parseInt(candy2.dataset.col);

        // Swap in grid
        this.grid[r1][c1] = candy2;
        this.grid[r2][c2] = candy1;

        // Swap dataset attributes
        [candy1.dataset.row, candy2.dataset.row] = [candy2.dataset.row, candy1.dataset.row];
        [candy1.dataset.col, candy2.dataset.col] = [candy2.dataset.col, candy1.dataset.col];
        
        // Swap positions visually
        [candy1.style.top, candy2.style.top] = [candy2.style.top, candy1.style.top];
        [candy1.style.left, candy2.style.left] = [candy2.style.left, candy1.style.left];

        return new Promise(resolve => setTimeout(resolve, 300));
    }

    findAllMatches() {
        const matches = new Set();
        // Horizontal matches
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size - 2; c++) {
                if (this.grid[r][c] && this.grid[r][c+1] && this.grid[r][c+2] &&
                    this.grid[r][c].dataset.type === this.grid[r][c+1].dataset.type &&
                    this.grid[r][c+1].dataset.type === this.grid[r][c+2].dataset.type) {
                    matches.add(this.grid[r][c]);
                    matches.add(this.grid[r][c+1]);
                    matches.add(this.grid[r][c+2]);
                }
            }
        }
        // Vertical matches
        for (let c = 0; c < this.size; c++) {
            for (let r = 0; r < this.size - 2; r++) {
                if (this.grid[r][c] && this.grid[r+1][c] && this.grid[r+2][c] &&
                    this.grid[r][c].dataset.type === this.grid[r+1][c].dataset.type &&
                    this.grid[r+1][c].dataset.type === this.grid[r+2][c].dataset.type) {
                    matches.add(this.grid[r][c]);
                    matches.add(this.grid[r+1][c]);
                    matches.add(this.grid[r+2][c]);
                }
            }
        }
        return Array.from(matches);
    }

    async processMatches(isInitializing = false) {
        let matches = this.findAllMatches();
        if (matches.length === 0) return isInitializing;

        if(!isInitializing) this.onMatch(matches);

        // Remove matched candies
        for (const candy of matches) {
            candy.classList.add('matched');
            const r = parseInt(candy.dataset.row);
            const c = parseInt(candy.dataset.col);
            this.grid[r][c] = null;
        }

        await new Promise(resolve => setTimeout(resolve, 300));
        
        matches.forEach(candy => candy.remove());
        
        await this.dropCandies();
        await this.fillBoard();
        
        // Recursively check for new matches
        await this.processMatches();
        return true;
    }
    
    async dropCandies() {
        for (let c = 0; c < this.size; c++) {
            let emptyRow = this.size - 1;
            for (let r = this.size - 1; r >= 0; r--) {
                if (this.grid[r][c]) {
                    if (r !== emptyRow) {
                        this.grid[emptyRow][c] = this.grid[r][c];
                        this.grid[r][c] = null;
                        this.grid[emptyRow][c].dataset.row = emptyRow;
                        this.grid[emptyRow][c].style.top = `${emptyRow * this.candySize}px`;
                    }
                    emptyRow--;
                }
            }
        }
        return new Promise(resolve => setTimeout(resolve, 300));
    }

    async fillBoard() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!this.grid[r][c]) {
                    this.grid[r][c] = this.createCandy(r, c);
                }
            }
        }
        return new Promise(resolve => setTimeout(resolve, 300));
    }
}
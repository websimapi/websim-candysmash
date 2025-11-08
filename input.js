export default class InputHandler {
    constructor(boardElement, onSwap) {
        this.boardElement = boardElement;
        this.onSwap = onSwap;
        this.startCandy = null;
        this.isSwapping = false;
        this.startPos = { x: 0, y: 0 };

        // Bind event handlers once to ensure they can be removed correctly
        this.boundHandlePointerDown = this.handlePointerDown.bind(this);
        this.boundHandlePointerMove = this.handlePointerMove.bind(this);
        this.boundHandlePointerUp = this.handlePointerUp.bind(this);

        this.boardElement.addEventListener('pointerdown', this.boundHandlePointerDown);
    }

    handlePointerDown(e) {
        if (this.isSwapping) return;

        const target = e.target;
        if (!target.classList.contains('candy')) return;
        
        this.startCandy = target;
        this.startPos.x = e.clientX;
        this.startPos.y = e.clientY;
        
        // Listen for move and up events on the whole document to capture drags
        // that might go outside the game board.
        document.addEventListener('pointermove', this.boundHandlePointerMove);
        document.addEventListener('pointerup', this.boundHandlePointerUp);
    }

    handlePointerMove(e) {
        if (!this.startCandy) return;

        const dx = e.clientX - this.startPos.x;
        const dy = e.clientY - this.startPos.y;
        const swipeThreshold = 20; // Minimum pixels to be considered a swipe

        if (Math.abs(dx) > swipeThreshold || Math.abs(dy) > swipeThreshold) {
            // A swipe has been detected, determine direction
            let endRow, endCol;
            const startRow = parseInt(this.startCandy.dataset.row);
            const startCol = parseInt(this.startCandy.dataset.col);

            if (Math.abs(dx) > Math.abs(dy)) { // Horizontal swipe
                endRow = startRow;
                endCol = startCol + (dx > 0 ? 1 : -1);
            } else { // Vertical swipe
                endRow = startRow + (dy > 0 ? 1 : -1);
                endCol = startCol;
            }

            // Find the candy at the target position
            const targetCandy = document.querySelector(`.candy[data-row='${endRow}'][data-col='${endCol}']`);

            if (targetCandy) {
                this.isSwapping = true;
                this.onSwap(this.startCandy, targetCandy).then(() => {
                    this.isSwapping = false;
                });
            }

            // The swipe action is complete, so we clean up immediately
            this.handlePointerUp();
        }
    }

    handlePointerUp() {
        // Clean up state and remove listeners
        this.startCandy = null;
        document.removeEventListener('pointermove', this.boundHandlePointerMove);
        document.removeEventListener('pointerup', this.boundHandlePointerUp);
    }
}


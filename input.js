export default class InputHandler {
    constructor(boardElement, onSwap) {
        this.boardElement = boardElement;
        this.onSwap = onSwap;
        this.selectedCandy = null;
        this.isSwapping = false;

        this.boardElement.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    }

    handlePointerDown(e) {
        if (this.isSwapping) return;

        const target = e.target;
        if (!target.classList.contains('candy')) return;
        
        if (!this.selectedCandy) {
            this.selectedCandy = target;
            this.selectedCandy.classList.add('selected');
        } else {
            // Check if adjacent
            const r1 = parseInt(this.selectedCandy.dataset.row);
            const c1 = parseInt(this.selectedCandy.dataset.col);
            const r2 = parseInt(target.dataset.row);
            const c2 = parseInt(target.dataset.col);

            const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;

            if (isAdjacent && target !== this.selectedCandy) {
                this.isSwapping = true;
                this.selectedCandy.classList.remove('selected');
                this.onSwap(this.selectedCandy, target).then(() => {
                    this.isSwapping = false;
                });
                this.selectedCandy = null;
            } else {
                this.selectedCandy.classList.remove('selected');
                this.selectedCandy = target;
                this.selectedCandy.classList.add('selected');
            }
        }
    }
}


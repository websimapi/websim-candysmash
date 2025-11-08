import Board from './board.js';
import InputHandler from './input.js';
import { playSound } from './audio.js';
import confetti from 'confetti';

const config = {
    boardSize: 10,
    candyTypes: [
        'candy_red.png',
        'candy_blue.png',
        'candy_green.png',
        'candy_yellow.png',
        'candy_purple.png',
        'candy_orange.png'
    ],
    pointsPerCandy: 10
};

class Game {
    constructor() {
        this.board = new Board(config.boardSize, config.candyTypes, this.onMatch.bind(this));
        this.score = 0;
        this.scoreElement = document.getElementById('score');
        this.isProcessing = false;
        
        this.inputHandler = new InputHandler(this.board.boardElement, this.onSwap.bind(this));
        
        this.updateScore(0);
        this.board.initialize();
    }

    updateScore(points) {
        this.score += points;
        this.scoreElement.textContent = this.score;
    }

    onMatch(matchedCandies) {
        playSound('match.mp3');
        this.updateScore(matchedCandies.length * config.pointsPerCandy);
        if (matchedCandies.length >= 5) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }

    async onSwap(candy1, candy2) {
        if (this.isProcessing) return;

        this.isProcessing = true;
        
        await this.board.swapCandies(candy1, candy2);
        const isValidSwap = await this.board.processMatches(false, [candy1, candy2]);

        if (!isValidSwap) {
            // If no matches, swap back
            await this.board.swapCandies(candy1, candy2);
        }
        
        this.isProcessing = false;
    }
}

window.addEventListener('load', () => {
    new Game();
});
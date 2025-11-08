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
    pointsPerCandy: 10,
    timerDuration: 15,
    initialSmashValue: 3
};

class Game {
    constructor() {
        this.board = new Board(config.boardSize, config.candyTypes, this.onMatch.bind(this));
        this.score = 0;
        this.scoreElement = document.getElementById('score');
        this.isProcessing = false;

        this.smashValue = config.initialSmashValue;
        this.smashValueElement = document.getElementById('smash-value');
        this.timerValue = config.timerDuration;
        this.timerElement = document.getElementById('timer');
        this.timerInterval = null;
        
        this.inputHandler = new InputHandler(this.board.boardElement, this.onSwap.bind(this), this.onSmash.bind(this));
        
        this.updateScore(0);
        this.updateSmashUI();
        this.startTimer();
        this.board.initialize();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timerValue--;
            this.timerElement.textContent = this.timerValue;
            if (this.timerValue <= 0) {
                if (this.smashValue > 0) {
                    this.smashValue--;
                    this.updateSmashUI();
                }
                this.resetTimer();
            }
        }, 1000);
    }

    resetTimer() {
        this.timerValue = config.timerDuration;
        this.timerElement.textContent = this.timerValue;
    }

    updateSmashUI() {
        this.smashValueElement.textContent = this.smashValue;
    }

    updateScore(points) {
        this.score += points;
        this.scoreElement.textContent = this.score;
    }

    onMatch(matchedCandies) {
        playSound('match.mp3');
        this.updateScore(matchedCandies.length * config.pointsPerCandy);
        
        this.smashValue++;
        this.updateSmashUI();
        this.resetTimer();

        if (matchedCandies.length >= 5) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }

    async onSmash(candy) {
        if (this.isProcessing || this.smashValue <= 0) return;
        this.isProcessing = true;

        const r = parseInt(candy.dataset.row);
        const c = parseInt(candy.dataset.col);
        const candiesToSmash = new Set([candy]);

        if (this.smashValue >= 1 && this.smashValue <= 3) {
            // Just the single candy is already in the set
        } else if (this.smashValue >= 4 && this.smashValue <= 6) {
            // 2x2 area around the candy
            for (let i = r; i <= r + 1; i++) {
                for (let j = c; j <= c + 1; j++) {
                    if (this.board.isValid(i, j) && this.board.grid[i][j]) {
                        candiesToSmash.add(this.board.grid[i][j]);
                    }
                }
            }
        }
        
        this.smashValue--;
        this.updateSmashUI();
        playSound('smash.mp3');
        
        await this.board.smashCandies(Array.from(candiesToSmash));

        this.isProcessing = false;
    }

    async onSwap(candy1, candy2) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        const candy1Powerup = candy1.dataset.powerup;
        const candy2Powerup = candy2.dataset.powerup;

        if (candy1Powerup === 'rainbow' || candy2Powerup === 'rainbow') {
            const rainbowCandy = candy1Powerup === 'rainbow' ? candy1 : candy2;
            const otherCandy = candy1Powerup === 'rainbow' ? candy2 : candy1;
            
            // We don't need to swap visually, just activate
            await this.board.activateRainbowPowerup(rainbowCandy, otherCandy);
            this.isProcessing = false;
            return;
        }
        
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
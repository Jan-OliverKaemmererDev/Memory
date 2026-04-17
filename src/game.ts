/**
 * Holds the game state and logic for the Memory game.
 */

// --- Variables ---
let hasFlippedCard: boolean = false;
let lockBoard: boolean = false;
let firstCard: HTMLElement | null = null;
let secondCard: HTMLElement | null = null;
let scoreBlue: number = 0;
let scoreOrange: number = 0;
let currentPlayer: string = 'blue';
let pairsFound: number = 0;
let totalPairs: number = 0;

/**
 * Initializes the game state based on the selected board size.
 * @param selectedSize - Number of cards on the board.
 */
export function initializeGameState(selectedSize: number): void {
    const playerInput = document.querySelector('input[name="player"]:checked') as HTMLInputElement;
    currentPlayer = playerInput?.value || 'blue';
    scoreBlue = 0;
    scoreOrange = 0;
    pairsFound = 0;
    totalPairs = selectedSize / 2;
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
}

/**
 * Configures the grid layout of the game board.
 * @param board - The board container element.
 * @param selectedSize - Number of cards to be displayed.
 */
export function setupGameBoard(board: HTMLElement, selectedSize: number): void {
    board.innerHTML = '';
    let cols = 4;
    if (selectedSize === 24 || selectedSize === 36) cols = 6;
    const rows = selectedSize / cols;
    board.style.setProperty('--cols', cols.toString());
    board.style.setProperty('--rows', rows.toString());
}

/**
 * Generates and shuffles card pairs, then displays them on the board.
 * @param board - The board container element.
 * @param size - Total number of cards.
 * @param folder - Asset folder name for the current theme.
 */
export function generateAndDisplayCards(board: HTMLElement, size: number, folder: string): void {
    const arr: number[] = [];
    for (let i = 1; i <= totalPairs; i++) {
        arr.push(i, i);
    }
    arr.sort(() => Math.random() - 0.5);

    for (let i = 0; i < size; i++) {
        createCardElement(board, arr[i], folder);
    }
}

/**
 * Creates an individual card element and appends it to the board.
 * @param board - The board container element.
 * @param cardId - The unique ID for the card pair.
 * @param folder - Theme folder for assets.
 */
function createCardElement(board: HTMLElement, cardId: number, folder: string): void {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.id = cardId.toString();
    const base = `${import.meta.env.BASE_URL}assets/theme-card-pictures/${folder}/`;
    card.innerHTML = getCardInnerHTML(`${base}front-${cardId}.svg`, `${base}back.svg`);
    card.addEventListener('click', flipCard);
    board.appendChild(card);
}

/**
 * Generates the HTML structure for a card.
 * @param frontUrl - URL of the card's front image.
 * @param backUrl - URL of the card's back image.
 * @returns HTML string for the card's inner structure.
 */
function getCardInnerHTML(frontUrl: string, backUrl: string): string {
    return `
        <div class="card-inner">
            <div class="card-front"><img src="${frontUrl}" alt="Front"></div>
            <div class="card-back"><img src="${backUrl}" alt="Back"></div>
        </div>`;
}

/**
 * Handles the logic when a card is clicked (flipped).
 */
function flipCard(this: HTMLElement): void {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flipped');
    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
    } else {
        secondCard = this;
        checkForMatch();
    }
}

/**
 * Checks if the two currently flipped cards match.
 */
function checkForMatch(): void {
    const isMatch = firstCard?.dataset.id === secondCard?.dataset.id;
    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

/**
 * Disables matched cards and updates the score.
 */
function disableCards(): void {
    firstCard?.removeEventListener('click', flipCard);
    secondCard?.removeEventListener('click', flipCard);
    updateScoreAfterMatch();
    pairsFound++;
    updateScoreUI();
    resetBoard();
    if (pairsFound === totalPairs) {
        setTimeout(handleGameFinished, 500);
    }
}

/**
 * Increments the score of the current player.
 */
function updateScoreAfterMatch(): void {
    if (currentPlayer === 'blue') {
        scoreBlue++;
    } else {
        scoreOrange++;
    }
}

/**
 * Handles the process when all pairs are found.
 */
function handleGameFinished(): void {
    updateFinalScores();
    const gameOverModal = document.getElementById('game-over-modal-overlay');
    if (gameOverModal) gameOverModal.classList.add('show');

    setTimeout(() => {
        if (gameOverModal) gameOverModal.classList.remove('show');
        showWinnerScreen();
    }, 2000);
}

/**
 * Resets the board selection state for the next turn.
 */
function resetBoard(): void {
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
}

/**
 * Updates the score display in the UI.
 */
export function updateScoreUI(): void {
    const container = document.getElementById('score-container');
    if (!container) return;
    const active = 'active';
    const baseUrl = import.meta.env.BASE_URL;
    container.innerHTML = `
        <div class="score-player ${currentPlayer === 'blue' ? active : ''}" style="color: #38bdf8;">
            <span class="icon"><img src="${baseUrl}assets/chess-piece-blue.svg" alt="Blue" width="24" height="24"></span> Blue <span class="score-value" style="color: white; margin-left:8px;">${scoreBlue}</span>
        </div>
        <div class="score-player ${currentPlayer === 'orange' ? active : ''}" style="color: #fb923c;">
            <span class="icon"><img src="${baseUrl}assets/chess-piece-orange.svg" alt="Orange" width="24" height="24"></span> Orange <span class="score-value" style="color: white; margin-left:8px;">${scoreOrange}</span>
        </div>`;
}

/**
 * Updates the turn indicator in the UI.
 */
export function updateTurnUI(): void {
    const currentPlayerIcon = document.getElementById('current-player-icon');
    if (currentPlayerIcon) {
        currentPlayerIcon.innerHTML = `<img src="${import.meta.env.BASE_URL}assets/chess-piece-${currentPlayer}.svg" alt="Player" width="24" height="24">`;
    }
    updateScoreUI();
}

/**
 * Reverts the flip animation of non-matching cards and switches turns.
 */
function unflipCards(): void {
    lockBoard = true;
    setTimeout(() => {
        firstCard?.classList.remove('flipped');
        secondCard?.classList.remove('flipped');
        currentPlayer = currentPlayer === 'blue' ? 'orange' : 'blue';
        updateTurnUI();
        resetBoard();
    }, 1200);
}

/**
 * Displays the final scores in the game over modal.
 */
function updateFinalScores(): void {
    const fBlue = document.getElementById('final-score-blue');
    const fOrange = document.getElementById('final-score-orange');
    if (fBlue) fBlue.textContent = scoreBlue.toString();
    if (fOrange) fOrange.textContent = scoreOrange.toString();
}

/**
 * Triggers the winner announcement and confetti effects.
 */
function showWinnerScreen(): void {
    let name = 'It\'s a tie!';
    let color = 'white';
    if (scoreBlue > scoreOrange) {
        name = 'BLUE PLAYER';
        color = 'blue';
    } else if (scoreOrange > scoreBlue) {
        name = 'ORANGE PLAYER';
        color = 'orange';
    }
    updateWinnerUI(name, color);
    createConfetti();
    document.getElementById('winner-modal-overlay')?.classList.add('show');
}

/**
 * Updates the winner modal with names and colors.
 * @param name - The name of the winning player or tie message.
 * @param color - The identifying color of the winner.
 */
function updateWinnerUI(name: string, color: string): void {
    const nameEl = document.getElementById('winner-name');
    const iconEl = document.getElementById('winner-icon') as HTMLImageElement;
    if (nameEl) {
        nameEl.textContent = name;
        nameEl.style.color = color === 'blue' ? '#38bdf8' : (color === 'orange' ? '#fb923c' : 'white');
    }
    if (iconEl) {
        iconEl.src = `${import.meta.env.BASE_URL}assets/chess-piece-${color}.svg`;
        iconEl.style.display = color === 'white' ? 'none' : 'block';
    }
}

/**
 * Creates a confetti animation effect on the screen.
 */
function createConfetti(): void {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#38bdf8', '#fb923c', '#63CDBB', '#EEFBF8'];
    for (let i = 0; i < 60; i++) {
        createConfettiPiece(container, colors);
    }
}

/**
 * Creates a single confetti piece and appends it to the container.
 * @param container - The confetti container element.
 * @param colors - Array of available confetti colors.
 */
function createConfettiPiece(container: HTMLElement, colors: string[]): void {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 3 + 's';
    if (Math.random() > 0.5) {
        confetti.style.width = '8px';
        confetti.style.height = '16px';
    }
    container.appendChild(confetti);
}

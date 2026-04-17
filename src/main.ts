import '../scss/main.scss'

let currentThemeClass = 'theme-code-vibes';

init();

function init() {
    setupNavigation();
    setupSettings();
}

function setupNavigation() {
    setupPageTransitions();
    setupExitModal();
    setupWinnerModal();
}

function setupPageTransitions() {
    setupBtnPlay();
    setupBtnStart();
}

function setupBtnPlay() {
    const btnPlay = document.getElementById('btn-play');
    const landing = document.getElementById('landing-page');
    const settings = document.getElementById('settings-page');
    btnPlay?.addEventListener('click', () => {
        landing?.classList.add('hidden');
        settings?.classList.remove('hidden');
    });
}

function setupBtnStart() {
    const btnStart = document.getElementById('btn-start');
    const settings = document.getElementById('settings-page');
    const game = document.getElementById('game-page');
    btnStart?.addEventListener('click', () => {
        settings?.classList.add('hidden');
        game?.classList.remove('hidden');
        startGame();
    });
}


function setupExitModal() {
    setupExitButtonHandlers();
    setupConfirmExitHandler();
}

function setupExitButtonHandlers() {
    const btnExit = document.getElementById('btn-exit');
    const overlay = document.getElementById('exit-modal-overlay');
    const btnBack = document.getElementById('btn-back-to-game');
    btnExit?.addEventListener('click', () => overlay?.classList.add('show'));
    btnBack?.addEventListener('click', () => overlay?.classList.remove('show'));
    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('show');
    });
}

function setupConfirmExitHandler() {
    const btnConfirm = document.getElementById('btn-confirm-exit');
    const overlay = document.getElementById('exit-modal-overlay');
    btnConfirm?.addEventListener('click', () => {
        overlay?.classList.remove('show');
        document.getElementById('game-page')?.classList.add('hidden');
        document.getElementById('landing-page')?.classList.remove('hidden');
        applyTheme('theme-code-vibes');
    });
}


function setupWinnerModal() {
    const btnBackToStart = document.getElementById('btn-back-to-start');
    const winnerModal = document.getElementById('winner-modal-overlay');
    const landingPage = document.getElementById('landing-page');
    const gamePage = document.getElementById('game-page');

    btnBackToStart?.addEventListener('click', () => {
        winnerModal?.classList.remove('show');
        gamePage?.classList.add('hidden');
        landingPage?.classList.remove('hidden');
        applyTheme('theme-code-vibes');
    });
}


let hasFlippedCard = false
let lockBoard = false
let firstCard: HTMLElement | null = null
let secondCard: HTMLElement | null = null
let scoreBlue = 0
let scoreOrange = 0
let currentPlayer = 'blue'
let pairsFound = 0
let totalPairs = 0

function startGame() {
    const theme = (document.querySelector('input[name="theme"]:checked') as HTMLInputElement)?.value || 'code-vibes'
    const size = parseInt((document.querySelector('input[name="size"]:checked') as HTMLInputElement)?.value || '16', 10)
    initializeGameState(size)
    const folder = getThemeAssets(theme)
    updateScoreUI()
    updateTurnUI()
    const board = document.getElementById('game-board')
    if (board) {
        setupGameBoard(board, size)
        generateAndDisplayCards(board, size, folder)
    }
}


function initializeGameState(selectedSize: number) {
    currentPlayer = (document.querySelector('input[name="player"]:checked') as HTMLInputElement)?.value || 'blue'
    scoreBlue = 0
    scoreOrange = 0
    pairsFound = 0
    totalPairs = selectedSize / 2
    hasFlippedCard = false
    lockBoard = false
    firstCard = null
    secondCard = null
}

function getThemeAssets(selectedTheme: string) {
    const themeFolderMap: Record<string, string> = {
        'code-vibes': 'code-vibes', 'gaming': 'games',
        'da-project': 'da-projects', 'foods': 'food'
    }
    return themeFolderMap[selectedTheme]
}

function setupGameBoard(board: HTMLElement, selectedSize: number) {
    board.innerHTML = ''
    let cols = 4
    if (selectedSize === 24 || selectedSize === 36) cols = 6
    board.style.setProperty('--cols', cols.toString())
}

function generateAndDisplayCards(board: HTMLElement, size: number, folder: string) {
    const arr = []
    for (let i = 1; i <= totalPairs; i++) {
        arr.push(i, i)
    }
    arr.sort(() => Math.random() - 0.5)

    for (let i = 0; i < size; i++) {
        createCardElement(board, arr[i], folder)
    }
}

function createCardElement(board: HTMLElement, cardId: number, folder: string) {
    const card = document.createElement('div')
    card.className = 'memory-card'
    card.dataset.id = cardId.toString()
    const base = `${import.meta.env.BASE_URL}assets/theme-card-pictures/${folder}/`
    card.innerHTML = getCardInnerHTML(`${base}front-${cardId}.svg`, `${base}back.svg`)
    card.addEventListener('click', flipCard)
    board.appendChild(card)
}

function getCardInnerHTML(frontUrl: string, backUrl: string) {
    return `
        <div class="card-inner">
            <div class="card-front"><img src="${frontUrl}" alt="Front"></div>
            <div class="card-back"><img src="${backUrl}" alt="Back"></div>
        </div>`
}



function flipCard(this: HTMLElement) {
    if (lockBoard || this === firstCard) return
    this.classList.add('flipped')
    if (!hasFlippedCard) {
        hasFlippedCard = true
        firstCard = this
    } else {
        secondCard = this
        checkForMatch()
    }
}


function checkForMatch() {
    let isMatch = firstCard?.dataset.id === secondCard?.dataset.id

    if (isMatch) {
        disableCards()
    } else {
        unflipCards()
    }
}

function disableCards() {
    firstCard?.removeEventListener('click', flipCard)
    secondCard?.removeEventListener('click', flipCard)
    updateScoreAfterMatch()
    pairsFound++
    updateScoreUI()
    resetBoard()
    if (pairsFound === totalPairs) {
        setTimeout(handleGameFinished, 500)
    }
}

function updateScoreAfterMatch() {
    if (currentPlayer === 'blue') {
        scoreBlue++
    } else {
        scoreOrange++
    }
}


function handleGameFinished() {
    updateFinalScores();
    const gameOverModal = document.getElementById('game-over-modal-overlay');
    if (gameOverModal) gameOverModal.classList.add('show');

    setTimeout(() => {
        if (gameOverModal) gameOverModal.classList.remove('show');
        showWinnerScreen();
    }, 2000);
}

function updateFinalScores() {
    const fBlue = document.getElementById('final-score-blue');
    const fOrange = document.getElementById('final-score-orange');
    if (fBlue) fBlue.textContent = scoreBlue.toString();
    if (fOrange) fOrange.textContent = scoreOrange.toString();
}

function showWinnerScreen() {
    const { name, color } = getWinnerDetails();
    updateWinnerUI(name, color);
    createConfetti();
    document.getElementById('winner-modal-overlay')?.classList.add('show');
}

function getWinnerDetails() {
    if (scoreBlue > scoreOrange) return { name: 'BLUE PLAYER', color: 'blue' };
    if (scoreOrange > scoreBlue) return { name: 'ORANGE PLAYER', color: 'orange' };
    return { name: "It's a tie!", color: 'white' };
}

function updateWinnerUI(name: string, color: string) {
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


function createConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#38bdf8', '#fb923c', '#63CDBB', '#EEFBF8'];
    for (let i = 0; i < 60; i++) {
        createConfettiPiece(container, colors);
    }
}

function createConfettiPiece(container: HTMLElement, colors: string[]) {
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


function unflipCards() {
    lockBoard = true

    setTimeout(() => {
        firstCard?.classList.remove('flipped')
        secondCard?.classList.remove('flipped')

        // Switch turn
        currentPlayer = currentPlayer === 'blue' ? 'orange' : 'blue'
        updateTurnUI()

        resetBoard()
    }, 1200)
}

function resetBoard() {
    hasFlippedCard = false
    lockBoard = false
    firstCard = null
    secondCard = null
}

function updateScoreUI() {
    const container = document.getElementById('score-container')
    if (container) {
        container.innerHTML = getScoreInnerHTML()
    }
}

function getScoreInnerHTML() {
    const active = 'active';
    const baseUrl = import.meta.env.BASE_URL;
    return `
        <div class="score-player ${currentPlayer === 'blue' ? active : ''}" style="color: #38bdf8;">
            <span class="icon"><img src="${baseUrl}assets/chess-piece-blue.svg" alt="Blue" width="24" height="24"></span> Blue <span class="score-value" style="color: white; margin-left:8px;">${scoreBlue}</span>
        </div>
        <div class="score-player ${currentPlayer === 'orange' ? active : ''}" style="color: #fb923c;">
            <span class="icon"><img src="${baseUrl}assets/chess-piece-orange.svg" alt="Orange" width="24" height="24"></span> Orange <span class="score-value" style="color: white; margin-left:8px;">${scoreOrange}</span>
        </div>`;
}


function updateTurnUI() {
    const currentPlayerIcon = document.getElementById('current-player-icon')
    if (currentPlayerIcon) {
        currentPlayerIcon.innerHTML = `<img src="${import.meta.env.BASE_URL}assets/chess-piece-${currentPlayer}.svg" alt="Player" width="24" height="24">`
    }
    // Also re-render scores to update active highlight
    updateScoreUI()
}

function setupSettings() {
    const themeConfigs: Record<string, any> = getThemeConfigs();
    setupThemeListeners(themeConfigs);
    setupPlayerAndSizeListeners();
    initializeSettingsUI(themeConfigs);
}

function getThemeConfigs() {
    const base = import.meta.env.BASE_URL + 'assets/theme-preview-pictures/';
    return {
        'code-vibes': { img: base + 'codevibe-theme.png', label: 'Code Vibes', cssClass: 'theme-code-vibes' },
        'da-project': { img: base + 'DAprojects-theme.png', label: 'DA Project', cssClass: 'theme-da-project' },
        'foods': { img: base + 'foods-theme.png', label: 'Foods', cssClass: 'theme-foods' },
        'gaming': { img: base + 'gaming-theme.png', label: 'Gaming', cssClass: 'theme-gaming' }
    };
}

function setupThemeListeners(configs: Record<string, any>) {
    document.querySelectorAll('input[name="theme"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const config = configs[(e.target as HTMLInputElement).value];
            if (config) {
                const previewImg = document.querySelector('#theme-preview img') as HTMLImageElement;
                const summaryTheme = document.getElementById('summary-theme');
                if (previewImg) previewImg.src = config.img;
                if (summaryTheme) summaryTheme.textContent = config.label;
                applyTheme(config.cssClass);
            }
        });
    });
}

function setupPlayerAndSizeListeners() {
    setupPlayerListeners();
    setupSizeListeners();
}

function setupPlayerListeners() {
    document.querySelectorAll('input[name="player"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const val = (e.target as HTMLInputElement).value;
            const el = document.getElementById('summary-player');
            if (el) el.textContent = `Player ${val.charAt(0).toUpperCase() + val.slice(1)}`;
        });
    });
}

function setupSizeListeners() {
    document.querySelectorAll('input[name="size"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const el = document.getElementById('summary-size');
            if (el) el.textContent = `${(e.target as HTMLInputElement).value} cards`;
        });
    });
}


function initializeSettingsUI(configs: Record<string, any>) {
    initThemeSettings(configs);
    initPlayerAndSizeSettings();
}

function initThemeSettings(configs: Record<string, any>) {
    const theme = document.querySelector('input[name="theme"]:checked') as HTMLInputElement;
    if (theme && configs[theme.value]) {
        const config = configs[theme.value];
        const previewImg = document.querySelector('#theme-preview img') as HTMLImageElement;
        const summaryTheme = document.getElementById('summary-theme');
        if (previewImg) previewImg.src = config.img;
        if (summaryTheme) summaryTheme.textContent = config.label;
        applyTheme(config.cssClass);
    }
}

function initPlayerAndSizeSettings() {
    const player = document.querySelector('input[name="player"]:checked') as HTMLInputElement;
    const size = document.querySelector('input[name="size"]:checked') as HTMLInputElement;
    const sPlayer = document.getElementById('summary-player');
    if (player && sPlayer) sPlayer.textContent = `Player ${player.value.charAt(0).toUpperCase() + player.value.slice(1)}`;
    const sSize = document.getElementById('summary-size');
    if (size && sSize) sSize.textContent = `${size.value} cards`;
}



function applyTheme(newClass: string) {
    const body = document.body
    const classesToRemove = Array.from(body.classList).filter(c => c.startsWith('theme-'))
    body.classList.remove(...classesToRemove)
    
    body.classList.add(newClass)
    currentThemeClass = newClass
}
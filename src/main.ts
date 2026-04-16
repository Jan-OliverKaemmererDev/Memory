import '../scss/main.scss'

let currentThemeClass = 'theme-code-vibes';

init()

function init() {
    setupNavigation()
    setupSettings()
}

function setupNavigation() {
    const btnPlay = document.getElementById('btn-play')
    const landingPage = document.getElementById('landing-page')
    const settingsPage = document.getElementById('settings-page')
    const btnStart = document.getElementById('btn-start')
    const gamePage = document.getElementById('game-page')

    if (btnPlay && landingPage && settingsPage) {
        btnPlay.addEventListener('click', () => {
            landingPage.classList.add('hidden')
            settingsPage.classList.remove('hidden')
        })
    }

    if (btnStart && settingsPage && gamePage) {
        btnStart.addEventListener('click', () => {
            settingsPage.classList.add('hidden')
            gamePage.classList.remove('hidden')
            startGame()
        })
    }

    const btnExit = document.getElementById('btn-exit')
    const exitModalOverlay = document.getElementById('exit-modal-overlay')
    const btnBackToGame = document.getElementById('btn-back-to-game')
    const btnConfirmExit = document.getElementById('btn-confirm-exit')

    if (btnExit && exitModalOverlay) {
        btnExit.addEventListener('click', () => {
            exitModalOverlay.classList.add('show')
        })
    }

    if (btnBackToGame && exitModalOverlay) {
        btnBackToGame.addEventListener('click', () => {
            exitModalOverlay.classList.remove('show')
        })
    }

    if (exitModalOverlay) {
        exitModalOverlay.addEventListener('click', (e) => {
            if (e.target === exitModalOverlay) {
                exitModalOverlay.classList.remove('show')
            }
        })
    }

    if (btnConfirmExit && exitModalOverlay && gamePage && landingPage) {
        btnConfirmExit.addEventListener('click', () => {
            exitModalOverlay.classList.remove('show')
            gamePage.classList.add('hidden')
            landingPage.classList.remove('hidden')
        })
    }

    const btnBackToStart = document.getElementById('btn-back-to-start')
    const winnerModalOverlay = document.getElementById('winner-modal-overlay')
    const gameOverModalOverlay = document.getElementById('game-over-modal-overlay')
    if (btnBackToStart && winnerModalOverlay && landingPage && gamePage) {
        btnBackToStart.addEventListener('click', () => {
            winnerModalOverlay.classList.remove('show')
            gamePage.classList.add('hidden')
            landingPage.classList.remove('hidden')
        })
    }
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
    const selectedTheme = (document.querySelector('input[name="theme"]:checked') as HTMLInputElement)?.value || 'code-vibes'
    currentPlayer = (document.querySelector('input[name="player"]:checked') as HTMLInputElement)?.value || 'blue'
    const selectedSize = parseInt((document.querySelector('input[name="size"]:checked') as HTMLInputElement)?.value || '16', 10)

    // Setup state
    scoreBlue = 0
    scoreOrange = 0
    pairsFound = 0
    totalPairs = selectedSize / 2
    hasFlippedCard = false
    lockBoard = false
    firstCard = null
    secondCard = null

    // Map theme to folder
    const themeFolderMap: Record<string, string> = {
        'code-vibes': 'code-vibes',
        'gaming': 'games',
        'da-project': 'da-projects',
        'foods': 'food'
    }
    const folder = themeFolderMap[selectedTheme]
    const backImageUrl = `${import.meta.env.BASE_URL}assets/theme-card-pictures/${folder}/back.svg`

    updateScoreUI()
    updateTurnUI()

    const board = document.getElementById('game-board')
    if (board) {
        board.innerHTML = ''
        
        let cols = 4
        if (selectedSize === 24) cols = 6
        if (selectedSize === 36) cols = 6
        board.style.setProperty('--cols', cols.toString())

        // Generate deck
        const arr = []
        for (let i = 1; i <= totalPairs; i++) {
            arr.push(i)
            arr.push(i)
        }
        
        // Shuffle
        arr.sort(() => Math.random() - 0.5)

        for (let i = 0; i < selectedSize; i++) {
            const cardId = arr[i]
            const card = document.createElement('div')
            card.className = 'memory-card'
            card.dataset.id = cardId.toString()

            const frontImageUrl = `${import.meta.env.BASE_URL}assets/theme-card-pictures/${folder}/front-${cardId}.svg`

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"><img src="${frontImageUrl}" alt="Front"></div>
                    <div class="card-back"><img src="${backImageUrl}" alt="Back"></div>
                </div>
            `
            
            card.addEventListener('click', flipCard)
            board.appendChild(card)
        }
    }
}

function flipCard(this: HTMLElement) {
    if (lockBoard) return
    if (this === firstCard) return

    this.classList.add('flipped')

    if (!hasFlippedCard) {
        hasFlippedCard = true
        firstCard = this
        return
    }

    secondCard = this
    checkForMatch()
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

    // Add points to current player
    if (currentPlayer === 'blue') {
        scoreBlue++
    } else {
        scoreOrange++
    }

    pairsFound++
    updateScoreUI()

    resetBoard()

    if (pairsFound === totalPairs) {
        setTimeout(handleGameFinished, 500)
    }
}

function handleGameFinished() {
    const gameOverModal = document.getElementById('game-over-modal-overlay')
    const winnerModal = document.getElementById('winner-modal-overlay')
    
    // Update Final Scores
    const finalScoreBlue = document.getElementById('final-score-blue')
    const finalScoreOrange = document.getElementById('final-score-orange')
    if (finalScoreBlue) finalScoreBlue.textContent = scoreBlue.toString()
    if (finalScoreOrange) finalScoreOrange.textContent = scoreOrange.toString()

    // Show Game Over
    if (gameOverModal) {
        gameOverModal.classList.add('show')
    }

    // After 2s show Winner Screen
    setTimeout(() => {
        if (gameOverModal) gameOverModal.classList.remove('show')
        
        let winnerNameText = "It's a tie!"
        let winnerColor = 'white'
        
        if (scoreBlue > scoreOrange) {
            winnerNameText = 'BLUE PLAYER'
            winnerColor = 'blue'
        } else if (scoreOrange > scoreBlue) {
            winnerNameText = 'ORANGE PLAYER'
            winnerColor = 'orange'
        }

        const winnerNameEl = document.getElementById('winner-name')
        const winnerIconEl = document.getElementById('winner-icon') as HTMLImageElement

        if (winnerNameEl) {
            winnerNameEl.textContent = winnerNameText
            winnerNameEl.style.color = winnerColor === 'blue' ? '#38bdf8' : (winnerColor === 'orange' ? '#fb923c' : 'white')
        }
        
        if (winnerIconEl && winnerColor !== 'white') {
            winnerIconEl.src = `${import.meta.env.BASE_URL}assets/chess-piece-${winnerColor}.svg`
            winnerIconEl.style.display = 'block'
        } else if (winnerIconEl) {
            winnerIconEl.style.display = 'none'
        }

        createConfetti()

        if (winnerModal) {
            winnerModal.classList.add('show')
        }
    }, 2000)
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#38bdf8', '#fb923c', '#63CDBB', '#EEFBF8'];
    for (let i = 0; i < 60; i++) {
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
    const scoreContainer = document.getElementById('score-container')
    if (scoreContainer) {
        scoreContainer.innerHTML = `
            <div class="score-player ${currentPlayer === 'blue' ? 'active' : ''}" style="color: #38bdf8;">
                <span class="icon"><img src="${import.meta.env.BASE_URL}assets/chess-piece-blue.svg" alt="Blue" width="24" height="24"></span> Blue <span class="score-value" style="color: white; margin-left:8px;">${scoreBlue}</span>
            </div>
            <div class="score-player ${currentPlayer === 'orange' ? 'active' : ''}" style="color: #fb923c;">
                <span class="icon"><img src="${import.meta.env.BASE_URL}assets/chess-piece-orange.svg" alt="Orange" width="24" height="24"></span> Orange <span class="score-value" style="color: white; margin-left:8px;">${scoreOrange}</span>
            </div>
        `
    }
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
    const themeInputs = document.querySelectorAll('input[name="theme"]')
    const playerInputs = document.querySelectorAll('input[name="player"]')
    const sizeInputs = document.querySelectorAll('input[name="size"]')
    
    const previewContainer = document.getElementById('theme-preview')
    const previewImg = previewContainer?.querySelector('img')
    
    const summaryTheme = document.getElementById('summary-theme')
    const summaryPlayer = document.getElementById('summary-player')
    const summarySize = document.getElementById('summary-size')

    const themeConfigs: Record<string, { img: string, label: string, cssClass: string }> = {
        'code-vibes': {
            img: `${import.meta.env.BASE_URL}assets/theme-preview-pictures/codevibe-theme.png`,
            label: 'Code Vibes',
            cssClass: 'theme-code-vibes'
        },
        'da-project': {
            img: `${import.meta.env.BASE_URL}assets/theme-preview-pictures/DAprojects-theme.png`,
            label: 'DA Project',
            cssClass: 'theme-da-project'
        },
        'foods': {
            img: `${import.meta.env.BASE_URL}assets/theme-preview-pictures/foods-theme.png`,
            label: 'Foods',
            cssClass: 'theme-foods'
        },
        'gaming': {
            img: `${import.meta.env.BASE_URL}assets/theme-preview-pictures/gaming-theme.png`,
            label: 'Gaming',
            cssClass: 'theme-gaming'
        }
    }

    themeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const val = (e.target as HTMLInputElement).value
            const config = themeConfigs[val]

            if (config) {
                if (previewImg) previewImg.src = config.img
                if (summaryTheme) summaryTheme.textContent = config.label

                applyTheme(config.cssClass)
            }
        })
    })

    playerInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const val = (e.target as HTMLInputElement).value
            if (summaryPlayer) {
                summaryPlayer.textContent = `Player ${val.charAt(0).toUpperCase() + val.slice(1)}`
            }
        })
    })

    sizeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const val = (e.target as HTMLInputElement).value
            if (summarySize) {
                summarySize.textContent = `${val} cards`
            }
        })
    })

    // Initial state for preview and summary
    const checkedTheme = document.querySelector('input[name="theme"]:checked') as HTMLInputElement
    const checkedPlayer = document.querySelector('input[name="player"]:checked') as HTMLInputElement
    const checkedSize = document.querySelector('input[name="size"]:checked') as HTMLInputElement

    if (checkedTheme) {
        const config = themeConfigs[checkedTheme.value]
        if (config) {
            if (previewImg) previewImg.src = config.img
            if (summaryTheme) summaryTheme.textContent = config.label
            applyTheme(config.cssClass)
        }
    }

    if (checkedPlayer && summaryPlayer) {
        const val = checkedPlayer.value
        summaryPlayer.textContent = `Player ${val.charAt(0).toUpperCase() + val.slice(1)}`
    }

    if (checkedSize && summarySize) {
        summarySize.textContent = `${checkedSize.value} cards`
    }
}

function applyTheme(newClass: string) {
    const body = document.body
    const classesToRemove = Array.from(body.classList).filter(c => c.startsWith('theme-'))
    body.classList.remove(...classesToRemove)
    
    body.classList.add(newClass)
    currentThemeClass = newClass
}
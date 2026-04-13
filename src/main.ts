import '../scss/main.scss'

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
    if (btnExit && gamePage && landingPage) {
        btnExit.addEventListener('click', () => {
            gamePage.classList.add('hidden')
            landingPage.classList.remove('hidden')
            // TODO: Reset game state
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
    const selectedTheme = (document.querySelector('input[name="theme"]:checked') as HTMLInputElement)?.value || 'codevibe'
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
        codevibe: 'code-vibes',
        gaming: 'games',
        daprojects: 'da-projects',
        foods: 'food'
    }
    const folder = themeFolderMap[selectedTheme]
    const backImageUrl = `/assets/theme-card-pictures/${folder}/back.svg`

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

            const frontImageUrl = `/assets/theme-card-pictures/${folder}/Front-${cardId}.svg`

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
        setTimeout(() => alert('Game Finished!'), 500)
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
                <span class="icon"><img src="/assets/chess-piece-blue.svg" alt="Blue" width="24" height="24"></span> Blue <span class="score-value" style="color: white; margin-left:8px;">${scoreBlue}</span>
            </div>
            <div class="score-player ${currentPlayer === 'orange' ? 'active' : ''}" style="color: #fb923c;">
                <span class="icon"><img src="/assets/chess-piece-orange.svg" alt="Orange" width="24" height="24"></span> Orange <span class="score-value" style="color: white; margin-left:8px;">${scoreOrange}</span>
            </div>
        `
    }
}

function updateTurnUI() {
    const currentPlayerIcon = document.getElementById('current-player-icon')
    if (currentPlayerIcon) {
        currentPlayerIcon.innerHTML = `<img src="/assets/chess-piece-${currentPlayer}.svg" alt="Player" width="24" height="24">`
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

    const themeConfigs: Record<string, { img: string, gradient: string, label: string }> = {
        codevibe: {
            img: '/assets/theme-preview-pictures/codevibe-theme.png',
            gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            label: 'Code vibes'
        },
        gaming: {
            img: '/assets/theme-preview-pictures/gaming-theme.png',
            gradient: 'linear-gradient(135deg, #881337 0%, #4c0519 100%)',
            label: 'Gaming'
        },
        daprojects: {
            img: '/assets/theme-preview-pictures/DAprojects-theme.png',
            gradient: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
            label: 'DA Projects'
        },
        foods: {
            img: '/assets/theme-preview-pictures/foods-theme.png',
            gradient: 'linear-gradient(135deg, #14532d 0%, #052e16 100%)',
            label: 'Foods'
        }
    }

    themeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const val = (e.target as HTMLInputElement).value
            const config = themeConfigs[val]
            if (config && previewImg && previewContainer && summaryTheme) {
                previewImg.src = config.img
                previewContainer.style.background = config.gradient
                summaryTheme.textContent = config.label
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

    // Initial state for preview
    if (previewContainer) {
        previewContainer.style.background = themeConfigs['codevibe'].gradient
    }
}
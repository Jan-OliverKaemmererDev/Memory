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

    if (btnPlay && landingPage && settingsPage) {
        btnPlay.addEventListener('click', () => {
            landingPage.classList.add('hidden')
            settingsPage.classList.remove('hidden')
        })
    }
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
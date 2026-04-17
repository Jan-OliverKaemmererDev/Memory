/**
 * Main entry point for the Memory game. 
 * Manages navigation, settings, and high-level orchestration.
 */

import '../scss/main.scss';
import { 
    initializeGameState, 
    setupGameBoard, 
    generateAndDisplayCards, 
    updateScoreUI, 
    updateTurnUI 
} from './game';

// --- Global Variables ---
let currentThemeClass: string = 'theme-code-vibes';

// Initialize the application
init();

/**
 * Entry function to initialize navigation and settings listeners.
 */
function init(): void {
    setupNavigation();
    setupSettings();
}

/**
 * Sets up the event listeners for site-wide navigation and modals.
 */
function setupNavigation(): void {
    setupPageTransitions();
    setupExitModal();
    setupWinnerModal();
}

/**
 * Sets up transitions between the landing, settings, and game pages.
 */
function setupPageTransitions(): void {
    const btnPlay = document.getElementById('btn-play');
    const landing = document.getElementById('landing-page');
    const settings = document.getElementById('settings-page');
    const btnStart = document.getElementById('btn-start');
    const game = document.getElementById('game-page');

    btnPlay?.addEventListener('click', () => {
        landing?.classList.add('hidden');
        settings?.classList.remove('hidden');
    });

    btnStart?.addEventListener('click', () => {
        settings?.classList.add('hidden');
        game?.classList.remove('hidden');
        startGame();
    });
}

/**
 * Configures the exit game modal and its trigger button.
 */
function setupExitModal(): void {
    const btnExit = document.getElementById('btn-exit');
    const overlay = document.getElementById('exit-modal-overlay');
    const btnBack = document.getElementById('btn-back-to-game');
    const btnConfirm = document.getElementById('btn-confirm-exit');

    btnExit?.addEventListener('click', () => overlay?.classList.add('show'));
    btnBack?.addEventListener('click', () => overlay?.classList.remove('show'));
    setupExitModalClickHandlers(overlay, btnConfirm);
}

/**
 * Handles clicks on the exit modal overlay and confirmation button.
 * @param overlay - The modal overlay element.
 * @param btnConfirm - The confirmation button element.
 */
function setupExitModalClickHandlers(overlay: HTMLElement | null, btnConfirm: HTMLElement | null): void {
    overlay?.addEventListener('click', (e: MouseEvent) => {
        if (e.target === overlay) overlay.classList.remove('show');
    });

    btnConfirm?.addEventListener('click', () => {
        overlay?.classList.remove('show');
        document.getElementById('game-page')?.classList.add('hidden');
        document.getElementById('landing-page')?.classList.remove('hidden');
        applyTheme('theme-code-vibes');
    });
}

/**
 * Configures the winner modal and the return navigation.
 */
function setupWinnerModal(): void {
    const btnBackToStart = document.getElementById('btn-back-to-start');
    const winnerModal = document.getElementById('winner-modal-overlay');

    btnBackToStart?.addEventListener('click', () => {
        winnerModal?.classList.remove('show');
        document.getElementById('game-page')?.classList.add('hidden');
        document.getElementById('landing-page')?.classList.remove('hidden');
        applyTheme('theme-code-vibes');
    });
}

/**
 * Starts a new game session with current configuration.
 */
function startGame(): void {
    const themeInput = document.querySelector('input[name="theme"]:checked') as HTMLInputElement;
    const sizeInput = document.querySelector('input[name="size"]:checked') as HTMLInputElement;
    const theme = themeInput?.value || 'code-vibes';
    const size = parseInt(sizeInput?.value || '16', 10);
    const board = document.getElementById('game-board');

    initializeGameState(size);
    const folder = getThemeAssets(theme);
    updateScoreUI();
    updateTurnUI();

    if (board) {
        setupGameBoard(board, size);
        generateAndDisplayCards(board, size, folder);
    }
}

/**
 * Maps a theme name to its asset folder name.
 * @param selectedTheme - The identifier of the selected theme.
 * @returns The folder name string.
 */
function getThemeAssets(selectedTheme: string): string {
    const themeFolderMap: Record<string, string> = {
        'code-vibes': 'code-vibes', 
        'gaming': 'games',
        'da-project': 'da-projects', 
        'foods': 'food'
    };
    return themeFolderMap[selectedTheme];
}

/**
 * Initializes settings, themes, and observers for user selections.
 */
function setupSettings(): void {
    const configs = getThemeConfigs();
    setupThemeInputListeners(configs);
    setupPlayerInputListeners();
    setupSizeInputListeners();
    initializeSettingsUI(configs);
}

/**
 * Sets up listeners for theme selection inputs.
 * @param configs - Current theme configurations.
 */
function setupThemeInputListeners(configs: Record<string, any>): void {
    document.querySelectorAll('input[name="theme"]').forEach(input => {
        input.addEventListener('change', (e: Event) => {
            const val = (e.target as HTMLInputElement).value;
            const config = configs[val];
            if (config) {
                updateThemePreview(config);
                applyTheme(config.cssClass);
            }
        });
    });
}

/**
 * Updates the theme preview image and summary text.
 * @param config - The theme configuration object.
 */
function updateThemePreview(config: any): void {
    const previewImg = document.querySelector('#theme-preview img') as HTMLImageElement;
    const summaryTheme = document.getElementById('summary-theme');
    if (previewImg) previewImg.src = config.img;
    if (summaryTheme) summaryTheme.textContent = config.label;
}

/**
 * Sets up listeners for player selection inputs.
 */
function setupPlayerInputListeners(): void {
    document.querySelectorAll('input[name="player"]').forEach(input => {
        input.addEventListener('change', (e: Event) => {
            const val = (e.target as HTMLInputElement).value;
            const el = document.getElementById('summary-player');
            if (el) el.textContent = `Player ${val.charAt(0).toUpperCase() + val.slice(1)}`;
        });
    });
}

/**
 * Sets up listeners for board size selection inputs.
 */
function setupSizeInputListeners(): void {
    document.querySelectorAll('input[name="size"]').forEach(input => {
        input.addEventListener('change', (e: Event) => {
            const val = (e.target as HTMLInputElement).value;
            const el = document.getElementById('summary-size');
            if (el) el.textContent = `${val} cards`;
        });
    });
}

/**
 * Returns configuration objects for all available themes.
 * @returns Record of theme configurations.
 */
function getThemeConfigs(): Record<string, any> {
    const base = import.meta.env.BASE_URL + 'assets/theme-preview-pictures/';
    return {
        'code-vibes': { img: base + 'codevibe-theme.png', label: 'Code Vibes', cssClass: 'theme-code-vibes' },
        'da-project': { img: base + 'DAprojects-theme.png', label: 'DA Project', cssClass: 'theme-da-project' },
        'foods': { img: base + 'foods-theme.png', label: 'Foods', cssClass: 'theme-foods' },
        'gaming': { img: base + 'gaming-theme.png', label: 'Gaming', cssClass: 'theme-gaming' }
    };
}

/**
 * Syncs the settings UI with the currently selected values on page load.
 * @param configs - Current theme configurations.
 */
function initializeSettingsUI(configs: Record<string, any>): void {
    const theme = document.querySelector('input[name="theme"]:checked') as HTMLInputElement;
    const player = document.querySelector('input[name="player"]:checked') as HTMLInputElement;
    const size = document.querySelector('input[name="size"]:checked') as HTMLInputElement;

    if (theme && configs[theme.value]) {
        updateThemePreview(configs[theme.value]);
        applyTheme(configs[theme.value].cssClass);
    }
    updateSummaryUI(player, size);
}

/**
 * Updates the summary display for player and size settings.
 * @param player - The selected player input.
 * @param size - The selected size input.
 */
function updateSummaryUI(player: HTMLInputElement | null, size: HTMLInputElement | null): void {
    const sPlayer = document.getElementById('summary-player');
    if (player && sPlayer) {
        sPlayer.textContent = `Player ${player.value.charAt(0).toUpperCase() + player.value.slice(1)}`;
    }
    const sSize = document.getElementById('summary-size');
    if (size && sSize) {
        sSize.textContent = `${size.value} cards`;
    }
}

/**
 * Applies a theme CSS class to the body while removing previous themes.
 * @param newClass - The CSS class of the theme to apply.
 */
function applyTheme(newClass: string): void {
    const body = document.body;
    const classesToRemove = Array.from(body.classList).filter(c => c.startsWith('theme-'));
    body.classList.remove(...classesToRemove);
    body.classList.add(newClass);
    currentThemeClass = newClass;
}
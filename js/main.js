// js/main.js
import { Game } from './Game.js';
import { BoardRenderer } from './BoardRenderer.js';
import { BoardInput } from './BoardInput.js';
import { HUD } from './HUD.js';
import { BOARD_PRESETS } from './config.js';

// 1. Находим DOM-элементы 
const canvas = document.getElementById('board');
const counterEl = document.getElementById('moves-value'); 
const buttonEl = document.getElementById('restart-button'); 
const restartLevelBtn = document.getElementById('restart-level-button');
const winMessageEl = document.getElementById('win-message'); // ID из твоего HUD
const sizeButtons = document.querySelectorAll('.size-btn');
const currentLevelEl = document.getElementById('current-level');
const maxLevelEl = document.getElementById('max-level');

// 2. Создаем экземпляры классов
const initialPreset = BOARD_PRESETS[5];
const game = new Game(initialPreset);
const renderer = new BoardRenderer(
    canvas,
    initialPreset.size
);
const hud = new HUD(
    counterEl,
    buttonEl,
    restartLevelBtn,
    winMessageEl,
    sizeButtons,
    currentLevelEl,
    maxLevelEl
);
const input = new BoardInput(
    canvas,
    game,
    renderer,
    initialPreset.size
);


// 3. Подписки на изменения состояния игры (Observer)
game.subscribe((g) => {

    // Обновляем геометрию только при смене размера
    if (renderer.SIZE !== g.boardSize)
        renderer.setBoardSize(g.boardSize);

    if (input.SIZE !== g.boardSize)
        input.setBoardSize(g.boardSize);

    // Обновляем игровое поле
    renderer.draw(g.grid, g.isGameOver);

    // Обновляем счётчик
    hud.updateCounter(g.moves);

    // Обновляем номер текущего и максимального уровня
    hud.updateLevelInfo(g.level, g.maxLevel);

    // Подсвечиваем выбранный размер
    hud.setActiveBoardSize(g.boardSize);

    // Сообщение о победе
    if (g.isGameOver)
    {
        hud.showWinMessage();
        hud.setRestartLevelDisabled(true); // Блокируем кнопку уровня
    }
    else
    {
        hud.hideWinMessage();
        hud.setRestartLevelDisabled(false); // Разблокируем кнопку уровня
    }
});

// 4. Обработка кнопок размера
hud.onBoardSizeChange((size) => {

    const preset = BOARD_PRESETS[size];

    if (!preset) return;

    // Повторный клик на уже выбранный размер
    // не должен перезапускать игру
    if (size === game.boardSize) return;

    game.setPreset(preset);
});

// 5. Инициализация первого уровня (вызовет notify и отрисовывает поле)
game.restart();

// 6. Обработка кнопки "Перезапустить игру"
hud.onRestartClick(() => {
    game.restart(); // Внутри restart() должен вызываться notify() для обновления UI
});

// 7. Обработка кнопки "Перезапустить уровень"
hud.onRestartLevelClick(() => {
    game.restartLevel();
});

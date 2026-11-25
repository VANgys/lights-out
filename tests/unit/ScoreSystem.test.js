import { describe, it, expect, beforeEach } from '../lib/test-runner.js';
import { Game } from '../../js/Game.js';
import { HUD } from '../../js/HUD.js';
import { BOARD_PRESETS } from '../../js/config.js';

// --- Локальные хелперы ---

// Создание пустой сетки заданного размера
function createEmptyGrid(size) {
    return Array.from({ length: size }, () => new Array(size).fill(0));
}

// Имитация победы на уровне за M ходов
// Устанавливаем levelMovesAccumulator вручную, чтобы избежать случайных побед
function simulateLevelCompletion(game, movesCount) {
    // Устанавливаем накопитель ходов вручную (M - 1, так как финальный клик добавит 1)
    game.levelMovesAccumulator = movesCount - 1;
    
    // Создаём поле, которое решается одним кликом в центре
    const center = Math.floor(game.boardSize / 2);
    game.grid = createEmptyGrid(game.boardSize);
    game.toggle(center, center);
    
    // Финальный клик для победы (увеличит levelMovesAccumulator до movesCount)
    game.handleClick(center, center);
}

// --- FR-S2-01: Расчёт очков за уровень ---
describe('Формула расчёта очков', () => {
    it('Уровень 5 за 5 ходов = 100 очков', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 5;
        
        simulateLevelCompletion(game, 5);
        
        expect(game.totalScore).toBe(100);
    });

    it('Уровень 5 за 6 ходов = 83 очка', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 5;
        
        simulateLevelCompletion(game, 6);
        
        expect(game.totalScore).toBe(83);
    });

    it('Уровень 5 за 7 ходов = 71 очко', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 5;
        
        simulateLevelCompletion(game, 7);
        
        expect(game.totalScore).toBe(71);
    });

    it('Уровень 5 за 10 ходов = 50 очков', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 5;
        
        simulateLevelCompletion(game, 10);
        
        expect(game.totalScore).toBe(50);
    });

    it('Уровень 3 за 9 ходов = 33 очка (пример из SRS)', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 3;
        
        simulateLevelCompletion(game, 9);
        
        expect(game.totalScore).toBe(33);
    });
});

// --- FR-S2-02: Начисление только при победе ---
describe('Очки начисляются только при победе', () => {
    it('Незавершённый уровень не даёт очков', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.grid = createEmptyGrid(5);
        game.grid[0][0] = 1; // Включённая клетка
        
        game.handleClick(2, 2); // Клик не решает уровень
        
        expect(game.totalScore).toBe(0);
    });

    it('Очки начисляются ровно один раз за уровень', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 5;
        
        simulateLevelCompletion(game, 5);
        const scoreAfterFirstLevel = game.totalScore;
        
        // Пытаемся кликнуть ещё раз (уровень уже сменился)
        game.handleClick(0, 0);
        
        expect(game.totalScore).toBe(scoreAfterFirstLevel);
    });
});

// --- FR-S2-03: Накопительный учёт при перезапуске ---
describe('Накопительный учёт ходов при перезапуске уровня', () => {
    it('Перезапуск уровня не сбрасывает накопитель ходов', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 3;
        
        // Первая попытка: 4 хода
        // Используем клики по разным клеткам, чтобы не вызвать случайную победу
        game.grid = createEmptyGrid(5);
        game.grid[4][4] = 1; // Включаем клетку в углу, чтобы поле не было пустым
        
        game.handleClick(0, 0);
        game.handleClick(0, 1);
        game.handleClick(0, 2);
        game.handleClick(0, 3);
        
        expect(game.levelMovesAccumulator).toBe(4);
        
        // Перезапуск уровня
        game.restartLevel();
        
        // Видимый счётчик сброшен, но накопитель сохранён
        expect(game.moves).toBe(0);
        expect(game.levelMovesAccumulator).toBe(4);
        
        // Вторая попытка: 5 ходов до победы
        game.grid = createEmptyGrid(5);
        const center = 2;
        game.toggle(center, center);
        // Делаем 4 "бесполезных" клика по одной клетке (чётное число = поле не меняется)
        for (let i = 0; i < 4; i++)
            game.handleClick(0, 0);
        
        game.handleClick(center, center); // Победа
        
        // M = 4 + 5 = 9, P = floor(100 × 3/9) = 33
        expect(game.totalScore).toBe(33);
    });

    it('Многократные перезапуски накапливают ходы', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 2;
        game.levelMovesAccumulator = 0;
        
        // Три перезапуска с ходами
        for (let attempt = 0; attempt < 3; attempt++) {
            game.grid = createEmptyGrid(5);
            game.grid[4][4] = 1;
            game.handleClick(0, 0);
            game.handleClick(0, 0);
            game.restartLevel();
        }
        
        // Финальная попытка: создаём поле, которое решается ровно за 2 хода
        game.grid = createEmptyGrid(5);
        game.toggle(2, 2);
        game.toggle(2, 3);
        
        // Делаем эти же 2 хода для победы
        game.handleClick(2, 2);
        game.handleClick(2, 3);
        
        // M = 6 (из цикла) + 2 (финальная попытка) = 8
        // P = floor(100 × 2/8) = 25
        expect(game.totalScore).toBe(25);
    });
});

// --- FR-S2-04: Сброс накопителя ---
describe('Сброс накопителя ходов', () => {
    it('Накопитель сбрасывается после победы на уровне', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 5;
        game.levelMovesAccumulator = 10;
        
        simulateLevelCompletion(game, 5);
        
        expect(game.levelMovesAccumulator).toBe(0);
    });

    it('Накопитель сбрасывается при полном перезапуске', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.levelMovesAccumulator = 15;
        
        game.restart();
        
        expect(game.levelMovesAccumulator).toBe(0);
    });

    it('Накопитель сбрасывается при смене размера поля', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.levelMovesAccumulator = 20;
        
        game.setPreset(BOARD_PRESETS[3]);
        
        expect(game.levelMovesAccumulator).toBe(0);
    });
});

// --- FR-S2-05 и FR-S2-08: Сохранение счёта и рекордов в течение сеанса ---
describe('Сохранение счёта и рекордов в течение сеанса', () => {
    it('Счёт сохраняется при переходе между уровнями', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 5;
        
        simulateLevelCompletion(game, 5);
        const scoreAfterLevel5 = game.totalScore;
        
        expect(game.level).toBe(6);
        expect(game.totalScore).toBe(scoreAfterLevel5);
    });

    it('Счёт сохраняется при перезапуске уровня', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 5;
        
        simulateLevelCompletion(game, 5);
        const scoreAfterLevel5 = game.totalScore;
        
        game.restartLevel();
        
        expect(game.totalScore).toBe(scoreAfterLevel5);
    });

    it('Счёт сбрасывается при полном перезапуске', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.totalScore = 500;
        
        game.restart();
        
        expect(game.totalScore).toBe(0);
    });

    it('Счёт сбрасывается при смене размера поля', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.totalScore = 300;
        
        game.setPreset(BOARD_PRESETS[7]);
        
        expect(game.totalScore).toBe(0);
    });

    // --- FR-S2-08: Рекорды сохраняются в течение сеанса ---
    it('Рекорд сохраняется при перезапуске игры', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        
        // Набираем рекорд
        game.level = 5;
        simulateLevelCompletion(game, 5);
        expect(game.getHighScore()).toBe(100);
        
        // Перезапуск игры
        game.restart();
        
        // Рекорд должен сохраниться
        expect(game.getHighScore()).toBe(100);
    });

    it('Рекорд сохраняется при переключении размеров поля', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        
        // Набираем рекорд на 5×5
        game.level = 5;
        simulateLevelCompletion(game, 5);
        expect(game.getHighScore()).toBe(100);
        
        // Переключаемся на 3×3
        game.setPreset(BOARD_PRESETS[3]);
        expect(game.getHighScore()).toBe(0); // У 3×3 нет рекорда
        
        // Возвращаемся на 5×5
        game.setPreset(BOARD_PRESETS[5]);
        
        // Рекорд 5×5 должен сохраниться
        expect(game.getHighScore()).toBe(100);
    });

    it('Рекорд сбрасывается после перезагрузки страницы (новый экземпляр)', () => {
        // Первая "сессия"
        const game1 = new Game(BOARD_PRESETS[5]);
        game1.restart();
        game1.level = 5;
        simulateLevelCompletion(game1, 5);
        expect(game1.getHighScore()).toBe(100);
        
        // "Перезагрузка страницы" — создание нового экземпляра
        const game2 = new Game(BOARD_PRESETS[5]);
        game2.restart();
        
        // Рекорд должен сброситься в 0 (сессия завершена)
        expect(game2.getHighScore()).toBe(0);
    });
});

// --- FR-S2-06 и FR-S2-07: Раздельные рекорды ---
describe('Раздельные рекорды для каждого размера', () => {
    it('Рекорды независимы для 3×3, 5×5, 7×7', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        
        // Набираем очки на 5×5
        game.level = 5;
        simulateLevelCompletion(game, 5);
        expect(game.getHighScore()).toBe(100);
        
        // Переключаемся на 3×3 — рекорд должен быть 0
        game.setPreset(BOARD_PRESETS[3]);
        expect(game.getHighScore()).toBe(0);
        
        // Набираем очки на 3×3
        game.level = 3;
        simulateLevelCompletion(game, 3);
        expect(game.getHighScore()).toBe(100);
        
        // Возвращаемся на 5×5 — рекорд сохранён
        game.setPreset(BOARD_PRESETS[5]);
        expect(game.getHighScore()).toBe(100);
    });

    it('Рекорд обновляется после каждого уровня', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        
        // Уровень 1: 100 очков
        game.level = 1;
        simulateLevelCompletion(game, 1);
        expect(game.getHighScore()).toBe(100);
        
        // Уровень 2: ещё 100 очков = 200 всего
        game.level = 2;
        simulateLevelCompletion(game, 2);
        expect(game.getHighScore()).toBe(200);
    });

    it('Рекорд обновляется даже при малом количестве очков за уровень', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        
        // Хорошая игра: 200 очков
        game.level = 1;
        simulateLevelCompletion(game, 1);
        game.level = 2;
        simulateLevelCompletion(game, 2);
        expect(game.getHighScore()).toBe(200);
        
        // Плохая игра: всего 10 очков
        game.level = 3;
        simulateLevelCompletion(game, 30); // Много ходов
        expect(game.totalScore).toBe(210);
        expect(game.getHighScore()).toBe(210); // Рекорд обновился
    });
});

// --- FR-S2-09: Отображение рекорда при смене размера ---
describe('Отображение рекорда при выборе размера', () => {
    it('При смене размера показывается рекорд именно этого размера', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        
        // Набираем рекорд на 5×5
        game.level = 5;
        simulateLevelCompletion(game, 5);
        expect(game.getHighScore()).toBe(100);
        
        // Переключаемся на 7×7
        game.setPreset(BOARD_PRESETS[7]);
        expect(game.getHighScore()).toBe(0); // У 7×7 нет рекорда
        
        // Переключаемся на 3×3
        game.setPreset(BOARD_PRESETS[3]);
        expect(game.getHighScore()).toBe(0); // У 3×3 нет рекорда
        
        // Возвращаемся на 5×5
        game.setPreset(BOARD_PRESETS[5]);
        expect(game.getHighScore()).toBe(100); // Рекорд сохранён
    });
});

// --- FR-S2-10 и FR-S2-12: Начальные значения и сброс ---
describe('Начальные значения и сброс', () => {
    it('Начальный счёт и рекорд равны 0', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        
        expect(game.totalScore).toBe(0);
        expect(game.getHighScore()).toBe(0);
    });

    it('После обновления страницы (новый экземпляр) счёт сбрасывается', () => {
        // Имитация "обновления страницы" — создание нового экземпляра
        const game1 = new Game(BOARD_PRESETS[5]);
        game1.restart();
        game1.level = 5;
        simulateLevelCompletion(game1, 5);
        expect(game1.totalScore).toBe(100);
        
        // "Обновление страницы"
        const game2 = new Game(BOARD_PRESETS[5]);
        game2.restart();
        expect(game2.totalScore).toBe(0); // Счёт сброшен
    });
});

// --- Граничные случаи ---
describe('Граничные случаи системы очков', () => {
    it('Очень большое количество ходов даёт 0 очков', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 5;
        
        simulateLevelCompletion(game, 1000);
        
        // floor(100 × 5/1000) = floor(0.5) = 0
        expect(game.totalScore).toBe(0);
    });

    it('Очки не могут превысить 100 за уровень', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        game.level = 5;
        
        simulateLevelCompletion(game, 5);
        
        // Проверяем, что очки <= 100
        expect(game.totalScore <= 100).toBe(true);
    });
});

// --- FR-S2-10: HUD отображает текущий счёт партии ---
describe('HUD отображает текущий счёт партии', () => {
    let scoreEl, highscoreEl, hud;
    
    beforeEach(() => {
        scoreEl = document.createElement('span');
        scoreEl.id = 'score-value';
        scoreEl.textContent = '0';
        highscoreEl = document.createElement('span');
        highscoreEl.id = 'highscore-value';
        highscoreEl.textContent = '0';
        
        hud = new HUD(
            document.createElement('span'), // counterEl
            document.createElement('button'), // buttonEl
            document.createElement('button'), // restartLevelEl
            null, // winMessageEl
            null, // sizeButtons
            null, // currentLevelEl
            null, // maxLevelEl
            scoreEl,
            highscoreEl
        );
    });

    it('updateScore(0) показывает «0»', () => {
        hud.updateScore(0);
        expect(scoreEl.textContent).toBe('0');
    });

    it('updateScore(100) показывает «100» после прохождения уровня', () => {
        hud.updateScore(100);
        expect(scoreEl.textContent).toBe('100');
    });

    it('updateScore() корректно обновляет значение при накоплении очков', () => {
        hud.updateScore(50);
        expect(scoreEl.textContent).toBe('50');
        
        hud.updateScore(150);
        expect(scoreEl.textContent).toBe('150');
        
        hud.updateScore(300);
        expect(scoreEl.textContent).toBe('300');
    });

    it('updateScore() не интерпретирует HTML (защита от XSS)', () => {
        hud.updateScore('<b>999</b>');
        expect(scoreEl.children.length).toBe(0);
        expect(scoreEl.textContent).toBe('<b>999</b>');
    });

    it('Метод не падает, если элемент отсутствует (null)', () => {
        const emptyHud = new HUD(null, null, null, null, null, null, null, null, null);
        expect(() => emptyHud.updateScore(100)).not.toThrow();
    });
});

// --- FR-S2-09: HUD отображает рекорд активного размера ---
describe('HUD отображает рекорд активного размера', () => {
    let scoreEl, highscoreEl, hud;
    
    beforeEach(() => {
        scoreEl = document.createElement('span');
        highscoreEl = document.createElement('span');
        highscoreEl.textContent = '0';
        
        hud = new HUD(
            null, null, null, null, null, null, null,
            scoreEl, highscoreEl
        );
    });

    it('updateHighScore(0) показывает «0» при отсутствии рекорда', () => {
        hud.updateHighScore(0);
        expect(highscoreEl.textContent).toBe('0');
    });

    it('updateHighScore(1500) показывает рекорд для 5×5', () => {
        hud.updateHighScore(1500);
        expect(highscoreEl.textContent).toBe('1500');
    });

    it('Рекорд обновляется при переключении размера (имитация смены размера)', () => {
        // Имитация: был рекорд 1500 для 5×5
        hud.updateHighScore(1500);
        expect(highscoreEl.textContent).toBe('1500');
        
        // Переключились на 3×3, где рекорд 0
        hud.updateHighScore(0);
        expect(highscoreEl.textContent).toBe('0');
        
        // Переключились на 7×7, где рекорд 2000
        hud.updateHighScore(2000);
        expect(highscoreEl.textContent).toBe('2000');
    });

    it('Метод не падает, если элемент отсутствует (null)', () => {
        const emptyHud = new HUD(null, null, null, null, null, null, null, null, null);
        expect(() => emptyHud.updateHighScore(500)).not.toThrow();
    });
});
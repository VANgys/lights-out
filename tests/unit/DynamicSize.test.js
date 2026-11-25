/**
 * DynamicSize.test.js - Тесты динамического размера поля (3x3, 5x5, 7x7).
 * Реализует требования TC-01 — TC-09 модификации первого спринта.
 */
import { describe, it, expect } from '../lib/test-runner.js';
import { Game } from '../../js/Game.js';
import { BOARD_PRESETS } from '../../js/config.js';
import { countOn } from '../lib/helpers.js';

// --- Локальные хелперы для динамических размеров ---

// Создание пустой сетки заданного размера
function createEmptyGrid(size) {
    return Array.from({ length: size }, () => new Array(size).fill(0));
}

// Сравнение полей любого размера (аналог diffCells из helpers, но без хардкода N=5)
function diffCellsDynamic(a, b) {
    const cells = [];
    const size = a.length;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (a[r][c] !== b[r][c]) {
                cells.push([r, c]);
            }
        }
    }
    return cells;
}

// Сортировка координат для надежного сравнения массивов клеток
const sorted = cells => cells.map(([r, c]) => `${r},${c}`).sort();

// --- TC-01 и TC-02: Выбор размера и генерация поля ---
describe('Выбор размера и генерация поля', () => {
    it('3x3: поле генерируется размером 3x3, счетчик = 0, не пустое', () => {
        const game = new Game(BOARD_PRESETS[3]);
        game.restart();
        expect(game.boardSize).toBe(3);
        expect(game.maxLevel).toBe(9);
        expect(game.grid.length).toBe(3);
        expect(game.grid[0].length).toBe(3);
        expect(game.moves).toBe(0);
        expect(countOn(game.grid)).toBeGreaterThan(0);
    });

    it('5x5: поле генерируется размером 5x5, счетчик = 0, не пустое', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        expect(game.boardSize).toBe(5);
        expect(game.maxLevel).toBe(15);
        expect(game.grid.length).toBe(5);
        expect(game.grid[0].length).toBe(5);
        expect(game.moves).toBe(0);
        expect(countOn(game.grid)).toBeGreaterThan(0);
    });

    it('7x7: поле генерируется размером 7x7, счетчик = 0, не пустое', () => {
        const game = new Game(BOARD_PRESETS[7]);
        game.restart();
        expect(game.boardSize).toBe(7);
        expect(game.maxLevel).toBe(49);
        expect(game.grid.length).toBe(7);
        expect(game.grid[0].length).toBe(7);
        expect(game.moves).toBe(0);
        expect(countOn(game.grid)).toBeGreaterThan(0);
    });
});

// --- TC-03: Обработка клика по центральной клетке ---
describe('Обработка клика по центральной клетке', () => {
    it('3x3: клик по центру (1,1) инвертирует ровно 5 клеток', () => {
        const game = new Game(BOARD_PRESETS[3]);
        game.grid = createEmptyGrid(3);
        const before = game.grid.map(row => [...row]);
        game.handleClick(1, 1);
        expect(diffCellsDynamic(before, game.grid).length).toBe(5);
        expect(sorted(diffCellsDynamic(before, game.grid))).toEqual(sorted([[1, 1], [0, 1], [2, 1], [1, 0], [1, 2]]));
        expect(game.moves).toBe(1);
    });

    it('5x5: клик по центру (2,2) инвертирует ровно 5 клеток', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.grid = createEmptyGrid(5);
        const before = game.grid.map(row => [...row]);
        game.handleClick(2, 2);
        expect(sorted(diffCellsDynamic(before, game.grid))).toEqual(sorted([[2, 2], [1, 2], [3, 2], [2, 1], [2, 3]]));
        expect(game.moves).toBe(1);
    });

    it('7x7: клик по центру (3,3) инвертирует ровно 5 клеток', () => {
        const game = new Game(BOARD_PRESETS[7]);
        game.grid = createEmptyGrid(7);
        const before = game.grid.map(row => [...row]);
        game.handleClick(3, 3);
        expect(sorted(diffCellsDynamic(before, game.grid))).toEqual(sorted([[3, 3], [2, 3], [4, 3], [3, 2], [3, 4]]));
        expect(game.moves).toBe(1);
    });
});

// --- TC-04: Обработка клика по угловой клетке ---
describe('Обработка клика по угловой клетке', () => {
    it('3x3: клик по (0,0) инвертирует ровно 3 клетки (без выхода за границы)', () => {
        const game = new Game(BOARD_PRESETS[3]);
        game.grid = createEmptyGrid(3);
        const before = game.grid.map(row => [...row]);
        game.handleClick(0, 0);
        expect(sorted(diffCellsDynamic(before, game.grid))).toEqual(sorted([[0, 0], [0, 1], [1, 0]]));
        expect(game.moves).toBe(1);
    });

    it('5x5: клик по (0,0) инвертирует ровно 3 клетки', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.grid = createEmptyGrid(5);
        const before = game.grid.map(row => [...row]);
        game.handleClick(0, 0);
        expect(sorted(diffCellsDynamic(before, game.grid))).toEqual(sorted([[0, 0], [0, 1], [1, 0]]));
        expect(game.moves).toBe(1);
    });

    it('7x7: клик по (0,0) инвертирует ровно 3 клетки', () => {
        const game = new Game(BOARD_PRESETS[7]);
        game.grid = createEmptyGrid(7);
        const before = game.grid.map(row => [...row]);
        game.handleClick(0, 0);
        expect(sorted(diffCellsDynamic(before, game.grid))).toEqual(sorted([[0, 0], [0, 1], [1, 0]]));
        expect(game.moves).toBe(1);
    });
});

// --- TC-05: Обработка клика по последней клетке поля ---
describe('Обработка клика по последней клетке поля (правый нижний угол)', () => {
    it('3x3: клик по (2,2) инвертирует 3 клетки', () => {
        const game = new Game(BOARD_PRESETS[3]);
        game.grid = createEmptyGrid(3);
        const before = game.grid.map(row => [...row]);
        game.handleClick(2, 2);
        expect(sorted(diffCellsDynamic(before, game.grid))).toEqual(sorted([[2, 2], [1, 2], [2, 1]]));
        expect(game.moves).toBe(1);
    });

    it('5x5: клик по (4,4) инвертирует 3 клетки', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.grid = createEmptyGrid(5);
        const before = game.grid.map(row => [...row]);
        game.handleClick(4, 4);
        expect(sorted(diffCellsDynamic(before, game.grid))).toEqual(sorted([[4, 4], [3, 4], [4, 3]]));
        expect(game.moves).toBe(1);
    });

    it('7x7: клик по (6,6) инвертирует 3 клетки', () => {
        const game = new Game(BOARD_PRESETS[7]);
        game.grid = createEmptyGrid(7);
        const before = game.grid.map(row => [...row]);
        game.handleClick(6, 6);
        expect(sorted(diffCellsDynamic(before, game.grid))).toEqual(sorted([[6, 6], [5, 6], [6, 5]]));
        expect(game.moves).toBe(1);
    });
});

// --- TC-06: Переключение размера поля во время игры ---
describe('Переключение размера поля во время игры', () => {
    it('Переключение с 3x3 на 7x7 сбрасывает ходы, уровень и генерирует новое поле', () => {
        const game = new Game(BOARD_PRESETS[3]);
        game.restart();
        game.handleClick(0, 0);
        game.handleClick(1, 1);
        expect(game.moves).toBe(2);
        expect(game.boardSize).toBe(3);

        game.setPreset(BOARD_PRESETS[7]);

        expect(game.boardSize).toBe(7);
        expect(game.moves).toBe(0);
        expect(game.level).toBe(1);
        expect(game.grid.length).toBe(7);
        expect(countOn(game.grid)).toBeGreaterThan(0);
    });
});

// --- TC-07: Перезапуск игры и уровня ---
describe('Перезапуск игры и уровня', () => {
    it('Перезапуск уровня сохраняет размер и номер уровня, сбрасывает ходы', () => {
        const game = new Game(BOARD_PRESETS[7]);
        game.restart();
        game.level = 3; // Симуляция прогресса
        game.handleClick(0, 0);
        game.handleClick(1, 1);
        expect(game.moves).toBe(2);

        game.restartLevel();

        expect(game.boardSize).toBe(7);
        expect(game.level).toBe(3);
        expect(game.moves).toBe(0);
        expect(countOn(game.grid)).toBeGreaterThan(0);
    });

    it('Полный перезапуск переводит на уровень 1, сохраняя выбранный размер поля', () => {
        const game = new Game(BOARD_PRESETS[7]);
        game.restart();
        game.level = 5;
        game.handleClick(0, 0);
        expect(game.moves).toBe(1);

        game.restart();

        expect(game.boardSize).toBe(7);
        expect(game.level).toBe(1);
        expect(game.moves).toBe(0);
        expect(countOn(game.grid)).toBeGreaterThan(0);
    });
});

// --- TC-08: Проверка победы на разных размерах поля ---
describe('Проверка победы на разных размерах поля', () => {
    it('3x3: победа засчитывается при полном выключении, происходит переход на уровень 2', () => {
        const game = new Game(BOARD_PRESETS[3]);
        game.restart();
        game.grid = createEmptyGrid(3);
        game.toggle(1, 1); // Поле решается ровно одним кликом в (1,1)
        
        game.handleClick(1, 1);
        
        expect(game.level).toBe(2);
        expect(game.moves).toBe(0);
        expect(countOn(game.grid)).toBeGreaterThan(0); // Новое поле не пустое
    });

    it('7x7: победа засчитывается при полном выключении, переход на уровень 2', () => {
        const game = new Game(BOARD_PRESETS[7]);
        game.restart();
        game.grid = createEmptyGrid(7);
        game.toggle(3, 3);
        
        game.handleClick(3, 3);
        
        expect(game.level).toBe(2);
        expect(game.moves).toBe(0);
    });

    it('Победа не засчитывается, если осталась хотя бы одна включенная клетка', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.grid = createEmptyGrid(5);
        game.grid[4][4] = 1; // Одна включенная клетка
        expect(game.checkWin()).toBe(false);
    });
});

// --- TC-09: Регрессионная проверка размера 5×5 ---
describe('Регрессионная проверка размера 5×5', () => {
    it('5x5: генерация, клики и переходы работают корректно (без регрессии)', () => {
        const game = new Game(BOARD_PRESETS[5]);
        game.restart();
        expect(game.boardSize).toBe(5);
        expect(game.maxLevel).toBe(15);
        expect(game.moves).toBe(0);
        expect(countOn(game.grid)).toBeGreaterThan(0);

        const before = game.grid.map(row => [...row]);
        game.handleClick(2, 2);
        expect(game.moves).toBe(1);
        expect(diffCellsDynamic(before, game.grid).length).toBe(5);

        game.level = 5;
        game.restartLevel();
        expect(game.level).toBe(5);
        expect(game.moves).toBe(0);
    });
});
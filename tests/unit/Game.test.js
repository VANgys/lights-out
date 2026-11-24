/**
 * Game.test.js - Модульные тесты игровой логики (SRS, раздел 7, п. 4.1–4.4, 4.6).
 */
import { describe, it, expect, beforeEach } from '../lib/test-runner.js';
import { Game } from '../../js/Game.js';
import { CONFIG } from '../../js/config.js';
import { emptyGrid, cloneGrid, diffCells, countOn, minMoves, spy } from '../lib/helpers.js';

// Сортировка координат, чтобы сравнивать наборы клеток без учёта порядка
const sorted = cells => cells.map(([r, c]) => `${r},${c}`).sort();

let game;

// ---------------------------------------------------------------
describe('4.1 Инверсия клеток (Game.toggle)', () => {
    beforeEach(() => {
        game = new Game();
        game.grid = emptyGrid();
    });

    it('Центральная клетка (2,2): инвертируются (2,2), (1,2), (3,2), (2,1), (2,3)', () => {
        const before = cloneGrid(game.grid);
        game.toggle(2, 2);
        expect(sorted(diffCells(before, game.grid)))
            .toEqual(sorted([[2, 2], [1, 2], [3, 2], [2, 1], [2, 3]]));
    });

    it('Угловая клетка (0,0): инвертируются только (0,0), (1,0), (0,1)', () => {
        const before = cloneGrid(game.grid);
        game.toggle(0, 0);
        expect(sorted(diffCells(before, game.grid)))
            .toEqual(sorted([[0, 0], [1, 0], [0, 1]]));
    });

    it('Крайняя клетка (0,2): инвертируются (0,2), (1,2), (0,1), (0,3)', () => {
        const before = cloneGrid(game.grid);
        game.toggle(0, 2);
        expect(sorted(diffCells(before, game.grid)))
            .toEqual(sorted([[0, 2], [1, 2], [0, 1], [0, 3]]));
    });

    it('Угловая клетка (4,4): инвертируются только (4,4), (3,4), (4,3)', () => {
        const before = cloneGrid(game.grid);
        game.toggle(4, 4);
        expect(sorted(diffCells(before, game.grid)))
            .toEqual(sorted([[4, 4], [3, 4], [4, 3]]));
    });

    it('Включённая клетка выключается (1 → 0)', () => {
        game.grid[2][2] = 1;
        game.toggle(2, 2);
        expect(game.grid[2][2]).toBe(0);
        expect(game.grid[1][2]).toBe(1);
    });

    it('Повторный клик по той же клетке возвращает исходное состояние', () => {
        game.grid[0][0] = 1;
        game.grid[3][3] = 1;
        const before = cloneGrid(game.grid);
        game.toggle(1, 1);
        game.toggle(1, 1);
        expect(game.grid).toEqual(before);
    });

    it('Инверсия не выходит за границы поля (размер остаётся 5x5)', () => {
        game.toggle(0, 0);
        game.toggle(4, 4);
        expect(game.grid.length).toBe(CONFIG.BOARD_SIZE);
        for (const row of game.grid) expect(row.length).toBe(CONFIG.BOARD_SIZE);
    });
});

// ---------------------------------------------------------------
describe('4.2 Подсчёт ходов', () => {
    beforeEach(() => {
        game = new Game();
        game.restart();
    });

    it('После restart() счётчик равен 0', () => {
        expect(game.moves).toBe(0);
    });

    it('5 ходов → счётчик показывает 5', () => {
        // Все клетки включены: за 5 ходов поле не решить (нужно 15),
        // поэтому переход на новый уровень не произойдёт
        game.grid = emptyGrid().map(row => row.fill(1));
        for (let i = 0; i < 5; i++) game.handleClick(0, 0);
        expect(game.moves).toBe(5);
    });

    it('Сброс счётчика при перезапуске', () => {
        game.grid = emptyGrid().map(row => row.fill(1));
        game.handleClick(1, 1);
        game.handleClick(2, 2);
        game.restart();
        expect(game.moves).toBe(0);
    });

    it('Сброс счётчика при переходе на следующий уровень', () => {
        game.grid = emptyGrid();
        game.toggle(2, 2);        // поле решается одним ходом в (2,2)
        game.handleClick(2, 2);
        expect(game.level).toBe(2);
        expect(game.moves).toBe(0);
    });

    it('Ход на заблокированном поле (после 15-го уровня) не засчитывается', () => {
        game.isGameOver = true;
        game.moves = 7;
        game.handleClick(2, 2);
        expect(game.moves).toBe(7);
    });
});

// ---------------------------------------------------------------
describe('4.3 Определение победы', () => {
    beforeEach(() => {
        game = new Game();
        game.restart();
    });

    it('checkWin() возвращает true для полностью выключенного поля', () => {
        game.grid = emptyGrid();
        expect(game.checkWin()).toBe(true);
    });

    it('checkWin() возвращает false, если включена одна клетка', () => {
        game.grid = emptyGrid();
        game.grid[4][4] = 1;
        expect(game.checkWin()).toBe(false);
    });

    it('Уровень пройден: новое непустое поле, счётчик = 0, уровень +1', () => {
        game.grid = emptyGrid();
        game.toggle(0, 0);
        game.handleClick(0, 0);
        expect(game.level).toBe(2);
        expect(game.moves).toBe(0);
        expect(countOn(game.grid)).toBeGreaterThan(0);
    });

    it('Победа не засчитывается, если осталась одна включённая клетка', () => {
        game.grid = emptyGrid();
        game.toggle(2, 2);
        game.grid[4][4] = 1;      // лишняя включённая клетка
        game.handleClick(2, 2);
        expect(game.level).toBe(1);
        expect(game.moves).toBe(1);
        expect(game.grid[4][4]).toBe(1);
    });

    it('Победа на 15-м уровне завершает игру (isGameOver = true)', () => {
        game.level = CONFIG.MAX_LEVEL;
        game.grid = emptyGrid();
        game.toggle(1, 3);
        game.handleClick(1, 3);
        expect(game.isGameOver).toBe(true);
        expect(game.level).toBe(CONFIG.MAX_LEVEL);
    });

    it('После завершения игры клики не меняют поле', () => {
        game.level = CONFIG.MAX_LEVEL;
        game.grid = emptyGrid();
        game.toggle(1, 3);
        game.handleClick(1, 3);
        const before = cloneGrid(game.grid);
        game.handleClick(2, 2);
        expect(game.grid).toEqual(before);
    });

    it('restart() после завершения игры возвращает на уровень 1', () => {
        game.isGameOver = true;
        game.level = CONFIG.MAX_LEVEL;
        game.restart();
        expect(game.isGameOver).toBe(false);
        expect(game.level).toBe(1);
        expect(game.moves).toBe(0);
    });
});

// ---------------------------------------------------------------
describe('4.4 Генерация уровней (Game.generateLevel)', () => {
    beforeEach(() => {
        game = new Game();
    });

    // Генерация случайна, поэтому каждый уровень проверяется многократно
    const RUNS = 50;

    it('Поле имеет размер 5x5 и содержит только 0 и 1', () => {
        game.generateLevel(7);
        expect(game.grid.length).toBe(CONFIG.BOARD_SIZE);
        for (const row of game.grid) {
            expect(row.length).toBe(CONFIG.BOARD_SIZE);
            for (const v of row) expect(v === 0 || v === 1).toBe(true);
        }
    });

    it('generateLevel() обнуляет счётчик ходов', () => {
        game.moves = 12;
        game.generateLevel(3);
        expect(game.moves).toBe(0);
    });

    it(`Уровень 1 решается ровно за 1 ход (${RUNS} генераций)`, () => {
        for (let i = 0; i < RUNS; i++) {
            game.generateLevel(1);
            expect(minMoves(game.grid)).toBe(1);
        }
    });

    it(`Уровень 5 решается минимум за 5 ходов (${RUNS} генераций)`, () => {
        for (let i = 0; i < RUNS; i++) {
            game.generateLevel(5);
            expect(minMoves(game.grid)).toBe(5);
        }
    });

    it(`Каждый уровень 1–15: минимальное число ходов = номер уровня (${RUNS} генераций на уровень)`, () => {
        for (let n = 1; n <= CONFIG.MAX_LEVEL; n++) {
            for (let i = 0; i < RUNS; i++) {
                game.generateLevel(n);
                const m = minMoves(game.grid);
                if (m !== n)
                    throw new Error(`Уровень ${n}: минимальное решение = ${m} ходов`);
            }
        }
    });

    it('Поле любого уровня решаемо', () => {
        for (let n = 1; n <= CONFIG.MAX_LEVEL; n++) {
            game.generateLevel(n);
            expect(minMoves(game.grid) !== null).toBe(true);
        }
    });

    it('Поле любого уровня не пустое', () => {
        for (let n = 1; n <= CONFIG.MAX_LEVEL; n++) {
            for (let i = 0; i < 10; i++) {
                game.generateLevel(n);
                expect(countOn(game.grid)).toBeGreaterThan(0);
            }
        }
    });
});

// ---------------------------------------------------------------
describe('4.6 Начальное состояние (аналог перезагрузки страницы)', () => {
    it('Новый экземпляр Game после restart(): уровень 1, счётчик 0, игра не завершена', () => {
        const g = new Game();
        g.restart();
        expect(g.level).toBe(1);
        expect(g.moves).toBe(0);
        expect(g.isGameOver).toBe(false);
        expect(countOn(g.grid)).toBeGreaterThan(0);
    });

    it('Состояние предыдущей игры не переносится в новый экземпляр', () => {
        const old = new Game();
        old.restart();
        old.level = 9;
        old.moves = 4;
        const fresh = new Game();
        fresh.restart();
        expect(fresh.level).toBe(1);
        expect(fresh.moves).toBe(0);
    });
});

// ---------------------------------------------------------------
describe('Подписка на изменения (Game.subscribe / notify)', () => {
    beforeEach(() => {
        game = new Game();
    });

    it('subscribe() бросает ошибку, если передана не функция', () => {
        expect(() => game.subscribe(null)).toThrow();
        expect(() => game.subscribe('text')).toThrow();
    });

    it('subscribe() принимает функцию без ошибок', () => {
        expect(() => game.subscribe(() => {})).not.toThrow();
    });

    it('restart() оповещает подписчика и передаёт ему объект игры', () => {
        const listener = spy();
        game.subscribe(listener);
        game.restart();
        expect(listener.calls.length).toBe(1);
        expect(listener.calls[0][0]).toBe(game);
    });

    it('handleClick() оповещает подписчика после каждого хода', () => {
        game.restart();
        game.grid = emptyGrid().map(row => row.fill(1));
        const listener = spy();
        game.subscribe(listener);
        game.handleClick(0, 0);
        game.handleClick(0, 0);
        expect(listener.calls.length).toBe(2);
    });

    it('Подписчик видит уже обновлённое состояние (счётчик ходов)', () => {
        game.restart();
        game.grid = emptyGrid().map(row => row.fill(1));
        let seenMoves = null;
        game.subscribe(g => { seenMoves = g.moves; });
        game.handleClick(0, 0);
        expect(seenMoves).toBe(1);
    });

    it('Оповещаются все подписчики', () => {
        const a = spy(), b = spy();
        game.subscribe(a);
        game.subscribe(b);
        game.restart();
        expect(a.calls.length).toBe(1);
        expect(b.calls.length).toBe(1);
    });

    it('Клик по заблокированному полю не вызывает оповещение', () => {
        game.restart();
        game.isGameOver = true;
        const listener = spy();
        game.subscribe(listener);
        game.handleClick(2, 2);
        expect(listener.calls.length).toBe(0);
    });
});

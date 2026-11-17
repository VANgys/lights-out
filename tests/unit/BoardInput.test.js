/**
 * BoardInput.test.js - Модульные тесты обработки ввода (SRS, раздел 7, п. 4.1, 4.2, 4.7).
 * Вместо настоящего рендерера используется «пустышка», а Canvas получает
 * фиксированное положение на странице, чтобы координаты были предсказуемы.
 */
import { describe, it, expect, beforeEach } from '../lib/test-runner.js';
import { BoardInput } from '../../js/BoardInput.js';
import { Game } from '../../js/Game.js';
import { emptyGrid, fakeCanvas, fakeRenderer, cellCenter, gapPoint } from '../lib/helpers.js';

let canvas, game, renderer, input;

// Клик по Canvas в заданной точке экрана
function clickAt({ clientX, clientY }) {
    canvas.dispatchEvent(new MouseEvent('click', { clientX, clientY }));
}

describe('BoardInput.getCell: перевод координат в клетку', () => {
    beforeEach(() => {
        canvas = fakeCanvas();
        game = new Game();
        game.restart();
        input = new BoardInput(canvas, game, fakeRenderer());
    });

    it('Центр клетки (0,0) → { r: 0, c: 0 }', () => {
        const p = cellCenter(0, 0);
        expect(input.getCell(p.clientX, p.clientY)).toEqual({ r: 0, c: 0 });
    });

    it('Центр клетки (2,3) → { r: 2, c: 3 }', () => {
        const p = cellCenter(2, 3);
        expect(input.getCell(p.clientX, p.clientY)).toEqual({ r: 2, c: 3 });
    });

    it('Центр клетки (4,4) → { r: 4, c: 4 }', () => {
        const p = cellCenter(4, 4);
        expect(input.getCell(p.clientX, p.clientY)).toEqual({ r: 4, c: 4 });
    });

    it('Зазор между клетками → null', () => {
        const p = gapPoint();
        expect(input.getCell(p.clientX, p.clientY)).toBeNull();
    });

    it('Отступ под свечение (угол Canvas) → null', () => {
        expect(input.getCell(5, 5)).toBeNull();
    });

    it('Точка вне Canvas → null', () => {
        expect(input.getCell(-50, 900)).toBeNull();
    });

    it('Учитывается масштаб: Canvas растянут до 800px и сдвинут', () => {
        canvas = fakeCanvas(800, 100, 50);
        input = new BoardInput(canvas, game, fakeRenderer());
        const p = cellCenter(3, 1, 800, 100, 50);
        expect(input.getCell(p.clientX, p.clientY)).toEqual({ r: 3, c: 1 });
    });
});

describe('BoardInput: клики по полю', () => {
    beforeEach(() => {
        canvas = fakeCanvas();
        game = new Game();
        game.restart();
        // Все клетки включены — поле не решится за несколько ходов
        game.grid = emptyGrid().map(row => row.fill(1));
        renderer = fakeRenderer();
        input = new BoardInput(canvas, game, renderer);
    });

    it('Клик по клетке засчитывает ход и инвертирует клетку', () => {
        clickAt(cellCenter(2, 2));
        expect(game.moves).toBe(1);
        expect(game.grid[2][2]).toBe(0);
    });

    it('Клик в зазор между клетками: ход не засчитывается', () => {
        clickAt(gapPoint());
        expect(game.moves).toBe(0);
    });

    it('Клик по пустому месту Canvas: поле не меняется', () => {
        clickAt({ clientX: 3, clientY: 3 });
        expect(game.grid.flat().every(v => v === 1)).toBe(true);
    });

    it('Клик по клетке сбрасывает эффект нажатия', () => {
        clickAt(cellCenter(1, 1));
        expect(renderer.setPressed.calls.at(-1)).toEqual([-1, -1]);
    });

    it('Быстрые клики: все 20 ходов обработаны корректно', () => {
        for (let i = 0; i < 20; i++) clickAt(cellCenter(0, 0));
        expect(game.moves).toBe(20);
        // чётное число кликов по одной клетке → поле в исходном состоянии
        expect(game.grid.flat().every(v => v === 1)).toBe(true);
    });

    it('Заблокированное поле: клики игнорируются', () => {
        game.isGameOver = true;
        clickAt(cellCenter(2, 2));
        expect(game.moves).toBe(0);
        expect(game.grid[2][2]).toBe(1);
    });
});

describe('BoardInput: эффекты наведения и нажатия', () => {
    beforeEach(() => {
        canvas = fakeCanvas();
        game = new Game();
        game.restart();
        renderer = fakeRenderer();
        input = new BoardInput(canvas, game, renderer);
    });

    it('Наведение на клетку передаёт её в renderer.setHover и перерисовывает поле', () => {
        const p = cellCenter(3, 2);
        canvas.dispatchEvent(new MouseEvent('mousemove', p));
        expect(renderer.setHover.calls.at(-1)).toEqual([3, 2]);
        expect(renderer.draw.calls.length).toBeGreaterThan(0);
    });

    it('Наведение на зазор сбрасывает подсветку (-1, -1)', () => {
        canvas.dispatchEvent(new MouseEvent('mousemove', gapPoint()));
        expect(renderer.setHover.calls.at(-1)).toEqual([-1, -1]);
    });

    it('Нажатие кнопки мыши на клетке включает эффект утопания', () => {
        canvas.dispatchEvent(new MouseEvent('mousedown', cellCenter(1, 4)));
        expect(renderer.setPressed.calls.at(-1)).toEqual([1, 4]);
    });

    it('Отпускание кнопки мыши сбрасывает эффект утопания', () => {
        canvas.dispatchEvent(new MouseEvent('mousedown', cellCenter(1, 4)));
        canvas.dispatchEvent(new MouseEvent('mouseup', cellCenter(1, 4)));
        expect(renderer.setPressed.calls.at(-1)).toEqual([-1, -1]);
    });

    it('Уход курсора с поля сбрасывает и наведение, и нажатие', () => {
        canvas.dispatchEvent(new MouseEvent('mouseleave'));
        expect(renderer.setHover.calls.at(-1)).toEqual([-1, -1]);
        expect(renderer.setPressed.calls.at(-1)).toEqual([-1, -1]);
    });

    it('На заблокированном поле наведение и нажатие не работают', () => {
        game.isGameOver = true;
        canvas.dispatchEvent(new MouseEvent('mousemove', cellCenter(2, 2)));
        canvas.dispatchEvent(new MouseEvent('mousedown', cellCenter(2, 2)));
        expect(renderer.setHover.calls.length).toBe(0);
        expect(renderer.setPressed.calls.length).toBe(0);
    });
});

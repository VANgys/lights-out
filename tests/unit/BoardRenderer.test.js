/**
 * BoardRenderer.test.js - Модульные тесты отрисовки (SRS, раздел 7, п. 4.5).
 * Визуальный результат (цвет, свечение) проверяется вручную,
 * здесь проверяется логика: какие клетки и в каком состоянии рисуются.
 */
import { describe, it, expect, beforeEach } from '../lib/test-runner.js';
import { BoardRenderer } from '../../js/BoardRenderer.js';
import { CONFIG } from '../../js/config.js';
import { emptyGrid } from '../lib/helpers.js';

let renderer, drawn;

describe('BoardRenderer: логика отрисовки', () => {
    beforeEach(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        renderer = new BoardRenderer(canvas);

        // Перехватываем drawCell, чтобы запомнить параметры каждой клетки
        drawn = [];
        renderer.drawCell = (r, c, isOn, isHovered, isPressed) =>
            drawn.push({ r, c, isOn, isHovered, isPressed });
    });

    it('draw() рисует все 25 клеток', () => {
        renderer.draw(emptyGrid(), false);
        expect(drawn.length).toBe(CONFIG.BOARD_SIZE * CONFIG.BOARD_SIZE);
    });

    it('Включённая клетка рисуется как включённая', () => {
        const grid = emptyGrid();
        grid[1][3] = 1;
        renderer.draw(grid, false);
        const on = drawn.filter(d => d.isOn);
        expect(on.length).toBe(1);
        expect([on[0].r, on[0].c]).toEqual([1, 3]);
    });

    it('setHover(2,2): подсвечивается только клетка (2,2)', () => {
        renderer.setHover(2, 2);
        renderer.draw(emptyGrid(), false);
        const hovered = drawn.filter(d => d.isHovered);
        expect(hovered.length).toBe(1);
        expect([hovered[0].r, hovered[0].c]).toEqual([2, 2]);
    });

    it('setPressed(0,4): эффект нажатия только у клетки (0,4)', () => {
        renderer.setPressed(0, 4);
        renderer.draw(emptyGrid(), false);
        const pressed = drawn.filter(d => d.isPressed);
        expect(pressed.length).toBe(1);
        expect([pressed[0].r, pressed[0].c]).toEqual([0, 4]);
    });

    it('setHover(-1,-1) снимает подсветку со всех клеток', () => {
        renderer.setHover(2, 2);
        renderer.setHover(-1, -1);
        renderer.draw(emptyGrid(), false);
        expect(drawn.some(d => d.isHovered)).toBe(false);
    });

    it('На заблокированном поле наведение и нажатие не отображаются', () => {
        renderer.setHover(1, 1);
        renderer.setPressed(1, 1);
        renderer.draw(emptyGrid(), true);
        expect(drawn.some(d => d.isHovered || d.isPressed)).toBe(false);
    });
});

/**
 * helpers.js - Вспомогательные функции для тестов.
 */
import { CONFIG } from '../../js/config.js';

const N = CONFIG.BOARD_SIZE;

// Пустое поле 5x5
export function emptyGrid() {
    return Array.from({ length: N }, () => new Array(N).fill(0));
}

// Глубокая копия поля
export function cloneGrid(grid) {
    return grid.map(row => row.slice());
}

// Список координат клеток, которые различаются в двух полях
export function diffCells(a, b) {
    const cells = [];
    for (let r = 0; r < N; r++)
        for (let c = 0; c < N; c++)
            if (a[r][c] !== b[r][c]) cells.push([r, c]);
    return cells;
}

// Количество включённых клеток
export function countOn(grid) {
    return grid.flat().filter(v => v === 1).length;
}

/**
 * Минимальное число ходов для решения поля (или null, если решения нет).
 * Метод «погони за светом»: ходы первой строки (32 варианта) однозначно
 * определяют все остальные ходы, поэтому перебор находит ВСЕ решения,
 * и среди них выбирается самое короткое.
 */
export function minMoves(grid) {
    let best = null;
    for (let mask = 0; mask < (1 << N); mask++) {
        const g = cloneGrid(grid);
        let count = 0;
        const press = (r, c) => {
            count++;
            for (const [dr, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < N && nc >= 0 && nc < N) g[nr][nc] ^= 1;
            }
        };
        for (let c = 0; c < N; c++) if (mask >> c & 1) press(0, c);
        for (let r = 1; r < N; r++)
            for (let c = 0; c < N; c++)
                if (g[r - 1][c]) press(r, c);
        if (g[N - 1].every(v => v === 0) && (best === null || count < best)) best = count;
    }
    return best;
}

// Простая «шпионская» функция: запоминает все вызовы
export function spy() {
    const fn = (...args) => { fn.calls.push(args); };
    fn.calls = [];
    return fn;
}

// Поддельный рендерер для BoardInput (без рисования)
export function fakeRenderer() {
    return { setPressed: spy(), setHover: spy(), draw: spy() };
}

// Canvas 400x400, который «лежит» на странице в точке (left, top) с размером displaySize
export function fakeCanvas(displaySize = 400, left = 0, top = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    canvas.getBoundingClientRect = () => ({ left, top, width: displaySize, height: displaySize });
    return canvas;
}

// Пиксельные координаты центра клетки (r, c) на canvas шириной 400
export function cellCenter(r, c, displaySize = 400, left = 0, top = 0) {
    const width = 400;
    const gap = width * CONFIG.GAP_RATIO;
    const cell = (width - CONFIG.GLOW_MARGIN_PX * 2 - gap * (N - 1)) / N;
    const scale = displaySize / width;
    const x = CONFIG.GLOW_MARGIN_PX + c * (cell + gap) + cell / 2;
    const y = CONFIG.GLOW_MARGIN_PX + r * (cell + gap) + cell / 2;
    return { clientX: left + x * scale, clientY: top + y * scale };
}

// Точка в зазоре между клетками (0,0) и (0,1)
export function gapPoint() {
    const width = 400;
    const gap = width * CONFIG.GAP_RATIO;
    const cell = (width - CONFIG.GLOW_MARGIN_PX * 2 - gap * (N - 1)) / N;
    return {
        clientX: CONFIG.GLOW_MARGIN_PX + cell + gap / 2,
        clientY: CONFIG.GLOW_MARGIN_PX + cell / 2,
    };
}

/**
 * config.js - Централизованное хранилище констант.
 * Использует пропорции для адаптивности.
 * и содержит готовые цвета для совместимости с BoardRenderer.
 */

export const CONFIG = Object.freeze({
    // --- Адаптивная геометрия ---
    REF_BOARD_PX: 370,          // Ширина поля в макете
    GAP_RATIO: 9 / 370,         // Зазор между клетками (доля от ширины)
    RADIUS_RATIO: 10 / 66.8,    // Скругление углов (доля от размера клетки)
    GLOW_MARGIN_PX: 24,         // Отступ внутри Canvas под свечение

    // --- Цвета ---
    COLOR_OFF: '#313858',       // Темно-синяя выключенная клетка
    COLOR_ON: '#ffb30b',        // Желтая включенная клетка
    COLOR_OFF_HOVER: '#3a4266', // Выключенная при наведении
    COLOR_ON_HOVER: '#ffbe2c',  // Включенная при наведении

    // --- Эффекты Canvas ---
    SHADOW_COLOR: 'rgba(255, 179, 11, 0.5)', // Цвет свечения
    SHADOW_BLUR: 14,                         // Радиус размытия свечения
    PRESS_SCALE: 0.92,                       // Уменьшение клетки при нажатии
});

export const BOARD_PRESETS = Object.freeze({
    3: Object.freeze({
        size: 3,
        maxLevel: 9,
        generator: 'random'
    }),

    5: Object.freeze({
        size: 5,
        maxLevel: 15,
        generator: 'template'
    }),

    7: Object.freeze({
        size: 7,
        maxLevel: 49,
        generator: 'random'
    })
});
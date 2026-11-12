// js/HUD.js

/**
 * HUD.js - Управление интерфейсом (Boundary).
 * Отвечает за обновление счетчика ходов, показ сообщения о победе
 * и обработку нажатия на кнопку перезапуска.
 */
export class HUD {
    constructor(counterEl, buttonEl, winMessageEl) {

    }

    /**
     * [UI-2 / FR-5 / NFR-6]: Обновление счетчика ходов.
     * Используем textContent для безопасности (защита от XSS).
     * @param {number} moves - Текущее количество ходов
     */
    updateCounter(moves) {

    }

    /**
     * [UI-6 / FR-13]: Показ сообщения о победе.
     * Убираем атрибут hidden, чтобы текст появился на экране.
     */
    showWinMessage() {

    }

    /**
     * [FR-12]: Скрытие сообщения о победе (при перезапуске игры).
     * Возвращаем атрибут hidden.
     */
    hideWinMessage() {

    }

    /**
     * [FR-7]: Показ сообщения об ошибке генерации уровня.
     */
    showLevelGenerationError() {

    }

    /**
     * [UI-3 / FR-11 / FR-12]: Подписка на клик по кнопке перезапуска.
     * Мы передаем callback-функцию, чтобы HUD не зависел напрямую от класса Game.
     * @param {Function} callback - Функция, которая вызовется при клике
     */
    onRestartClick(callback) {
        
    }
}
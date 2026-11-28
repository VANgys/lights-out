// js/HUD.js

/**
 * HUD.js - Управление интерфейсом (Boundary).
 * Отвечает за обновление счетчика ходов, показ сообщения о победе
 * и обработку нажатия на кнопку перезапуска.
 */
export class HUD {
    constructor(
    counterEl,
    buttonEl,
    restartLevelEl,
    winMessageEl,
    sizeButtons,
    currentLevelEl,
    maxLevelEl,
    scoreEl,
    highscoreEl
    ) {
    this.counterEl = counterEl;
    this.buttonEl = buttonEl;
    this.restartLevelEl = restartLevelEl;
    this.winMessageEl = winMessageEl;

    this.sizeButtons = Array.from(sizeButtons ?? []);
    this.currentLevelEl = currentLevelEl;
    this.maxLevelEl = maxLevelEl;

    this.scoreEl = scoreEl;
    this.highscoreEl = highscoreEl;
    }

    /**
     * [UI-2 / FR-5 / NFR-6]: Обновление счетчика ходов.
     * Используем textContent для безопасности (защита от XSS).
     * @param {number} moves - Текущее количество ходов
     */
    updateCounter(moves) {
        if (this.counterEl) {
            this.counterEl.textContent = moves;
        }
    }

    updateScore(score) {
        if (this.scoreEl)
            this.scoreEl.textContent = score;
    }

    showScorePopup(points) {
        if (!points || points <= 0) return;
        
        // Находим родительский блок (колонку) для очков
        const scoreMetricEl = this.scoreEl ? this.scoreEl.closest('.metric') : null;

        if (!scoreMetricEl) return;

        // Создаем элемент
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        
        // Добавляем внутрь колонки с очками
        scoreMetricEl.appendChild(popup);

        // Запускаем анимацию
        setTimeout(() => popup.classList.add('animate'), 10);
        // Удаляем через 1.5 секунды
        setTimeout(() => popup.remove(), 1500);
    }

    updateHighScore(highscore) {
        if (this.highscoreEl)
            this.highscoreEl.textContent = highscore;
    }

    // Обновление цвета у рекорда, если он побит
    setHighScoreColor(isBeaten) {
        if (this.highscoreEl) {
            // Добавляем или убираем класс, который меняет цвет
            this.highscoreEl.classList.toggle('highscore-beaten', isBeaten);
        }
    }

    /**
     * [UI-6 / FR-13]: Показ сообщения о победе.
     * Убираем атрибут hidden, чтобы текст появился на экране.
     */
    showWinMessage() {
        if (this.winMessageEl) {
            this.winMessageEl.hidden = false;
        }
    }

    /**
     * [FR-12]: Скрытие сообщения о победе (при перезапуске игры).
     * Возвращаем атрибут hidden.
     */
    hideWinMessage() {
        if (this.winMessageEl) {
            this.winMessageEl.hidden = true;
        }
    }

    /**
     * [FR-7]: Показ сообщения об ошибке генерации уровня.
     */
    showLevelGenerationError() {
        alert("Не удалось сгенерировать уровень. Пожалуйста, перезапустите игру.");
    }

    /**
     * [UI-3 / FR-11 / FR-12]: Подписка на клик по кнопке перезапуска.
     * Мы передаем callback-функцию, чтобы HUD не зависел напрямую от класса Game.
     * @param {Function} callback - Функция, которая вызовется при клике
     */
    onRestartClick(callback) {
    if (!this.buttonEl) return;

    // снимаем предыдущий подписчик, если был
    if (this._restartHandler) {
        this.buttonEl.removeEventListener('click', this._restartHandler);
    }

    this._restartHandler = () => callback();
    this.buttonEl.addEventListener('click', this._restartHandler);    
    }

    /**
     * Подписка на клик по кнопке перезапуска уровня.
     */
    onRestartLevelClick(callback) {
        if (!this.restartLevelEl) return;

        if (this._restartLevelHandler) {
            this.restartLevelEl.removeEventListener('click', this._restartLevelHandler);
        }

        this._restartLevelHandler = () => callback();
        this.restartLevelEl.addEventListener('click', this._restartLevelHandler);
    }

    onBoardSizeChange(callback) 
    {
        this.sizeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const size = Number(button.dataset.size);

                if (Number.isInteger(size))
                    callback(size);
            });
        });
    }

    updateLevelInfo(level, maxLevel) 
    {
        if (this.currentLevelEl)
            this.currentLevelEl.textContent = level;

        if (this.maxLevelEl)
            this.maxLevelEl.textContent = maxLevel;
    }

    setActiveBoardSize(size) 
    {
        this.sizeButtons.forEach(button => {
            const isActive =
                Number(button.dataset.size) === size;

            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    // Блокировка/разблокировка кнопки перезапуска уровня
    setRestartLevelDisabled(isDisabled) 
    {
        if (this.restartLevelEl) 
        {
            this.restartLevelEl.disabled = isDisabled;
            this.restartLevelEl.classList.toggle('disabled', isDisabled); 
        }
    }
}
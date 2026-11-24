/**
 * HUD.test.js - Модульные тесты интерфейса (SRS, раздел 7, п. 4.2, 4.3, 4.5).
 * Используются настоящие DOM-элементы, созданные в памяти (на страницу не добавляются).
 */
import { describe, it, expect, beforeEach } from '../lib/test-runner.js';
import { HUD } from '../../js/HUD.js';
import { spy } from '../lib/helpers.js';

let counterEl, buttonEl, winEl, hud;

describe('HUD: счётчик ходов и сообщение о победе', () => {
    beforeEach(() => {
        counterEl = document.createElement('span');
        counterEl.textContent = '0';
        buttonEl = document.createElement('button');
        winEl = document.createElement('span');
        winEl.hidden = true;
        hud = new HUD(counterEl, buttonEl, null, winEl);
    });

    it('updateCounter(5) показывает «5»', () => {
        hud.updateCounter(5);
        expect(counterEl.textContent).toBe('5');
    });

    it('updateCounter(0) показывает «0» (сброс счётчика)', () => {
        hud.updateCounter(12);
        hud.updateCounter(0);
        expect(counterEl.textContent).toBe('0');
    });

    it('updateCounter() не интерпретирует HTML (защита от XSS, NFR-6)', () => {
        hud.updateCounter('<b>1</b>');
        expect(counterEl.children.length).toBe(0);
        expect(counterEl.textContent).toBe('<b>1</b>');
    });

    it('showWinMessage() делает сообщение видимым', () => {
        hud.showWinMessage();
        expect(winEl.hidden).toBe(false);
    });

    it('hideWinMessage() скрывает сообщение', () => {
        hud.showWinMessage();
        hud.hideWinMessage();
        expect(winEl.hidden).toBe(true);
    });

    it('showLevelGenerationError() показывает alert с сообщением', () => {
        const originalAlert = window.alert;
        const fakeAlert = spy();
        window.alert = fakeAlert;
        try {
            hud.showLevelGenerationError();
        } finally {
            window.alert = originalAlert;
        }
        expect(fakeAlert.calls.length).toBe(1);
        expect(typeof fakeAlert.calls[0][0]).toBe('string');
    });
});

describe('HUD: кнопка «Перезапустить игру»', () => {
    beforeEach(() => {
        buttonEl = document.createElement('button');
        hud = new HUD(document.createElement('span'), buttonEl, document.createElement('span'), null);
    });

    it('Клик по кнопке вызывает переданный callback', () => {
        const callback = spy();
        hud.onRestartClick(callback);
        buttonEl.click();
        expect(callback.calls.length).toBe(1);
    });

    it('Каждый клик вызывает callback заново', () => {
        const callback = spy();
        hud.onRestartClick(callback);
        buttonEl.click();
        buttonEl.click();
        buttonEl.click();
        expect(callback.calls.length).toBe(3);
    });

    it('Повторная подписка заменяет старый обработчик (без двойного вызова)', () => {
        const first = spy(), second = spy();
        hud.onRestartClick(first);
        hud.onRestartClick(second);
        buttonEl.click();
        expect(first.calls.length).toBe(0);
        expect(second.calls.length).toBe(1);
    });
});

describe('HUD: отсутствующие DOM-элементы', () => {
    it('Методы не падают, если элементы не найдены (null)', () => {
        const empty = new HUD(null, null, null, null);
        expect(() => empty.updateCounter(3)).not.toThrow();
        expect(() => empty.showWinMessage()).not.toThrow();
        expect(() => empty.hideWinMessage()).not.toThrow();
        expect(() => empty.onRestartClick(() => {})).not.toThrow();
    });
});

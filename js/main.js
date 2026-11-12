// js/main.js
import { Game } from './Game.js';
import { BoardRenderer } from './BoardRenderer.js';
import { BoardInput } from './BoardInput.js';
import { HUD } from './HUD.js';

// 1. Находим DOM-элементы 
const canvas = document.getElementById('board');
const counterEl = document.getElementById('moves-value'); 
const buttonEl = document.getElementById('restart-button'); 
const winMessageEl = document.getElementById('win-message'); // ID из твоего HUD

// 2. Создаем экземпляры классов
const game = new Game();
const renderer = new BoardRenderer(canvas);
const hud = new HUD(counterEl, buttonEl, winMessageEl);
const input = new BoardInput(canvas, game, renderer);


// 3. Подписки на изменения состояния игры (Observer)


// 4. Инициализация первого уровня (вызовет notify и отрисовывает поле)


// 5. Обработка кнопки «Перезапустить»


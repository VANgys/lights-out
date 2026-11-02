import { CONFIG } from './config.js';

export class BoardInput {
    constructor(canvas, game, renderer) {
        this.canvas = canvas;
        
        // Зависимости
        this.game = game;
        this.renderer = renderer;
        
        // константы
        this.SIZE = CONFIG.BOARD_SIZE;
        this.PADDING = CONFIG.GLOW_MARGIN_PX;
        this.GAP = canvas.width * CONFIG.GAP_RATIO;
        this.CELL = (canvas.width - this.PADDING * 2 - this.GAP * (this.SIZE - 1)) / this.SIZE;
    }

    onCanvasClick(event) 
    {

    }

    onCanvasMouseMove(event) 
    {

    }

    getCell(clientX, clientY) 
    {

    }

    // Обработка нажатия кнопки мыши (для эффекта утопания)
    onCanvasMouseDown(event) 
    {

    }

    // Обработка отпускания кнопки мыши (сброс эффекта утопания)
    onCanvasMouseUp(event) 
    {

    }

    // Обработка ухода курсора с поля (сброс всех эффектов)
    onCanvasMouseLeave(event) 
    {

    }
}
// js/BoardRenderer.js

export class BoardRenderer {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        
        // Константы для отрисовки
        // TODO: Подогнать размеры под финальный HTML, если изменятся габариты canvas
        this.SIZE = 5;
        this.PADDING = 12;
        this.GAP = 8;
        this.CELL = (canvas.width - this.PADDING * 2 - this.GAP * (this.SIZE - 1)) / this.SIZE;
        
        // Цвета
        // TODO: Сверить цвета с CSS
        this.COLOR_OFF = '#313858';
        this.COLOR_ON = '#ffb30b';
    }

    // Очищает холст
    clear() 
    {

    }

    // Главный метод отрисовки
    draw(grid, isGameOver) 
    {

    }

    // Отрисовка одной клетки
    drawCell(r, c, isOn) 
    {

    }

    // Вспомогательный метод
    #roundRect(x, y, w, h, r) 
    {

    }
}
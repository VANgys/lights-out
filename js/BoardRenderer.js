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
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
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
        //Рисуем скруглённый прямоугольник
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.arcTo(x + w, y, x + w, y + h, r);
        this.ctx.arcTo(x + w, y + h, x, y + h, r);
        this.ctx.arcTo(x, y + h, x, y, r);
        this.ctx.arcTo(x, y, x + w, y, r);
        this.ctx.closePath();
    }
}
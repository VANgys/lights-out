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
        this.COLOR_OFF_HOVER = '#3a4266';
        this.COLOR_ON_HOVER = '#ffbe2c';

        // Параметры скругления и тени
        this.BORDER_RADIUS = 10;
        this.SHADOW_COLOR = 'rgba(255, 179, 11, 0.5)';
        this.SHADOW_BLUR = 14;
        
        // Текущая клетка под курсором (-1, -1, если ни одна не наведена)
        this.hoveredRow = -1;
        this.hoveredCol = -1;
        this.pressedRow = -1;
        this.pressedCol = -1;
    }

    // Очищает холст
    clear() 
    {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    // Метод для эффекта нажатия
    setPressed(r, c) 
    {
        this.pressedRow = r;
        this.pressedCol = c;
    }

    // Метод для установки наведенной клетки (вызывается из BoardInput)
    setHover(r, c) 
    {
        this.hoveredRow = r;
        this.hoveredCol = c;
    }


    // Главный метод отрисовки
    draw(grid, isGameOver) 
    {
        this.clear();

        for (let r = 0; r < this.SIZE; r++) 
        {
            for (let c = 0; c < this.SIZE; c++) 
            {
                const isOn = grid[r][c] === 1;
                // Вычисляем наведение и нажатие
                const isHovered = !isGameOver && r === this.hoveredRow && c === this.hoveredCol;
                const isPressed = !isGameOver && r === this.pressedRow && c === this.pressedCol;
                
                this.drawCell(r, c, isOn, isHovered, isPressed);
            }
        }
    }

    // Отрисовка одной клетки
    drawCell(r, c, isOn, isHovered, isPressed) 
    {
        let x = this.PADDING + c * (this.CELL + this.GAP);
        let y = this.PADDING + r * (this.CELL + this.GAP);
        let size = this.CELL;
        let offset = 0;

        // Эффект утопания
        if (isPressed) 
        {
            size = this.CELL * 0.92; // Уменьшаем на 8%
            offset = (this.CELL - size) / 2; // Центрируем
            x += offset;
            y += offset;
        }
        
        this.#roundRect(x, y, size, size, this.BORDER_RADIUS);
        
        let color;
        if (isOn)
            color = isHovered ? this.COLOR_ON_HOVER : this.COLOR_ON;
        else
            color = isHovered ? this.COLOR_OFF_HOVER : this.COLOR_OFF;
        
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        if (isOn) 
        {
            this.ctx.shadowColor = this.SHADOW_COLOR;
            this.ctx.shadowBlur = this.SHADOW_BLUR;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
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
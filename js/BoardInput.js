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

        // Вызываем метод для настройки событий
        this.#setupEvents();
    }

    // Обработка клика
    onCanvasClick(event) 
    {
        // Если игра завершена (победа на 15 уровне), клики игнорируются
        if (this.game.isGameOver)
            return;

        // Определяем, по какой клетке кликнули
        const cell = this.getCell(event.clientX, event.clientY);
        
        // Если клик был по клетке (а не в пустоту между ними)
        if (cell) 
        {
            // Передаем ход в игровую логику
            this.game.handleClick(cell.r, cell.c);
            
            // Сбрасываем состояние нажатия
            this.renderer.setPressed(-1, -1);
            
            // Просим рендерер перерисовать поле с новым состоянием
            this.renderer.draw(this.game.grid, this.game.isGameOver);
        }
    }

    // Обработка движения мыши
    onCanvasMouseMove(event) 
    {
        // Если игра завершена, эффект наведения не работает
        if (this.game.isGameOver) return;

        const cell = this.getCell(event.clientX, event.clientY);
        
        if (cell) 
            // Устанавливаем наведение на конкретную клетку
            this.renderer.setHover(cell.r, cell.c);
        else
            // Если курсор между клетками, сбрасываем наведение
            this.renderer.setHover(-1, -1); 
        
        // Перерисовываем поле, чтобы эффект отобразился
        this.renderer.draw(this.game.grid, this.game.isGameOver);
    }

    // Перевод координат курсора (пиксели) в индексы матрицы (строка, столбец)
    getCell(clientX, clientY) 
    {
        const rect = this.canvas.getBoundingClientRect();
        
        // Учитываем масштабирование
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        // Координаты мыши относительно самого холста
        const mouseX = (clientX - rect.left) * scaleX;
        const mouseY = (clientY - rect.top) * scaleY;

        for (let r = 0; r < this.SIZE; r++) 
        {
            for (let c = 0; c < this.SIZE; c++) 
            {
                // Вычисляем границы текущей клетки
                const x = this.PADDING + c * (this.CELL + this.GAP);
                const y = this.PADDING + r * (this.CELL + this.GAP);
                
                // Проверяем, попал ли клик в границы этой клетки
                if (mouseX >= x && mouseX <= x + this.CELL && mouseY >= y && mouseY <= y + this.CELL)
                    return { r, c };
            }
        }

        return null; // Если кликнули мимо клеток
    }

    // Обработка нажатия кнопки мыши (для эффекта утопания)
    onCanvasMouseDown(event) 
    {
        if (this.game.isGameOver) return;

        const cell = this.getCell(event.clientX, event.clientY);
        
        if (cell) 
        {
            // Включаем эффект нажатия на конкретной клетке
            this.renderer.setPressed(cell.r, cell.c);
            this.renderer.draw(this.game.grid, this.game.isGameOver);
        }
    }

    // Обработка отпускания кнопки мыши (сброс эффекта утопания)
    onCanvasMouseUp(event) 
    {
        if (this.game.isGameOver) return;

        // Всегда сбрасываем эффект нажатия
        this.renderer.setPressed(-1, -1);
        this.renderer.draw(this.game.grid, this.game.isGameOver);
    }

    // Обработка ухода курсора с поля (сброс всех эффектов)
    onCanvasMouseLeave(event) 
    {
        // Сбрасываем и наведение, и нажатие (на случай, если увели мышку с зажатой кнопкой)
        this.renderer.setHover(-1, -1);
        this.renderer.setPressed(-1, -1);
        
        // Перерисовываем
        this.renderer.draw(this.game.grid, this.game.isGameOver);
    }

    // Приватный метод для настройки всех слушателей событий
    #setupEvents() {
        // Привязываем контекст (this), чтобы методы знали о классе
        this.onCanvasClick = this.onCanvasClick.bind(this);
        this.onCanvasMouseMove = this.onCanvasMouseMove.bind(this);
        this.onCanvasMouseDown = this.onCanvasMouseDown.bind(this);
        this.onCanvasMouseUp = this.onCanvasMouseUp.bind(this);
        this.onCanvasMouseLeave = this.onCanvasMouseLeave.bind(this);

        // Подписываемся на события Canvas
        this.canvas.addEventListener('click', this.onCanvasClick);
        this.canvas.addEventListener('mousemove', this.onCanvasMouseMove);
        this.canvas.addEventListener('mousedown', this.onCanvasMouseDown);
        this.canvas.addEventListener('mouseup', this.onCanvasMouseUp);
        this.canvas.addEventListener('mouseleave', this.onCanvasMouseLeave);
    }
}
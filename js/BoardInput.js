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

    onCanvasClick(event) 
    {

    }

    onCanvasMouseMove(event) 
    {

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

    }

    // Обработка отпускания кнопки мыши (сброс эффекта утопания)
    onCanvasMouseUp(event) 
    {

    }

    // Обработка ухода курсора с поля (сброс всех эффектов)
    onCanvasMouseLeave(event) 
    {

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
import { CONFIG } from './config.js';

export class Game {
    constructor() {
        this.grid = [];
        this.moves = 0;
        this.level = 1;
        this.isGameOver = false;
    }

    // Обработка клика
    handleClick(r, c) 
    {
        if (this.isGameOver) 
            return;

        // Инверсия клеток
        this.toggle(r, c);
        
        // Увеличение счётчика ходов
        this.moves++;

        // Проверка победы
        if (this.checkWin()) 
        {
            if (this.level < CONFIG.MAX_LEVEL) 
            {
                this.level++;
                this.generateLevel(this.level); // Вызываем генерацию
            } 
            else
                this.isGameOver = true; // Победа на 15 уровне
        }
    }

    // Метод инверсии клетки и её соседей
    toggle(r, c) 
    {
        const dirs = [
            [0, 0],   // сама клетка
            [-1, 0],  // вверх
            [1, 0],   // вниз
            [0, -1],  // влево
            [0, 1]    // вправо
        ];

        for (let [dr, dc] of dirs) 
        {
            const nr = r + dr;
            const nc = c + dc;
            
            // Проверка на выход за границы поля 5x5
            if (nr >= 0 && nr < CONFIG.BOARD_SIZE && nc >= 0 && nc < CONFIG.BOARD_SIZE)
                // XOR-инверсия: 0 становится 1, 1 становится 0
                this.grid[nr][nc] = this.grid[nr][nc] === 0 ? 1 : 0;
        }
    }

    // Метод проверки победы
    checkWin() 
    {
        for (let r = 0; r < CONFIG.BOARD_SIZE; r++) 
        {
            for (let c = 0; c < CONFIG.BOARD_SIZE; c++) 
            {
                if (this.grid[r][c] === 1)
                    return false; // Есть включенная клетка
            }
        }

        return true; // Все выключены
    }

    // Метод генерации уровня
    generateLevel(n) 
    {
        this.moves = 0;
        
        // Создаем пустое поле
        this.grid = [];
        for (let r = 0; r < CONFIG.BOARD_SIZE; r++) 
            this.grid.push(new Array(CONFIG.BOARD_SIZE).fill(0));

        // Четыре эталонных минимальных решения (по 15 клеток)
        const templates = [
            // Исходный вариант
            [[0,1],[0,2],[0,4],[1,1],[1,2],[1,3],[2,2],[2,3],[2,4],[3,0],[3,1],[3,3],[3,4],[4,0],[4,1]],
            
            // Поворот на 90 градусов
            [[0,0],[0,1],[1,0],[1,1],[1,3],[1,4],[2,2],[2,3],[2,4],[3,1],[3,2],[3,3],[4,1],[4,2],[4,4]],
            
            // Поворот на 180 градусов
            [[0,3],[0,4],[1,0],[1,1],[1,3],[1,4],[2,0],[2,1],[2,2],[3,1],[3,2],[3,3],[4,0],[4,2],[4,3]],
            
            // Поворот на 270 градусов
            [[0,0],[0,2],[0,3],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[3,0],[3,1],[3,3],[3,4],[4,3],[4,4]]
        ];

        // Выбираем случайный эталонный набор
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

        // Перемешиваем его (алгоритм Фишера-Йетса для честного перемешивания)
        const shuffled = [...randomTemplate];
        for (let i = shuffled.length - 1; i > 0; i--) 
        {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Применяем первые N ходов к пустому полю
        for (let i = 0; i < n; i++) 
        {
            const [r, c] = shuffled[i];
            this.toggle(r, c);
        }
    }

    // Метод перезапуска игры
    restart() 
    {
        this.level = 1;
        this.isGameOver = false;
        this.generateLevel(this.level);
    }
}
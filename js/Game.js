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
            if (this.level < 15) 
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
            if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5)
                // XOR-инверсия: 0 становится 1, 1 становится 0
                this.grid[nr][nc] = this.grid[nr][nc] === 0 ? 1 : 0;
        }
    }

    // Метод проверки победы
    checkWin() 
    {
        for (let r = 0; r < 5; r++) 
        {
            for (let c = 0; c < 5; c++) 
            {
                if (this.grid[r][c] === 1)
                    return false; // Есть включенная клетка
            }
        }

        return true; // Все выключены
    }

    // Метод генерации уровня
    generateLevel(n) {

    }

    // Метод перезапуска игры
    restart() 
    {
        this.level = 1;
        this.isGameOver = false;
        this.generateLevel(this.level);
    }
}
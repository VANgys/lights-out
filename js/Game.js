export class Game {
    constructor(preset) 
    {
    if (!preset)
        throw new Error('Game: preset is required');

    this.boardSize = preset.size;
    this.maxLevel = preset.maxLevel;
    this.generator = preset.generator;

    this.grid = [];
    this.moves = 0;
    this.level = 1;
    this.isGameOver = false;

    this.listeners = [];
    }

    // регистрация колбэка
    subscribe(callback) {
        if (typeof callback !== 'function')
            throw new Error('subscribe: callback must be a function');
        this.listeners.push(callback);
    }

    // оповещение всех
    notify() {
        for (const fn of this.listeners) fn(this);
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
            if (this.level < this.maxLevel) 
            {
                this.level++;
                this.generateLevel(this.level); // Вызываем генерацию
            } 
            else
                this.isGameOver = true; // Победа на 15 уровне
        }

        // в самом конце сообщаем, что состояние изменилось
        this.notify();
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
            if (nr >= 0 && nr < this.boardSize && nc >= 0 && nc < this.boardSize)
                // XOR-инверсия: 0 становится 1, 1 становится 0
                this.grid[nr][nc] = this.grid[nr][nc] === 0 ? 1 : 0;
        }
    }

    // Метод проверки победы
    checkWin() 
    {
        for (let r = 0; r < this.boardSize; r++) 
        {
            for (let c = 0; c < this.boardSize; c++) 
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
        if (
            !Number.isInteger(n) ||
            n < 1 ||
            n > this.maxLevel ||
            n > this.boardSize ** 2
        )
            throw new Error(`Invalid level: ${n}`);

        this.moves = 0;

        // Создаём пустое поле нужного размера
        this.grid = Array.from(
            { length: this.boardSize },
            () => Array(this.boardSize).fill(0)
        );

        let selectedMoves;

        if (this.generator === 'template')
            selectedMoves = this.#generateFromTemplate(n);
        else if (this.generator === 'random')
            selectedMoves = this.#generateRandom(n);
        else
            throw new Error('Unknown generator');

        if (selectedMoves.length !== n)
            throw new Error('Generator returned incorrect number of moves');

        // Применяем выбранные ходы
        for (const [r, c] of selectedMoves)
            this.toggle(r, c);
    }

    #generateFromTemplate(n) 
    {
        if (n > 15) 
        throw new Error('Template contains only 15 moves');

        const templates = [
            [[0,1],[0,2],[0,4],[1,1],[1,2],
            [1,3],[2,2],[2,3],[2,4],[3,0],
            [3,1],[3,3],[3,4],[4,0],[4,1]],

            [[0,0],[0,1],[1,0],[1,1],[1,3],
            [1,4],[2,2],[2,3],[2,4],[3,1],
            [3,2],[3,3],[4,1],[4,2],[4,4]],

            [[0,3],[0,4],[1,0],[1,1],[1,3],
            [1,4],[2,0],[2,1],[2,2],[3,1],
            [3,2],[3,3],[4,0],[4,2],[4,3]],

            [[0,0],[0,2],[0,3],[1,1],[1,2],
            [1,3],[2,0],[2,1],[2,2],[3,0],
            [3,1],[3,3],[3,4],[4,3],[4,4]]
        ];

        const template =
            templates[Math.floor(Math.random() * templates.length)];

        return this.#shuffle([...template]).slice(0, n);
    }

    #generateRandom(n) 
    {
        const cells = [];

        for (let r = 0; r < this.boardSize; r++) 
        {
            for (let c = 0; c < this.boardSize; c++)
                cells.push([r, c]);
        }

        return this.#shuffle(cells).slice(0, n);
    }

    #shuffle(array) 
    {
        for (let i = array.length - 1; i > 0; i--) 
        {
            const j = Math.floor(Math.random() * (i + 1));

            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    // Метод перезапуска игры
    restart() 
    {
        this.level = 1;
        this.isGameOver = false;
        this.generateLevel(this.level);
        this.notify();
    }

    // Метод перезапуска текущего уровня
    restartLevel() 
    {
        this.isGameOver = false; 
        this.generateLevel(this.level); // Генерируем новый уровень той же сложности
        this.notify(); // Оповещаем HUD и Renderer об изменениях
    }

    //Меняет поле
    setPreset(preset) 
    {
        if (!preset ||
            !Number.isInteger(preset.size) ||
            !Number.isInteger(preset.maxLevel) ||
            preset.size < 1 ||
            preset.maxLevel < 1 ||
            preset.maxLevel > preset.size ** 2)
            throw new Error('Game: invalid preset');

        if (!['template', 'random'].includes(preset.generator))
            throw new Error('Game: unknown generator');

        if (preset.generator === 'template' && preset.size !== 5)
            throw new Error('Template generator supports only 5x5');

        this.boardSize = preset.size;
        this.maxLevel = preset.maxLevel;
        this.generator = preset.generator;

        this.restart();
    }
}
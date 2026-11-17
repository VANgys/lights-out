/**
 * test-runner.js - Минимальный фреймворк для модульных тестов в браузере.
 * Не требует Node.js, npm и интернета: достаточно открыть tests/index.html
 * через локальный сервер (ES-модули не работают по file://).
 *
 * API: describe(name, fn), it(name, fn), beforeEach(fn), expect(value).<matcher>
 */

const suites = [];
let currentSuite = null;

export function describe(name, fn) {
    const suite = { name, tests: [], beforeEach: [] };
    suites.push(suite);
    currentSuite = suite;
    fn();
    currentSuite = null;
}

export function it(name, fn) {
    if (!currentSuite) throw new Error('it() должен вызываться внутри describe()');
    currentSuite.tests.push({ name, fn });
}

export function beforeEach(fn) {
    if (!currentSuite) throw new Error('beforeEach() должен вызываться внутри describe()');
    currentSuite.beforeEach.push(fn);
}

// Форматирование значений для сообщений об ошибках
function fmt(value) {
    try { return JSON.stringify(value); } catch { return String(value); }
}

function fail(message) {
    throw new Error(message);
}

export function expect(actual) {
    return {
        toBe(expected) {
            if (!Object.is(actual, expected))
                fail(`Ожидалось ${fmt(expected)}, получено ${fmt(actual)}`);
        },
        toEqual(expected) {
            if (fmt(actual) !== fmt(expected))
                fail(`Ожидалось ${fmt(expected)}, получено ${fmt(actual)}`);
        },
        toBeTruthy() {
            if (!actual) fail(`Ожидалось истинное значение, получено ${fmt(actual)}`);
        },
        toBeFalsy() {
            if (actual) fail(`Ожидалось ложное значение, получено ${fmt(actual)}`);
        },
        toBeNull() {
            if (actual !== null) fail(`Ожидалось null, получено ${fmt(actual)}`);
        },
        toBeGreaterThan(n) {
            if (!(actual > n)) fail(`Ожидалось значение > ${n}, получено ${fmt(actual)}`);
        },
        toThrow() {
            let threw = false;
            try { actual(); } catch { threw = true; }
            if (!threw) fail('Ожидалось исключение, но функция выполнилась без ошибок');
        },
        not: {
            toThrow() {
                try { actual(); } catch (e) { fail(`Не ожидалось исключение, но получено: ${e.message}`); }
            },
            toBe(expected) {
                if (Object.is(actual, expected)) fail(`Ожидалось значение, отличное от ${fmt(expected)}`);
            },
        },
    };
}

// Запуск всех тестов и вывод результата на страницу
export function run(outputEl) {
    const results = { passed: 0, failed: 0, failures: [] };

    for (const suite of suites) {
        const section = document.createElement('section');
        const title = document.createElement('h2');
        title.textContent = suite.name;
        section.appendChild(title);

        for (const test of suite.tests) {
            const row = document.createElement('div');
            try {
                for (const hook of suite.beforeEach) hook();
                test.fn();
                results.passed++;
                row.className = 'pass';
                row.textContent = `✔ ${test.name}`;
            } catch (e) {
                results.failed++;
                results.failures.push(`${suite.name} → ${test.name}: ${e.message}`);
                row.className = 'fail';
                row.textContent = `✘ ${test.name} — ${e.message}`;
            }
            section.appendChild(row);
        }
        outputEl.appendChild(section);
    }

    const summary = document.getElementById('summary');
    summary.textContent = `Пройдено: ${results.passed}, провалено: ${results.failed}`;
    summary.className = results.failed === 0 ? 'pass' : 'fail';

    // Для автоматической проверки из консоли
    window.__testResults = results;
    return results;
}

import './index.html'
import './index.css'

let startTimer;
var counter = 40;
let time;

startGame(16, 16, 40)

const icons = {
    1: "<div class='num1'></div>",
    2: "<div class='num2'></div>",
    3: "<div class='num3'></div>",
    4: "<div class='num4'></div>",
    5: "<div class='num5'></div>",
    6: "<div class='num6'></div>",
    7: "<div class='num7'></div>",
    8: "<div class='num8'></div>",
    9: "<div class='flag'></div>",
    10: "<div class='question'></div>",
}

const counterPics = {
    0: "<div class='count0'></div>",
    1: "<div class='count1'></div>",
    2: "<div class='count2'></div>",
    3: "<div class='count3'></div>",
    4: "<div class='count4'></div>",
    5: "<div class='count5'></div>",
    6: "<div class='count6'></div>",
    7: "<div class='count7'></div>",
    8: "<div class='count8'></div>",
    9: "<div class='count9'></div>",
}

document.getElementById("start").onclick = () => {
    const counterPic = document.querySelector('.counter');
    const timer = document.querySelector('.timer');
    timer.innerHTML = '<div class="count0"></div><div class="count0"></div><div class="count0"></div>'
    counterPic.innerHTML = '<div class=\'count4\'></div><div class=\'count0\'></div>';
    startGame(16, 16, 40);
}

function startGame(WIDTH, HEIGHT, BOMBS_NUM) {
    let lose = false;
    var startGameFlag = false;
    startTimer = false;
    let timerId = setInterval(updateTimer,1000)
    counter = 40;
    time = 1;
    let bombs = [];
    const cellsCount = WIDTH * HEIGHT;
    let closeCount = cellsCount;
    let all = [...Array(WIDTH * HEIGHT).keys()];
    const field = document.querySelector('.field');
    const start = document.querySelector('.start');
    const counterPic = document.querySelector('.counter');
    const timer = document.querySelector('.timer');
    field.innerHTML = '<button class="cell"></button>'.repeat(cellsCount)
    const cells = [...field.children];
    bombs = [...Array(cellsCount).keys()]
        .sort(() => Math.random() - 0.5)
        .slice(0, BOMBS_NUM);
    start.classList.remove('win');
    start.classList.remove('lose');
    cells.forEach(element => element.addEventListener('mousedown', (event) => {
        if (event.button === 0) {
            start.classList.add('scared');
        }
    }))

    cells.forEach(element => element.addEventListener('mouseup', (event) => {
        if (event.button === 0) {
            start.classList.remove('scared');
        }
    }))

    cells.forEach(element => element.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (element.innerHTML === ``) {
            element.innerHTML = icons[9];
            if (counter) {
                counter -= 1
            }
            updateNum()
        } else if (element.innerHTML.length === icons[9].length) {
            element.innerHTML = icons[10];
        } else {
            element.innerHTML = ``;
            counter += 1;
        }
        updateNum()

    }))
    field.addEventListener('click', (event) => {
        if (event.target.tagName !== 'BUTTON') {
            return;
        }
        startTimer = true;
        const index = cells.indexOf(event.target);
        const column = index % WIDTH;
        const row = Math.floor(index / WIDTH);
        open(row, column)
        if (!startGameFlag) {
            startGameFlag = true;
        }
    });

    start.addEventListener('click', (event) => {clearInterval(timerId);})

    function updateNum() {
        if (counter > 9) {
            counterPic.innerHTML = `${counterPics[Math.floor(counter / 10)]}${counterPics[counter % 10]}`
        } else {
            counterPic.innerHTML = `${counterPics[0]} ${counterPics[counter]}`
        }
    }

    function updateTimer() {
        if (startTimer) {
            if (time > 99) {
                timer.innerHTML = `${counterPics[Math.floor(time / 100)]}${counterPics[Math.floor(time / 10 % 10)]}${counterPics[time % 10]}`
            } else if (time > 9) {
                timer.innerHTML = `<div class='count0'></div>${counterPics[Math.floor(time / 10)]}${counterPics[time % 10]}`
            } else {
                timer.innerHTML = `<div class='count0'></div><div class='count0'></div>${counterPics[time]}`
            }
            time++;
        }
    }

    function isValid(row, column) {
        return row >= 0
            && row < HEIGHT
            && column >= 0
            && column < WIDTH;
    }

    function open(row, column) {
        let count = 0;
        if (!isValid(row, column)) return;

        const index = row * WIDTH + column;
        let cell = cells[index];

        if (cell.disabled === true) return;

        cell.disabled = true;


        if (isBomb(row, column) && startGameFlag) {
            lose = true;
            start.classList.add('lose');
            clearInterval(timerId)
            bombs.forEach(element => {
                let cell_bomb = cells[element];
                if (cell_bomb.innerHTML === `<div class="flag"></div>`) {
                    cell_bomb.disabled = true;
                    cell_bomb.innerHTML = '<div class="flag_bomb"></div>';
                }else {
                    cell_bomb.disabled = true;
                    cell_bomb.innerHTML = '<div class="bomb"></div>';
                }
            })
            cell.innerHTML = '<div class="lose-bomb"></div>'
            all.forEach(element => {
                if (!bombs.includes(cells[element]) && cells[element].disabled !== true) {
                    cells[element].innerHTML = '<div class="cell_lose"></div>'
                    cells[element].disabled = true;
                }
            })
            cells.forEach(element => {
                if (element.innerHTML === '<div class="flag"></div>') {
                    element.innerHTML = '<div class="cell_lose"></div>'

                }
            })
            return;
        } else if (isBomb(row, column)) {
            count -= 1;
            bombs.splice(index, 1);
            let diff = all.filter(x => !bombs.includes(x));
            bombs.push(diff[Math.floor(Math.random() * diff.length)]);
        }

        closeCount--;
        if (closeCount <= BOMBS_NUM && !lose) {
            clearInterval(timerId)
            start.classList.add('win');
            bombs.forEach(element => {
                let cell_bomb = cells[element];
                if (cell_bomb.innerHTML === `<div class="flag"></div>`) {
                    cell_bomb.disabled = true;
                    cell_bomb.innerHTML = '<div class="flag_bomb"></div>';
                }else {
                    cell_bomb.disabled = true;
                    cell_bomb.innerHTML = '<div class="bomb"></div>';
                }
            })

        }

        count += getMinesCount(row, column);

        if (count !== 0) {
            cell.innerHTML = icons[count];
            return;
        }

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                open(row + y, column + x);
            }
        }
    }

    function getMinesCount(row, column) {
        let count = 0;
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (isBomb(row + y, column + x)) {
                    count++;
                }
            }
        }
        return count;
    }

    function isBomb(row, column) {
        if (!isValid(row, column)) return false;
        const index = row * WIDTH + column;
        return bombs.includes(index)
    }
}

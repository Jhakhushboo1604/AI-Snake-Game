const board = document.querySelector('.box');
const cellheight = 30;
const cellwidth = 30;

const startbutton = document.querySelector('.btn-start');
const modal = document.querySelector('.modal');
const startgamemodal = document.querySelector('.startgame');  // ✅ class name fix
const gameover = document.querySelector('.gameover');
const restartbutton = document.querySelector('.btn-restart');

// =============================
// SCORE / TIME ELEMENTS
// =============================

// TOP wale (pehle span)
const scoreDisplay = document.querySelectorAll("#Score")[0];
const highScoreDisplay = document.querySelectorAll("#HighScore")[0];
const timeDisplay = document.querySelectorAll("#Time")[0];

// DASHBOARD wale (dusra span)
const HighScoredashboard = document.querySelectorAll("#HighScore")[1];
const Scoredashboard = document.querySelectorAll("#Score")[1];
const timedashboard = document.querySelectorAll("#Time")[1];

// LAST SCORE / LAST TIME variables
let lastScore = 0;
let lastTime = "00:00";

// Dashboard ke andar Last Score / Last Time ke display element JS se inject kar rahe hain
const dashboard = document.querySelector(".dashboard");
let lastScoreDisplay = null;
let lastTimeDisplay = null;

if (dashboard) {
    dashboard.insertAdjacentHTML(
        "beforeend",
        `
        <h2>Last Score : <span id="LastScore">00</span></h2>
        <h2>Last Time : <span id="LastTime">00:00</span></h2>
        `
    );

    lastScoreDisplay = document.getElementById("LastScore");
    lastTimeDisplay = document.getElementById("LastTime");
}

// =============================
// AI AGENT (sirf add kiya, kuch hata nahi)
// =============================

let agentMessageElement = null;

if (dashboard) {
    const agentBox = document.createElement('div');
    agentBox.classList.add('ai-agent');

    const agentTitle = document.createElement('h2');
    agentTitle.textContent = 'AI Agent';

    agentMessageElement = document.createElement('p');
    agentMessageElement.id = 'AgentMessage';
    agentMessageElement.textContent = 'Welcome! Start Game daba ke shuru karo. 🐍';

    agentBox.appendChild(agentTitle);
    agentBox.appendChild(agentMessageElement);
    dashboard.appendChild(agentBox);
}

function setAgentMessage(message) {
    if (agentMessageElement) {
        agentMessageElement.textContent = message;
    }
}

function getRandomMessage(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// =============================

let score = 0;
let highScore = parseInt(localStorage.getItem("snakeHighScore")) || 0;

// initial high score / score / time dikhao (top + dashboard)
highScoreDisplay.innerText = highScore.toString().padStart(2, "0");
scoreDisplay.innerText = score.toString().padStart(2, "0");
timeDisplay.innerText = "00:00";

if (HighScoredashboard) {
    HighScoredashboard.innerText = highScore.toString().padStart(2, "0");
}
if (Scoredashboard) {
    Scoredashboard.innerText = score.toString().padStart(2, "0");
}
if (timedashboard) {
    timedashboard.innerText = "00:00";
}

let speed = 300; // starting speed (ms)

const block = [];
let snake = [{ x: 5, y: 3 }];

let direction = "right";

const rows = 30;
const cols = 30;

let intervalid = null;
let food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols)
};

let seconds = 0;
let minutes = 0;
let timeInterval = null;

// ⭐ GRID BANANA
for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        const blocks = document.createElement('div');
        blocks.classList.add('blocks');
        board.appendChild(blocks);
        block[`${i}-${j}`] = blocks;
    }
}

function startTimer() {
    clearInterval(timeInterval);
    timeInterval = setInterval(() => {
        seconds++;

        if (seconds === 60) {
            minutes++;
            seconds = 0;
        }

        const m = minutes < 10 ? "0" + minutes : minutes;
        const s = seconds < 10 ? "0" + seconds : seconds;

        const currentTime = `${m}:${s}`;

        // top time
        timeDisplay.innerText = currentTime;

        // dashboard current time
        if (timedashboard) {
            timedashboard.innerText = currentTime;
        }

        // lastTime ko latest running time me rakhte rahenge (game over pe use hoga)
        lastTime = currentTime;
    }, 1000);
}

function stopTimer() {
    clearInterval(timeInterval);
}

function resetTimer() {
    seconds = 0;
    minutes = 0;
    timeDisplay.innerText = "00:00";
    if (timedashboard) {
        timedashboard.innerText = "00:00";
    }
}

// ⭐ HELPER: FOOD KO BOARD PE DIKHANA
function drawFood() {
    const foodCell = block[`${food.x}-${food.y}`];
    if (foodCell) {
        foodCell.classList.add("food");
    }
}

// ⭐ GAME OVER HANDLER (score/time store + modal)
function handleGameOver() {
    clearInterval(intervalid);
    stopTimer();

    // last score / time store karo dashboard pe
    lastScore = score;

    if (lastScoreDisplay) {
        lastScoreDisplay.innerText = lastScore.toString().padStart(2, "0");
    }
    if (lastTimeDisplay) {
        lastTimeDisplay.innerText = lastTime;
    }

    if (score === 0) {
        setAgentMessage("Game over! Koi nahi, warmup tha ye 😅");
    } else {
        setAgentMessage(`Game over! Final score: ${score}. Next time high score tod dena 💪`);
    }

    modal.style.display = "flex";
    startgamemodal.style.display = "none";
    gameover.style.display = "flex";
}

// ⭐ MAIN GAME LOOP
function drawsnake() {
    // pehle food dikhado (agar class hat gayi ho to)
    drawFood();

    let head = null;

    if (direction === "left") {
        head = { x: snake[0].x, y: snake[0].y - 1 };
    } else if (direction === "right") {
        head = { x: snake[0].x, y: snake[0].y + 1 };
    } else if (direction === "down") {
        head = { x: snake[0].x + 1, y: snake[0].y };
    } else if (direction === "up") {
        head = { x: snake[0].x - 1, y: snake[0].y };
    }

    // 🛑 boundary check
    if (!head || head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        handleGameOver();
        return;
    }

    const hitBody = snake.some(segment => segment.x === head.x && segment.y === head.y);
    if (hitBody) {
        handleGameOver();
        return;
    }

    // ⭐ pehle purana snake clear karo
    snake.forEach(segment => {
        const cell = block[`${segment.x}-${segment.y}`];
        if (cell) {
            cell.classList.remove("fill");
        }
    });

    // ⭐ check: food kha liya kya?
    const ateFood = (head.x === food.x && head.y === food.y);

    // naya head lagao
    snake.unshift(head);

    if (ateFood) {
        // ⭐ SCORE BADHAO
        score += 10;   // jitna chaho utna rakh sakte ho (1, 5, 10...)
        scoreDisplay.innerText = score.toString().padStart(2, "0");

        if (Scoredashboard) {
            Scoredashboard.innerText = score.toString().padStart(2, "0");
        }

        // AI agent – food eat message
        const eatMessages = [
            "Yum! Snake ne snack kha liya 🐍🍎",
            "Nice move! Score badh gaya 😎",
            "Good job! Aise hi focus rakho 💪",
            "Op bhai, lagatar khaana kha rahe ho 😼"
        ];
        setAgentMessage(getRandomMessage(eatMessages));

        if (score > highScore) {
            highScore = score;
            highScoreDisplay.innerText = highScore.toString().padStart(2, "0");
            if (HighScoredashboard) {
                HighScoredashboard.innerText = highScore.toString().padStart(2, "0");
            }
            localStorage.setItem("snakeHighScore", highScore);

            const highMessages = [
                "New HIGH SCORE! 🔥",
                "Record tod diya! Legend 😎",
                "Kya gameplay hai, OP high score! 🏆"
            ];
            setAgentMessage(getRandomMessage(highMessages));
        }

        let newSpeed = speed;

        if (score >= 0 && score < 100) {
            newSpeed = 250;
        } else if (score >= 100 && score < 150) {
            newSpeed = 200;
        } else if (score >= 150 && score < 200) {
            newSpeed = 150;
        } else {
            newSpeed = 100;
        }

        // Agar speed change hui hai to interval restart karo
        if (newSpeed !== speed) {
            speed = newSpeed;

            const speedMessages = [
                "Level up! Game ab aur tez ho gaya ⚡",
                "Ab dhyaan se, speed high hai 😈",
                "Real challenge ab start hua hai 🚀"
            ];
            setAgentMessage(getRandomMessage(speedMessages));

            startGame();  // ✅ naya interval nayi speed ke sath
        }

        // purane food ka class hatao
        const oldFoodCell = block[`${food.x}-${food.y}`];
        if (oldFoodCell) oldFoodCell.classList.remove("food");

        // naya food generate karo
        food = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols)
        };

        // naya food draw karo
        drawFood();
        // tail ko pop mat karo → snake grow ho jayega
    } else {
        // normal move: tail hatao
        snake.pop();
    }

    // ⭐ ab naya snake draw karo
    snake.forEach(segment => {
        const cell = block[`${segment.x}-${segment.y}`];
        if (cell) {
            cell.classList.add("fill");
        }
    });
}

// ⭐ GAME START KARNE KA FUNCTION
function startGame() {
    if (intervalid) {
        clearInterval(intervalid);
    }
    intervalid = setInterval(drawsnake, speed);  // ✅ ab speed se control hoga
}

// ⭐ GAME RESET (restart pe use hoga)
function resetGame() {
    if (intervalid) {
        clearInterval(intervalid);
    }

    stopTimer();
    resetTimer();

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = block[`${i}-${j}`];
            if (cell) {
                cell.classList.remove("fill", "food");
            }
        }
    }

    // snake reset
    snake = [{ x: 5, y: 3 }];
    direction = "right";

    // ⭐ SCORE RESET (lastScore ko nahi chhed rahe)
    score = 0;
    scoreDisplay.innerText = score.toString().padStart(2, "0");
    if (Scoredashboard) {
        Scoredashboard.innerText = score.toString().padStart(2, "0");
    }

    // food reset
    food = {
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols)
    };

    modal.style.display = "none";
    gameover.style.display = "none";
    startgamemodal.style.display = "none";

    setAgentMessage("New game start ho gaya! Arrow keys se control karo 🕹️");

    startGame();
    startTimer();
}

// ⭐ START BUTTON
startbutton.addEventListener("click", () => {
    modal.style.display = "none";   // welcome modal hatao
    startgamemodal.style.display = "none";
    gameover.style.display = "none";
    setAgentMessage("Ready? Chalo, game start ho raha hai 😼");
    resetGame();                    // reset+start
});

// ⭐ RESTART BUTTON
restartbutton.addEventListener("click", () => {
    setAgentMessage("Restart ho gaya, is baar high score tod do 💪");
    resetGame();
});

// ⭐ KEY CONTROLS
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && direction !== "right") {
        direction = "left";
    } else if (event.key === "ArrowRight" && direction !== "left") {
        direction = "right";
    } else if (event.key === "ArrowUp" && direction !== "down") {
        direction = "up";
    } else if (event.key === "ArrowDown" && direction !== "up") {
        direction = "down";
    }
});

// ================= MOBILE CONTROLS =================

const btnUp = document.querySelector(".btn-up");
const btnDown = document.querySelector(".btn-down");
const btnLeft = document.querySelector(".btn-left");
const btnRight = document.querySelector(".btn-right");

if (btnUp) {
    btnUp.addEventListener("click", () => {
        if (direction !== "down") direction = "up";
    });
}
if (btnDown) {
    btnDown.addEventListener("click", () => {
        if (direction !== "up") direction = "down";
    });
}
if (btnLeft) {
    btnLeft.addEventListener("click", () => {
        if (direction !== "right") direction = "left";
    });
}
if (btnRight) {
    btnRight.addEventListener("click", () => {
        if (direction !== "left") direction = "right";
    });
}

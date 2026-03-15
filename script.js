const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const playerScoreText = document.getElementById("playerScore");
const opponentScoreText = document.getElementById("opponentScore");

const modeSelect = document.getElementById("mode");
const levelSelect = document.getElementById("level");
const soundToggle = document.getElementById("soundToggle");
const effectsToggle = document.getElementById("effectsToggle");
const applySettingsBtn = document.getElementById("applySettings");

const soundMove = document.getElementById("soundMove");
const soundWin = document.getElementById("soundWin");
const soundDraw = document.getElementById("soundDraw");

let board = ["", "", "", "", "", "", "", "", ""];
let player = "X";
let opponent = "O";
let currentPlayer = "X";
let gameActive = false;
let playerScore = 0;
let opponentScore = 0;
let mode = "computer";
let level = "easy";
let soundOn = true;
let effectsOn = true;

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];


const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach(btn=>{
    btn.addEventListener("click", ()=>{
        tabBtns.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        tabContents.forEach(c=>c.classList.remove("active"));
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});


function playSound(sound){
    if(soundOn && sound && typeof sound.play === "function"){
        sound.currentTime = 0;
        sound.play().catch(e=>console.log("Ошибка воспроизведения звука:", e));
    }
}


applySettingsBtn.addEventListener("click", ()=>{
    mode = modeSelect.value;
    level = levelSelect.value;
    soundOn = soundToggle.checked;
    effectsOn = effectsToggle.checked;
    startGame();
    alert("Настройки применены!");
});


cells.forEach(cell=>cell.addEventListener("click", cellClick));
restartBtn.addEventListener("click", startGame);


function startGame(){
    board = ["", "", "", "", "", "", "", "", ""];
    cells.forEach(cell=>{
        cell.textContent = "";
        if(effectsOn){
            cell.classList.remove("X","O");
        }
    });
    gameActive = true;
    currentPlayer = "X";
    statusText.textContent = (mode === "friend") ? "Ход: Игрок 1" : "Ход: Игрок";
}


function cellClick(){
    const index = this.dataset.index;
    if(board[index] !== "" || !gameActive) return;

    makeMove(index, currentPlayer);
    playSound(soundMove);

    if(checkEnd()) return;

    if(mode === "computer"){
        currentPlayer = opponent;
        setTimeout(aiMove, 300);
    } else if(mode === "friend"){
      
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.textContent = currentPlayer === "X" ? "Ход: Игрок 1" : "Ход: Игрок 2";
    }
}


function makeMove(index, symbol){
    board[index] = symbol;
    cells[index].textContent = symbol;
    if(effectsOn) cells[index].classList.add(symbol);
}


function checkEnd(){
    for(let pattern of winPatterns){
        let [a,b,c] = pattern;
        if(board[a] !== "" && board[a] === board[b] && board[a] === board[c]){
            gameActive = false;
            if(board[a] === player){
                statusText.textContent = mode === "friend" ? "Игрок 1 победил!" : "Ты победил!";
                playerScore++;
                playerScoreText.textContent = playerScore;
                playSound(soundWin);
            } else {
                statusText.textContent = mode === "friend" ? "Игрок 2 победил!" : "Противник победил!";
                opponentScore++;
                opponentScoreText.textContent = opponentScore;
                playSound(soundWin);
            }
            return true;
        }
    }
    if(!board.includes("")){
        gameActive = false;
        statusText.textContent = "Ничья";
        playSound(soundDraw);
        return true;
    }
    return false;
}


function aiMove(){
    if(!gameActive || mode !== "computer") return;

    let index;
    switch(level){
        case "easy": index = randomMove(); break;
        case "medium": index = mediumMove(); break;
        case "hard": index = minimax(board, opponent).index; break;
    }
    makeMove(index, opponent);
    playSound(soundMove);
    currentPlayer = player;
    statusText.textContent = "Ход: Игрок";
    checkEnd();
}


function randomMove(){
    let empty = board.map((v,i)=>v===""?i:null).filter(v=>v!==null);
    return empty[Math.floor(Math.random()*empty.length)];
}


function mediumMove(){
    for(let pattern of winPatterns){
        let [a,b,c] = pattern;

        if(board[a]==opponent && board[b]==opponent && board[c]=="") return c;
        if(board[a]==opponent && board[c]==opponent && board[b]=="") return b;
        if(board[b]==opponent && board[c]==opponent && board[a]=="") return a;

        if(board[a]==player && board[b]==player && board[c]=="") return c;
        if(board[a]==player && board[c]==player && board[b]=="") return b;
        if(board[b]==player && board[c]==player && board[a]=="") return a;
    }
    return randomMove();
}


function minimax(newBoard, current){
    let empty = newBoard.map((v,i)=>v===""?i:null).filter(v=>v!==null);
    if(checkWin(newBoard, player)) return {score: -10};
    if(checkWin(newBoard, opponent)) return {score: 10};
    if(empty.length===0) return {score:0};

    let moves = [];
    for(let i of empty){
        let move = {};
        move.index = i;
        newBoard[i] = current;
        let result = current === opponent ? minimax(newBoard, player) : minimax(newBoard, opponent);
        move.score = result.score;
        newBoard[i] = "";
        moves.push(move);
    }

    let bestMove;
    if(current === opponent){
        let bestScore = -10000;
        for(let i=0;i<moves.length;i++){
            if(moves[i].score > bestScore){ bestScore = moves[i].score; bestMove = i; }
        }
    } else {
        let bestScore = 10000;
        for(let i=0;i<moves.length;i++){
            if(moves[i].score < bestScore){ bestMove = i; }
        }
    }
    return moves[bestMove];
}

function checkWin(b,p){
    for(let pattern of winPatterns){
        let [a,b1,c] = pattern;
        if(b[a]===p && b[b1]===p && b[c]===p) return true;
    }
    return false;
}


startGame();
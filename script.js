const simonButtons = document.querySelectorAll('.simon-button');
const scoreDisplay = document.getElementById('score');
const startHint = document.getElementById('start-hint');
const gameOverText = document.getElementById('game-over');
const targetPointsInput = document.getElementById('target-points');
const successMessage = document.getElementById('success-message');
let sequence = [];
let playerSequence = [];
let score = 0;
let highscore = 0;
let isPlaying = false;
let canStart = true;

const sounds = {
    'ArrowUp': new Audio('sounds/green.wav'),
    'ArrowRight': new Audio('sounds/blue.wav'),
    'ArrowLeft': new Audio('sounds/yellow.wav'),
    'ArrowDown': new Audio('sounds/red.wav')
};

const keys = ['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'];

function playSound(key) {
    if (sounds[key]) {
        sounds[key].currentTime = 0;
        sounds[key].play().catch(error => console.error('Audio playback failed:', error));
    }
}

function flashButton(button) {
    button.classList.add('active');
    setTimeout(() => button.classList.remove('active'), 500);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function addColorToSequence() {
    const shuffledKeys = shuffleArray([...keys]);
    const randomKey = shuffledKeys[0];
    sequence.push(randomKey);
    setTimeout(() => playSequence(), 1000);
}

function playSequence() {
    isPlaying = true;
    let delay = 0;
    sequence.forEach((key, index) => {
        setTimeout(() => {
            const button = document.querySelector(`[data-key="${key}"]`);
            flashButton(button);
            playSound(key);
            if (index === sequence.length - 1) {
                isPlaying = false;
            }
        }, delay);
        delay += 1000;
    });
    playerSequence = [];
}

function handlePlayerInput(key) {
    if (isPlaying) return;
    
    const button = document.querySelector(`[data-key="${key}"]`);
    if (!button) return;

    playSound(key);
    flashButton(button);
    playerSequence.push(key);

    const currentStep = playerSequence.length - 1;
    if (playerSequence[currentStep] !== sequence[currentStep]) {
        endGame();
        return;
    }

    if (playerSequence.length === sequence.length) {
        score++;
        updateScore();
        if (score >= parseInt(targetPointsInput.value)) {
            showSuccessMessage();
        } else {
            setTimeout(() => addColorToSequence(), 1000);
        }
    }
}

function updateScore() {
    scoreDisplay.textContent = `Punkte: ${score} | Rekord: ${highscore}`;
}

function endGame() {
    gameOverText.textContent = `Leider falsch. Du hast ${score} Punkte geschafft.`;
    gameOverText.classList.remove('hidden');
    gameOverText.classList.add('blink');
    if (score > highscore) {
        highscore = score;
    }
    score = 0;
    sequence = [];
    updateScore();
    canStart = true;
    startHint.textContent = 'Drücke die Leertaste zum Neustarten';
}

function showSuccessMessage() {
    if (score > highscore) {
        highscore = score;
    }
    updateScore();
    successMessage.classList.remove('hidden');
    successMessage.classList.add('blink');
    canStart = true;
    startHint.textContent = 'Drücke die Leertaste für ein neues Spiel';
}

function hideMessages() {
    successMessage.classList.add('hidden');
    successMessage.classList.remove('blink');
    gameOverText.classList.add('hidden');
    gameOverText.classList.remove('blink');
}

function startGame() {
    if (!canStart) return;
    canStart = false;
    score = 0;
    sequence = [];
    updateScore();
    startHint.textContent = 'Spiel läuft...';
    hideMessages();
    addColorToSequence();
    document.activeElement.blur();
}

function abortGame() {
    if (!isPlaying && !canStart) {
        score = 0;
        sequence = [];
        updateScore();
        canStart = true;
        startHint.textContent = 'Drücke die Leertaste zum Neustarten';
    }
}

simonButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!isPlaying) {
            handlePlayerInput(button.dataset.key);
        }
    });
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && canStart) {
        startGame();
    } else if (event.code === 'Escape') {
        abortGame();
    } else if (!isPlaying && keys.includes(event.code)) {
        handlePlayerInput(event.code);
    }
});

targetPointsInput.addEventListener('change', () => {
    if (parseInt(targetPointsInput.value) < 1) {
        targetPointsInput.value = 1;
    }
});

updateScore();

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
let isFreestyleMode = false;
const targetScoreDiv = document.getElementById('target-score');

const sounds = {
    'ArrowUp': new Audio('sounds/green.wav'),
    'ArrowRight': new Audio('sounds/blue.wav'),
    'ArrowLeft': new Audio('sounds/yellow.wav'),
    'ArrowDown': new Audio('sounds/red.wav')
};

const keys = ['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'];

// Tracking für gedrückte Tasten
const pressedKeys = new Set();

// Ändere den Default-Wert für targetPoints
let targetPoints = 20;

// Setze auch den Default-Wert im HTML Input-Feld
document.getElementById('target-points').value = 20;

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

function checkSequence() {
    if (playerSequence[currentStep] !== sequence[currentStep]) {
        gameOver();
        return;
    }

    if (currentStep !== sequence.length - 1) {
        currentStep++;
        return;
    }

    score++;
    updateScore();

    if (isFreestyleMode) {
        nextRound();
        return;
    }

    if (score >= targetPoints) {
        successMessage.classList.remove('hidden');
        isPlaying = false;
    } else {
        nextRound();
    }
}

simonButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!isPlaying) {
            handlePlayerInput(button.dataset.key);
        }
    });
});

document.addEventListener('keydown', (e) => {
    // Ignoriere bereits gedrückte Tasten
    if (pressedKeys.has(e.key)) return;
    pressedKeys.add(e.key);

    console.log('Key pressed:', e.key);
    
    if (e.key.toLowerCase() === 'f') {
        console.log('F key detected, current freestyle mode:', isFreestyleMode);
        isFreestyleMode = !isFreestyleMode;
        targetScoreDiv.style.display = isFreestyleMode ? 'none' : 'block';
        targetPoints = isFreestyleMode ? Number.MAX_SAFE_INTEGER : 
            parseInt(document.getElementById('target-points').value);
        successMessage.classList.add('hidden');
        updateScore();
        console.log('Freestyle mode switched to:', isFreestyleMode);
    } else if (e.code === 'Space' && canStart) {
        startGame();
    } else if (e.code === 'Escape') {
        abortGame();
    } else if (!isPlaying && keys.includes(e.code)) {
        handlePlayerInput(e.code);
    }
});

document.addEventListener('keyup', (e) => {
    pressedKeys.delete(e.key);
});

targetPointsInput.addEventListener('change', () => {
    if (parseInt(targetPointsInput.value) < 1) {
        targetPointsInput.value = 1;
    }
});

// Verbesserte Random-Funktion für gleichmäßigere Verteilung
function getNextButton() {
    // Tracking der letzten Buttons für bessere Verteilung
    if (!getNextButton.history) {
        getNextButton.history = [];
    }
    
    const buttons = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
    let nextButton;
    
    // Versuche bis zu 3 mal, einen Button zu finden, der nicht zu oft vorkam
    for (let i = 0; i < 3; i++) {
        nextButton = buttons[Math.floor(Math.random() * buttons.length)];
        
        // Prüfe die letzten 4 Buttons
        const recentOccurrences = getNextButton.history
            .slice(-4)
            .filter(b => b === nextButton).length;
            
        // Wenn Button nicht zu oft vorkam, verwende ihn
        if (recentOccurrences < 2) break;
    }
    
    // Aktualisiere History
    getNextButton.history.push(nextButton);
    if (getNextButton.history.length > 8) {
        getNextButton.history.shift();
    }
    
    return nextButton;
}

updateScore();

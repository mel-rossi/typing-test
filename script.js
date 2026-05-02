const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
const originText = document.querySelector("#origin-text p").innerHTML;
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");

// Variable Declarations and Initializations
let timerInterval = null;
let elapsedMs = 0;
let startTime = null;
let testRunning = false;
let testComplete = false;

// Display any existing scores on page load
displayScores();

// Add leading zero to numbers 9 or below (purely for aesthetics)
function leadingZero(n) { 

    return (n <= 9) ? "0" + n : n;
}

// Format the time (minutes, seconds, and hundredths of a second)
function formatTime(ms) { 
    
    let totalSeconds = Math.floor(ms / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    let hundredths = Math.floor((ms % 1000) / 10);
    
    return `${leadingZero(minutes)}:${leadingZero(seconds)}:${leadingZero(hundredths)}`;
}

// Run a standard minute/second/hundredths timer:
function runTimer() { 

    timerInterval = setInterval(() => { 
        elapsedMs = Date.now() - startTime;
        theTimer.innerHTML = formatTime(elapsedMs);
    }, 10);
}

// Match the text entered with the provided text on the page:
function checkInput() { 

    if (testArea.value === originText) { 
        // Successfully completed test

        testWrapper.style.borderColor = "green"; // Green border
        testComplete = true; // Mark the test as complete
        testArea.disabled = true; // Disable further input
        stopTimer(); // Stop timer 
        saveScore(elapsedMs); // Save score to localStorage
        
        return; 
    }

    if (originText.startsWith(testArea.value)) { 
        // Typing & matching text correctly
        testWrapper.style.borderColor = "blue"; // Blue border
    } else { 
        // Typo detected - text does not match
        testWrapper.style.borderColor = "red"; // Red border
    }
}

// Start the timer:
function startTimer() { 

    if (!testRunning && !testComplete) { 
        testRunning = true; 
        startTime = Date.now();
        runTimer();
    }
}

// Stop the timer: 
function stopTimer() { 

    clearInterval(timerInterval);
    timerInterval = null;
    testRunning = false;

    return elapsedMs;
}


// Reset everything
function resetTest() { 

    // Stop the timer if it's running
    if (testRunning) { 
        stopTimer();
    }
    
    // Reset variables and UI elements
    elapsedMs = 0;
    theTimer.innerHTML = "00:00:00";
    testArea.value = "";
    testWrapper.style.borderColor = "grey";
    
    testComplete = false;
    testArea.disabled = false;
    
}

// Save score to localStorage (Top 3 Scores)
function saveScore(ms) { 
    // Existing scores
    let scores = JSON.parse(localStorage.getItem("typingScores")) || [];

    scores.push(ms); // Add new score
    scores.sort((a, b) => a - b); // Sort in ascending order (faster > slower)
    scores = scores.slice(0, 3); // Top 3 scores only

    localStorage.setItem("typingScores", JSON.stringify(scores)); // Save back to localStorage
    displayScores(); // Update displayed scores
}

// Display scores 
function displayScores() {
    let scores = JSON.parse(localStorage.getItem("typingScores")) || [];
    const scoreList = document.querySelector("#score-list");

    scoreList.innerHTML = ""; // Clear existing scores

    scores.forEach((ms, i) => {
        const li = document.createElement("li");
        li.innerHTML = formatTime(ms);
        scoreList.appendChild(li);
    });
}


// Event listeners for keyboard input and the reset button

// Start the timer when the user starts typing 
testArea.addEventListener("keydown", startTimer); 

// Check the input after every keystroke to see if it matches the original text
testArea.addEventListener("input", checkInput); 

// Reset the test when the reset button is clicked
resetButton.addEventListener("click", resetTest); 
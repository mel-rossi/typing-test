const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
let originText = document.querySelector("#origin-text p").innerHTML;
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");
const resetScore = document.querySelector("#reset-scores");

// localStorage.clear(); // Clear localStorage for testing purposes

// Variable Declarations and Initializations
let elapsedMs = 0;
let errorCount = 0;
let startTime = null;
let timerInterval = null;
let testRunning = false;
let testComplete = false;

// Array of text paragraphs 
const textPool = [ // Roughly around the same length for each paragraph to keep the test consistent
    "Typing tests are a great way to improve your typing speed and accuracy, and can be a fun challenge for people of all ages.",
    "Speed typing is an essential skill in today's digital world, allowing you to communicate more efficiently and effectively.",
    "So many people struggle with typing because they never learned proper finger placement or took the time to practice regularly.",
    "There are many online typing test platforms available that offer a variety of texts and difficulty levels to help you practice.",
    "The quick brown fox jumps over the lazy dog is a pangram that contains every letter of the English alphabet at least once.",
    "Some people find that using a mechanical keyboard can enhance their typing experience and help them achieve faster speeds.",
    "Regular practice with typing tests can help you develop muscle memory and increase your confidence when typing on a keyboard.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
];

// Display any existing scores on page load
displayScores();

// Initialize the test with a random text from the pool
document.querySelector("#origin-text p").innerHTML = textPool[Math.floor(Math.random() * textPool.length)];
originText = document.querySelector("#origin-text p").innerHTML;
renderOriginText();

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

        updateOriginColors(); // render "." final character

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

        errorCount++; // Increment error count
    }

    updateMetrics(); // Update WPM and error count metrics
    updateOriginColors(); // Update Origin Text Render Colors
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
    errorCount = 0;
    testArea.value = "";
    theTimer.innerHTML = "00:00:00";
    testWrapper.style.borderColor = "grey";
    document.querySelector("#wpm").innerHTML = "0";
    document.querySelector("#errors").innerHTML = "0";

    document.querySelector("#origin-text p").innerHTML = textPool[Math.floor(Math.random() * textPool.length)];
    originText = document.querySelector("#origin-text p").innerHTML;
    renderOriginText();

    testComplete = false;
    testArea.disabled = false;
    
}

// Update Metrics 
function updateMetrics() {
    // Words per minute (WPM) calculation: (total characters / 5) / (elapsed time in minutes)
    const wpm = Math.round((testArea.value.length / 5) / (elapsedMs / 60000)); 

    // Display WPM, handle NaN case
    document.querySelector("#wpm").innerHTML = isNaN(wpm) ? 0 : wpm; 
    // Display error count
    document.querySelector("#errors").innerHTML = errorCount; 
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

    while (scores.length < 3) scores.push(null); // Fill in nulls for empty scores

    scores.forEach((ms) => {
        const li = document.createElement("li");
        // Display placeholder for empty scores
        li.innerHTML = ms ? formatTime(ms) : "99:99:99"; 
        scoreList.appendChild(li);
    });
}

// Reset Leaderboard 
function resetScores() { 
    // Fallback in case the button was clicked by mistake 
    const confirmed = confirm("Previous scores CANNOT be retrieved if you reset the Leaderboard.");

    if (confirmed) { 
        localStorage.removeItem("typingScores"); // Erase scores from Local Storage 
        displayScores();
    }
}

// Render Origin Text while typing 
function renderOriginText() {
    document.querySelector("#origin-text p").innerHTML = originText
        .split("")
        .map(char => `<span>${char}</span>`)
        .join("");
}

// Update Origin Text Render 
function updateOriginColors() { 
    const typed = testArea.value; 
    const spans = document.querySelectorAll("#origin-text p span");

    spans.forEach((span, i) => {
        if (i < typed.length) { 
            span.style.color = typed[i] == originText[i] ? "#5ecec6" : "#e95d0f";
        } else { 
            span.style.color = "rgba(255, 255, 255, 0.85";
        }
    });
}

// Event listeners for keyboard input and the reset button

// Start the timer when the user starts typing 
testArea.addEventListener("keydown", (e) => { 
    if (e.key.length === 1) { // Only start timer on regular character input, ignore control keys
        startTimer();
    } 
});

// Check the input after every keystroke to see if it matches the original text
testArea.addEventListener("input", checkInput); 

// Reset the test when the reset button is clicked
resetButton.addEventListener("click", resetTest); 

// Reset Leaderboard Button 
resetScore.addEventListener("click", resetScores);
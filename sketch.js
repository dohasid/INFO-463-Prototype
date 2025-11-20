/* ---------------------------------------------------------
   GLOBAL VARIABLES
--------------------------------------------------------- */
let keys = [];
let typed = "";
let overlayLetters = ["A", "E", "T", "O"];
let mostLikely = "E";
let keystrokes = [];
let startTime = null;
let trialActive = false;

let targetString = "HELLO WORLD"; // <-- change per test
let results = null;

/* ---------------------------------------------------------
   SETUP KEYBOARD
--------------------------------------------------------- */
function setup() {
  createCanvas(900, 600);

  let layout = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  let startX = 50;
  let startY = 250;
  let keyW = 60;
  let keyH = 60;

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      let x = startX + c * (keyW + 5) + (r === 2 ? 40 : 0);
      let y = startY + r * (keyH + 5);
      keys.push({
        letter: layout[r][c],
        x,
        y,
        w: keyW,
        h: keyH,
        scale: 1.0 // for hover expansion
      });
    }
  }
}

/* ---------------------------------------------------------
   DRAW LOOP
--------------------------------------------------------- */
function draw() {
  background(245);

  drawTargetText();
  drawTypedText();
  drawKeyboard();
  drawOverlay();
  drawButtons();
  drawResults();
}

/* ---------------------------------------------------------
   UI ELEMENTS
--------------------------------------------------------- */
function drawTargetText() {
  fill(20);
  textSize(28);
  text("Target: " + targetString, 50, 80);
}

function drawTypedText() {
  fill(0);
  textSize(28);
  text("Typed: " + typed, 50, 130);
}

function drawButtons() {
  // START BUTTON
  fill(200, 230, 255);
  rect(650, 80, 160, 50, 10);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("Start Trial", 730, 105);

  // FINISH BUTTON
  fill(200, 255, 200);
  rect(650, 150, 160, 50, 10);
  fill(0);
  text("Finish Trial", 730, 175);
}

/* ---------------------------------------------------------
   KEYBOARD + HOVER EXPANSION
--------------------------------------------------------- */
function drawKeyboard() {
  for (let key of keys) {
    // Hover detection
    let hovering =
      mouseX > key.x &&
      mouseX < key.x + key.w &&
      mouseY > key.y &&
      mouseY < key.y + key.h;

    // Expansion target
    let targetScale = hovering ? 1.35 : 1.0;

    // Smooth animation
    key.scale = lerp(key.scale, targetScale, 0.15);

    let w = key.w * key.scale;
    let h = key.h * key.scale;
    let x = key.x - (w - key.w) / 2;
    let y = key.y - (h - key.h) / 2;

    fill(hovering ? 230 : 255);
    stroke(0);
    rect(x, y, w, h, 10);

    fill(0);
    textAlign(CENTER, CENTER);
    textSize(24);
    text(key.letter, x + w / 2, y + h / 2);
  }
}

/* ---------------------------------------------------------
   PREDICTIVE OVERLAY
--------------------------------------------------------- */
function drawOverlay() {
  let ox = 550;
  let oy = 330;
  let size = 50;

  textSize(20);
  fill(0);
  text("Predicted Letters:", ox, oy - 10);

  for (let i = 0; i < overlayLetters.length; i++) {
    let letter = overlayLetters[i];

    fill(letter === mostLikely ? color(255, 200, 120) : 255);
    stroke(0);
    rect(ox + i * (size + 10), oy, size, size, 8);

    fill(0);
    textAlign(CENTER, CENTER);
    text(letter, ox + i * (size + 10) + size / 2, oy + size / 2);
  }
}

/* ---------------------------------------------------------
   BUTTON CLICKS + KEY INPUT
--------------------------------------------------------- */
function mousePressed() {

  // START TRIAL
  if (mouseX > 650 && mouseX < 810 && mouseY > 80 && mouseY < 130) {
    startTrial();
    return;
  }

  // FINISH TRIAL
  if (mouseX > 650 && mouseX < 810 && mouseY > 150 && mouseY < 200) {
    finishTrial();
    return;
  }

  if (!trialActive) return;

  // KEY CLICKS
  for (let key of keys) {
    if (
      mouseX > key.x &&
      mouseX < key.x + key.w &&
      mouseY > key.y &&
      mouseY < key.y + key.h
    ) {
      registerKeyPress(key.letter);

      overlayLetters = predict(key.letter);
      mostLikely = overlayLetters[0];

      break;
    }
  }
}

/* ---------------------------------------------------------
   TRIAL MANAGEMENT
--------------------------------------------------------- */
function startTrial() {
  typed = "";
  keystrokes = [];
  startTime = null;
  trialActive = true;
  results = null;

  console.log("=== Trial Started ===");
}

function registerKeyPress(letter) {
  if (!startTime) startTime = millis();

  keystrokes.push({
    letter: letter,
    time: millis()
  });

  typed += letter;
}

/* ---------------------------------------------------------
   FINISH TRIAL + METRICS
--------------------------------------------------------- */
function finishTrial() {
  if (!trialActive || keystrokes.length === 0) return;

  trialActive = false;
  let endTime = keystrokes[keystrokes.length - 1].time;
  let durationMin = (endTime - startTime) / 60000;

  let chars = typed.length;
  let grossWPM = (chars / 5) / durationMin;

  let msd = levenshtein(typed, targetString);

  results = {
    typed,
    target: targetString,
    wpm: grossWPM.toFixed(2),
    msd,
    duration: durationMin.toFixed(3),
    keystrokes
  };

  console.log("=== TRIAL RESULTS ===");
  console.log(results);
}

/* ---------------------------------------------------------
   RESULTS DISPLAY
--------------------------------------------------------- */
function drawResults() {
  if (!results) return;

  fill(0);
  textSize(20);
  text("Results:", 50, 180);
  text("WPM: " + results.wpm, 50, 210);
  text("MSD: " + results.msd, 50, 240);
  text("Duration (min): " + results.duration, 50, 270);
}

/* ---------------------------------------------------------
   PREDICTION PLACEHOLDER
--------------------------------------------------------- */
function predict(letter) {
  let map = {
    H: ["E", "A", "O"],
    E: ["L", "R", "T"],
    L: ["O", "I", "A"],
    O: ["W", "R", "N"]
  };

  return map[letter] || ["A", "E", "T"];
}

/* ---------------------------------------------------------
   LEVENSHTEIN DISTANCE
--------------------------------------------------------- */
function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
            matrix[i - 1][j] + 1,   // deletion
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j - 1] + 1 // substitution
          );
    }
  }

  return matrix[b.length][a.length];
}

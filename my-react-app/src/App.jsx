import React, { useState, useCallback, useMemo } from "react";
import Key from "./Key";

const keyboardLayout = [
  ["e", "c", "u", "p", "d", "a"],
  ["n", "f", "b", "k", "qjxz", "g"],
  ["l", "r", "v", "w", "m", "h"],
  ["i", "s", "y", "t", "o", "."]
];

const overlayPredictions = {
  a: ["n", "r", "t", "l"], b: ["e", "r", "a", "o"], c: ["h", "o", "a", "e"],
  d: ["e", "i", "a", "o"], e: ["r", "s", "n", "d"], f: ["r", "o", "a", "i"],
  g: ["r", "a", "e", "u"], h: ["e", "a", "i", "o"], i: ["n", "t", "s", "c"],
  j: ["u", "a", "o", "e"], k: ["e", "i", "a", "o"], l: ["e", "i", "a", "o"],
  m: ["a", "e", "i", "o"], n: ["g", "d", "t", "c"], o: ["n", "r", "u", "l"],
  p: ["r", "l", "a", "e"], q: ["u"], r: ["e", "a", "i", "o"], s: ["t", "h", "e", "a"],
  t: ["h", "r", "o", "e"], u: ["r", "n", "s", "t"], v: ["e", "i", "a", "o"],
  w: ["h", "a", "e", "o"], x: ["t", "c", "a", "e"], y: ["o", "e", "a", "i"],
  z: ["e", "a", "i", "o"]
};

const targetSentences = [
  "She packed twelve blue pens in her small bag.",
  "Every bird sang sweet songs in the quiet dawn.",
  "They watched clouds drift across the golden sky.",
  "A clever mouse slipped past the sleepy cat.",
  "Green leaves danced gently in the warm breeze.",
  "He quickly wrote notes before the test began.",
  "The tall man wore boots made of soft leather.",
  "Old clocks ticked loudly in the silent room.",
  "She smiled while sipping tea on the front porch.",
  "We found a hidden path behind the old barn.",
  "Sunlight streamed through cracks in the ceiling.",
  "Dogs barked at shadows moving through the yard.",
  "Rain tapped softly against the window glass.",
  "Bright stars twinkled above the quiet valley.",
  "He tied the package with ribbon and string.",
  "A sudden breeze blew papers off the desk.",
  "The curious child opened every single drawer.",
  "Fresh apples fell from the heavy tree limbs.",
  "The artist painted scenes from her memory.",
  "They danced all night under the glowing moon."
];

const styles = {
  body: {
    fontFamily: "sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "20px"
  },
  output: {
    width: "1200px",
    height: "80px",
    border: "2px solid #aaa",
    marginBottom: "5px",
    padding: "10px",
    fontSize: "28px",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word"
  },
  target: {
    width: "1200px",
    margin: "10px 0",
    fontSize: "22px",
    fontStyle: "italic",
    color: "#333"
  },
  shiftBtn: {
    width: "200px",
    padding: "8px",
    background: "#ccc",
    border: "1px solid #777",
    borderRadius: "5px",
    marginTop: "5px",
    marginBottom: "20px",
    cursor: "pointer"
  },
  shiftBtnActive: {
    background: "#999",
    color: "white"
  },
  button: {
    margin: "5px",
    padding: "10px 15px",
    backgroundColor: "#ddd",
    border: "1px solid #999",
    borderRadius: "5px",
    cursor: "pointer",
    whiteSpace: "normal",
    lineHeight: 1.3,
    width: "300px",
    textAlign: "center"
  },
  results: {
    width: "1200px",
    marginTop: "15px",
    fontSize: "18px"
  },
  keyboard: {
    display: "flex",
    flexDirection: "column",
    width: "1400px",
    marginBottom: "20px",
    cursor: "pointer"
  },
  row: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "70px",
    minHeight: "100px",
    cursor: "pointer"
  }
};

function levenshtein(a, b) {
  const m = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] =
        b[i - 1] === a[j - 1]
          ? m[i - 1][j - 1]
          : Math.min(
            m[i - 1][j] + 1,
            m[i][j - 1] + 1,
            m[i - 1][j - 1] + 1
          );
    }
  }
  return m[b.length][a.length];
}

const App = () => {
  const [isUpper, setIsUpper] = useState(false);
  const [typed, setTyped] = useState("");
  const [keystrokes, setKeystrokes] = useState([]);
  const [trialActive, setTrialActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [targetString, setTargetString] = useState("");
  const [results, setResults] = useState(null);

  const applyCase = useCallback(
    (ch) => (isUpper ? ch.toUpperCase() : ch.toLowerCase()),
    [isUpper]
  );

  const recordKeystroke = useCallback(
    (letter) => {
      if (!trialActive) return;

      setKeystrokes((prev) => {
        const now = performance.now();
        if (!startTime && prev.length === 0) {
          setStartTime(now);
        }
        const outputLetter =
          letter === " " ? "␣" : applyCase(letter);
        setTyped((curr) => curr + outputLetter);
        return [...prev, { letter: outputLetter, time: now }];
      });
    },
    [trialActive, applyCase, startTime]
  );

  const handleKeyboardClick = (e) => {
    const clickedKey = e.target.closest("[data-key]");
    const clickedOverlay = e.target.closest("[data-overlay]");
    if (!clickedKey && !clickedOverlay) {
      recordKeystroke(" ");
    }
  };

  const handleStart = () => {
    setTyped("");
    setKeystrokes([]);
    setTrialActive(true);
    setStartTime(null);
    const i = Math.floor(Math.random() * targetSentences.length);
    setTargetString(targetSentences[i]);
    setResults(null);
  };

  const handleFinish = () => {
    setTrialActive(false);
    if (keystrokes.length === 0 || !startTime) return;

    const end = keystrokes[keystrokes.length - 1].time;
    const durationMin = (end - startTime) / 60000;

    const typedClean = typed.replace(/␣/g, "");
    const targetClean = targetString.replace(/\s/g, "");
    const WPM = (typedClean.length / 5) / durationMin;
    const MSD = levenshtein(typedClean, targetClean);

    setResults({
      target: targetString,
      typed,
      WPM: WPM.toFixed(2),
      MSD,
      durationMin: durationMin.toFixed(3)
    });
  };

  const shiftStyle = isUpper
    ? { ...styles.shiftBtn, ...styles.shiftBtnActive }
    : styles.shiftBtn;

  const keyboard = useMemo(
    () => (
      <div
        style={styles.keyboard}
        onClick={handleKeyboardClick}
      >
        {keyboardLayout.map((row, r) => (
          <div key={r} style={styles.row}>
            {row.map((letter) => (
              <div key={letter} data-key>
                <Key
                  letter={letter}
                  isUpper={isUpper}
                  trialActive={trialActive}
                  recordKeystroke={recordKeystroke}
                  overlayPredictions={overlayPredictions}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
    [isUpper, trialActive, recordKeystroke]
  );

  return (
    <div style={styles.body}>
      <h2>Keyboard Prototype</h2>

      <div style={styles.output}>{typed}</div>
      <div style={styles.target}>
        {targetString ? `Target: ${targetString}` : ""}
      </div>

      <button
        style={shiftStyle}
        onClick={() => setIsUpper((v) => !v)}
      >
        Shift ({isUpper ? "ON" : "OFF"})
      </button>

      <div>
        <button
          style={styles.button}
          onClick={handleStart}
          disabled={trialActive}
        >
          Start Trial
        </button>
        <button
          style={styles.button}
          onClick={handleFinish}
          disabled={!trialActive}
        >
          Finish Trial
        </button>
      </div>

      {results && (
        <div style={styles.results}>
          <h3>Results</h3>
          <p>Target: {results.target}</p>
          <p>Typed: {results.typed}</p>
          <p>WPM: {results.WPM}</p>
          <p>MSD: {results.MSD}</p>
          <p>Duration (min): {results.durationMin}</p>
          <p style={{ color: "blue" }}>
            <strong>Trial finished!</strong>
          </p>
        </div>
      )}

      {keyboard}
    </div>
  );
};

export default App;

const keyboard = document.getElementById('keyboard');
const overlay = document.getElementById('overlay');
const rareBox = document.getElementById('rare-box');

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const nextLetterMap = {
  T: ['H', 'R', 'O'],
  H: ['E', 'A', 'I'],
  A: ['N', 'T', 'S'],
  E: ['R', 'S', 'D']
};

const wordPredictions = {
  TH: ['THE', 'THAT', 'THIS'],
  HE: ['HELLO', 'HER', 'HELP'],
  AN: ['AND', 'ANY', 'ANOTHER']
};

let currentWord = '';

letters.forEach(letter => {
  const btn = document.createElement('button');
  btn.textContent = letter;
  btn.classList.add('key');
  btn.addEventListener('click', () => handleClick(letter));
  keyboard.appendChild(btn);
});

function handleClick(letter) {
  currentWord += letter;
  const nextLetters = nextLetterMap[letter] || [];
  const predictedWords = wordPredictions[currentWord] || [];

  overlay.innerHTML = `
    <h3>After "${letter}"</h3>
    ${nextLetters.map(l => `<button class="key">${l}</button>`).join('')}
    ${predictedWords.length ? `<p><b>Predicted word:</b> ${predictedWords[0]}</p>` : ''}
  `;
  overlay.classList.remove('hidden');
}

// Rare letters hover behavior
rareBox.addEventListener('mouseenter', () => {
  overlay.innerHTML = `
    <h3>Rare letters</h3>
    ${['Q', 'J', 'X', 'Z'].map(l => `<button class="key">${l}</button>`).join('')}
  `;
  overlay.classList.remove('hidden');
});
rareBox.addEventListener('mouseleave', () => {
  overlay.classList.add('hidden');
});
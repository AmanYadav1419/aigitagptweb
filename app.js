const form = document.getElementById('form');
const hearButton = document.getElementById('speech');

let slokaText = '';
let translationText = '';
let meaningText = {};

// Object to store API endpoints for different languages
const apiEndpoints = {
  sanskrit: 'https://bhagavadgitaapi.in/slok/',
  english: 'https://bhagavadgitaapi.in/en/slok/',
  hindi: 'https://bhagavadgitaapi.in/hin/slok/'
};

form.addEventListener('submit', e => {
  e.preventDefault();

  const chapter = document.getElementById('chapter').value;
  const verse = document.getElementById('verse').value;

  // Clear the sloka and translation divs
  document.getElementById('sanskrit').innerHTML = '';
  document.getElementById('translation').innerHTML = '';

  // Get the sloka and translation for the selected chapter and verse
  fetch(`${apiEndpoints.sanskrit}${chapter}/${verse}/`)
    .then(response => response.json())
    .then(data => {
      slokaText = data.slok;
      translationText = data.tej;

      // Display the sloka and translation in the respective divs
      document.getElementById('sanskrit').innerHTML = slokaText;
      document.getElementById('translation').innerHTML = translationText;

      // Get the meaning of the sloka in different languages
      Promise.all([
        fetch(`${apiEndpoints.english}${chapter}/${verse}/`).then(response => response.json()),
        fetch(`${apiEndpoints.hindi}${chapter}/${verse}/`).then(response => response.json())
      ])
        .then(([englishData, hindiData]) => {
          meaningText.english = englishData.tej;
          meaningText.hindi = hindiData.tej;
        })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      console.error(error);
      hearButton.disabled = true;
    });
});

hearButton.addEventListener('click', () => {
  if ('speechSynthesis' in window && slokaText && translationText) {
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(voice => voice.lang === 'hi-IN');
    const sanskritVoice = voices.find(voice => voice.lang === 'sa-IN');
    const englishVoice = voices.find(voice => voice.lang === 'en-US');

    const speech = new SpeechSynthesisUtterance();
    speech.text = `${slokaText}. ${translationText}`;
    speech.rate = 0.8;

    if (hindiVoice) {
      speech.voice = hindiVoice;
      speech.lang = 'hi-IN';
    } else if (sanskritVoice) {
      speech.voice = sanskritVoice;
      speech.lang = 'sa-IN';
    } else if (englishVoice) {
      speech.voice = englishVoice;
      speech.lang = 'en-US';
    }

    window.speechSynthesis.speak(speech);
  }
});

// Function to display the meaning of the sloka in different languages
function showMeaning(lang) {
  const meaningDiv = document.getElementById('meaning');

  // Clear the meaning div
  meaningDiv.innerHTML = '';

  // Display the meaning for the selected language
  if (meaningText[lang]) {
    meaningDiv.innerHTML = meaningText[lang];
  } else {
    meaningDiv.innerHTML = `Meaning not available in ${lang.toUpperCase()} for this sloka`;
  }
}

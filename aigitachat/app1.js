const form = document.getElementById('form');
const hearButton = document.getElementById('speech');
const sanskritDiv = document.getElementById('sanskrit');
const translationDiv = document.getElementById('translation');
const englishRadio = document.getElementById('english');
const hindiRadio = document.getElementById('hindi');
const sanskritRadio = document.getElementById('sanskrit-lang');

let slokaText = '';
let translationText = '';
let meaningText = '';

const getMeaning = async (chapter, verse, language) => {
    const apiEndpoint = `https://bhagavadgitaapi.in/meaning/${chapter}/${verse}/${language}/`;
    const response = await fetch(apiEndpoint);
    const data = await response.json();
    return data.meaning;
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const chapter = document.getElementById('chapter').value;
    const verse = document.getElementById('verse').value;

    const slokaEndpoint = `https://bhagavadgitaapi.in/slok/${chapter}/${verse}/`;
    const translationEndpoint = `https://bhagavadgitaapi.in/tej/${chapter}/${verse}/`;

    try {
        const [slokaResponse, translationResponse] = await Promise.all([
            fetch(slokaEndpoint),
            fetch(translationEndpoint),
        ]);

        const [slokaData, translationData] = await Promise.all([
            slokaResponse.json(),
            translationResponse.json(),
        ]);

        slokaText = slokaData.slok;
        translationText = translationData.tej;
        slokaDiv.textContent = slokaText;
        translationDiv.textContent = translationText;
    } catch (error) {
        console.error(error);
        hearButton.disabled = true;
    }
});

hearButton.addEventListener('click', () => {
    if ('speechSynthesis' in window && slokaText && translationText) {
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice = voices.find((voice) => voice.lang === 'hi-IN');
        const sanskritVoice = voices.find((voice) => voice.lang === 'sa-IN');
        const englishVoice = voices.find((voice) => voice.lang === 'en-US');

        const speech = new SpeechSynthesisUtterance();
        speech.text = `${slokaText}. ${translationText}`;
        speech.rate = 0.8;

        if (hindiRadio.checked && hindiVoice) {
            speech.voice = hindiVoice;
            speech.lang = 'hi-IN';
        } else if (sanskritRadio.checked && sanskritVoice) {
            speech.voice = sanskritVoice;
            speech.lang = 'sa-IN';
        } else if (englishRadio.checked && englishVoice) {
            speech.voice = englishVoice;
            speech.lang = 'en-US';
        }

        window.speechSynthesis.speak(speech);
    }
});

document.querySelectorAll('input[type=radio][name=language]').forEach((radio) => {
    radio.addEventListener('change', async () => {
        const chapter = document.getElementById('chapter').value;
        const verse = document.getElementById('verse').value;
        const language = radio.value;

        try {
            meaningText = await getMeaning(chapter, verse, language);
            document.getElementById('meaning').textContent = meaningText;
        } catch (error) {
            console.error(error);
        }
    });
});

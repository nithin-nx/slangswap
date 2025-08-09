// --- 1. SELECT ELEMENTS ---
const slangInput = document.getElementById('slang-input');
const fromDistrictSelect = document.getElementById('from-district');
const toDistrictSelect = document.getElementById('to-district');
const resultText = document.getElementById('result-text');
const speakButton = document.getElementById('speak-button');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;

// NEW: Select the new button and audio elements
const translateButton = document.getElementById('translate-button');
const successSound = document.getElementById('success-sound');
const errorSound = document.getElementById('error-sound');


let slangData = {};
let malayalamVoice = null;


// --- 2. LOAD THE SLANG DATA & VOICE ---
document.addEventListener('DOMContentLoaded', () => {
    fetch('slang.json')
        .then(response => response.json())
        .then(data => {
            slangData = data;
            populateDistricts();
        })
        .catch(error => console.error('Error loading slang data:', error));

    function loadMalayalamVoice() {
        const voices = window.speechSynthesis.getVoices();
        malayalamVoice = voices.find(voice => voice.lang === 'ml-IN');
        if (malayalamVoice) {
            console.log('Found Malayalam Voice:', malayalamVoice.name);
        } else {
            console.log('No Malayalam voice found on this browser/device.');
        }
    }

    window.speechSynthesis.onvoiceschanged = loadMalayalamVoice;
    loadMalayalamVoice();
});


// --- 3. POPULATE DROPDOWNS ---
function populateDistricts() {
    const districts = Object.keys(slangData);
    districts.forEach(district => {
        const fromOption = document.createElement('option');
        fromOption.value = district;
        fromOption.textContent = district;
        fromDistrictSelect.appendChild(fromOption);
        
        const toOption = document.createElement('option');
        toOption.value = district;
        toOption.textContent = district;
        toDistrictSelect.appendChild(toOption);
    });
}

// --- 4. THE TRANSLATE FUNCTION (MODIFIED) ---
function translateSlang() {
    const fromDistrict = fromDistrictSelect.value;
    const toDistrict = toDistrictSelect.value;
    const inputSlang = slangInput.value.trim().toLowerCase();

    if (!inputSlang) {
        resultText.textContent = 'Please enter a word.';
        speakButton.classList.add('hidden');
        return;
    }

    if (slangData[fromDistrict] && slangData[fromDistrict][inputSlang] && slangData[fromDistrict][inputSlang][toDistrict]) {
        const translation = slangData[fromDistrict][inputSlang][toDistrict];
        resultText.textContent = translation;
        speakButton.classList.remove('hidden');
        
        // NEW: Play success sound
        successSound.currentTime = 0; // Rewind to start
        successSound.play();

    } else {
        resultText.textContent = 'Translation not found!';
        speakButton.classList.add('hidden');

        // NEW: Play error sound
        errorSound.currentTime = 0; // Rewind to start
        errorSound.play();
    }
}

// --- 5. EVENT LISTENERS (MODIFIED) ---

// A. Translate when the user clicks the new button
translateButton.addEventListener('click', translateSlang);

// B. We keep the "Enter" key support for convenience
slangInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        translateSlang();
    }
});

// C. Dark Mode Toggle
darkModeToggle.addEventListener('change', () => {
    body.classList.toggle('dark-mode');
});

// D. Text-to-Speech Button (No changes here)
speakButton.addEventListener('click', () => {
    const textToSpeak = resultText.textContent;
    
    if (textToSpeak && textToSpeak !== 'Translation not found!' && textToSpeak !== 'Please enter a word.') {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        if (malayalamVoice) {
            utterance.voice = malayalamVoice;
        }
        utterance.lang = 'ml-IN';
        window.speechSynthesis.speak(utterance);
    }
});

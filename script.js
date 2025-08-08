// --- 1. SELECT ELEMENTS ---
const slangInput = document.getElementById('slang-input');
const fromDistrictSelect = document.getElementById('from-district');
const toDistrictSelect = document.getElementById('to-district');
const resultText = document.getElementById('result-text');
const speakButton = document.getElementById('speak-button');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;

let slangData = {};
// --- NEW: A variable to store the found Malayalam voice ---
let malayalamVoice = null;


// --- 2. LOAD THE SLANG DATA & VOICE ---
document.addEventListener('DOMContentLoaded', () => {
    // Fetch the JSON data
    fetch('slang.json')
        .then(response => response.json())
        .then(data => {
            slangData = data;
            populateDistricts();
        })
        .catch(error => console.error('Error loading slang data:', error));

    // --- NEW: Function to find and set the Malayalam voice ---
    function loadMalayalamVoice() {
        const voices = window.speechSynthesis.getVoices();
        malayalamVoice = voices.find(voice => voice.lang === 'ml-IN');
        
        // You can check in your browser's console if a voice was found
        if (malayalamVoice) {
            console.log('Found Malayalam Voice:', malayalamVoice.name);
        } else {
            console.log('No Malayalam voice found on this browser/device.');
        }
    }

    // The voices list loads asynchronously, so we need to wait for the 'voiceschanged' event
    window.speechSynthesis.onvoiceschanged = loadMalayalamVoice;
    // Also try to load it immediately in case they are already available
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

// --- 4. THE TRANSLATE FUNCTION ---
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
    } else {
        resultText.textContent = 'Translation not found!';
        speakButton.classList.add('hidden');
    }
}

// --- 5. EVENT LISTENERS ---
slangInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        translateSlang();
    }
});
fromDistrictSelect.addEventListener('change', translateSlang);
toDistrictSelect.addEventListener('change', translateSlang);
darkModeToggle.addEventListener('change', () => {
    body.classList.toggle('dark-mode');
});

// --- MODIFIED: Text-to-Speech Button Event Listener ---
speakButton.addEventListener('click', () => {
    const textToSpeak = resultText.textContent;
    
    if (textToSpeak && textToSpeak !== 'Translation not found!' && textToSpeak !== 'Please enter a word.') {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        // --- NEW: Assign the Malayalam voice if we found one ---
        if (malayalamVoice) {
            utterance.voice = malayalamVoice;
        }
        
        // We still set the lang property as a fallback
        utterance.lang = 'ml-IN';
        
        window.speechSynthesis.speak(utterance);
    }
});
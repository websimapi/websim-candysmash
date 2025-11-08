const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {};

async function loadSound(name) {
    if (audioBuffers[name]) {
        return audioBuffers[name];
    }
    try {
        const response = await fetch(name);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers[name] = audioBuffer;
        return audioBuffer;
    } catch (error) {
        console.error(`Error loading sound: ${name}`, error);
    }
}

export function playSound(name) {
    // Resume context on user gesture
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    loadSound(name).then(audioBuffer => {
        if (!audioBuffer) return;
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    });
}

// Preload common sounds
window.addEventListener('load', () => {
    loadSound('match.mp3');
    loadSound('smash.mp3');
});
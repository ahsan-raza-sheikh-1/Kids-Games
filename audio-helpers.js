// Helper functions for game functionality

// Toggle audio mute
function toggleAudioMute() {
    audioManager.toggleMute();
}

// Toggle story pause/resume
function toggleStoryPause() {
    if (audioManager.isPaused) {
        audioManager.resumeNarration();
    } else {
        audioManager.pauseNarration();
    }
    updateAudioButtonsUI();
}

// Toggle narration
function toggleNarration() {
    if (audioManager.isMuted) {
        alert('🔇 Audio is muted. Please unmute from the header to listen to narration.');
        return;
    }

    const story = gameState.stories[gameState.currentStory];
    if (!story) return;
    
    const page = story.pages[gameState.currentStoryPage];
    if (!page) return;

    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        audioManager.stopNarration();
    } else {
        playNarration(page.text);
    }
}

// Initialize audio controls when page loads
function initializeAudioControls() {
    // Set up mute button click handler
    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
        audioToggle.addEventListener('click', toggleAudioMute);
        audioManager.updateMuteButton();
    }
}

(function () {
  const SOUND_STORAGE_KEY = "clueGameSoundEnabled";
  const SUCCESS_SOUND_PATH = "./assets/audio/success.mp3";
  let soundEnabled = true;
  let successSoundPlayed = false;
  let successAudio = null;

  function initSoundSettings() {
    try {
      const stored = window.localStorage.getItem(SOUND_STORAGE_KEY);
      soundEnabled = stored === null ? true : stored !== "false";
    } catch (error) {
      soundEnabled = true;
      console.warn("Failed to load sound settings", error);
    }
    return soundEnabled;
  }

  function saveSoundSettings() {
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? "true" : "false");
    } catch (error) {
      console.warn("Failed to save sound settings", error);
    }
  }

  function updateSoundToggleUI(button) {
    if (!button) return;
    button.textContent = `音效：${soundEnabled ? "開" : "關"}`;
    button.setAttribute("aria-label", soundEnabled ? "關閉答對音效" : "開啟答對音效");
    button.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
  }

  function toggleSoundEnabled(button) {
    soundEnabled = !soundEnabled;
    saveSoundSettings();
    updateSoundToggleUI(button);
    return soundEnabled;
  }

  function playSuccessSound() {
    if (successSoundPlayed) return false;
    successSoundPlayed = true;
    if (!soundEnabled) return true;

    try {
      if (!successAudio) {
        successAudio = new Audio(SUCCESS_SOUND_PATH);
        successAudio.preload = "auto";
      }

      successAudio.pause();
      successAudio.currentTime = 0;
      successAudio.volume = 0.75;

      const playPromise = successAudio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(error => {
          console.warn("Success sound unavailable", error);
        });
      }
      return true;
    } catch (error) {
      console.warn("Success sound unavailable", error);
      return false;
    }
  }

  function resetSuccessSoundState() {
    successSoundPlayed = false;
    if (!successAudio) return;
    try {
      successAudio.pause();
      successAudio.currentTime = 0;
    } catch (error) {
      console.warn("Failed to reset success sound", error);
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function triggerSuccessEffects(options) {
    const body = options && options.body ? options.body : document.body;
    const resultCard = options && options.resultCard ? options.resultCard : null;
    const successBurst = options && options.successBurst ? options.successBurst : null;
    if (!body || !resultCard || !successBurst) return;

    body.classList.remove("success-flash");
    resultCard.classList.remove("success-pop");
    successBurst.classList.remove("is-active");

    // Restart animations cleanly on each successful clear.
    void resultCard.offsetWidth;

    body.classList.add("success-flash");
    resultCard.classList.add("success-pop");
    successBurst.classList.add("is-active");

    const duration = prefersReducedMotion() ? 220 : 1000;
    window.setTimeout(() => {
      body.classList.remove("success-flash");
      resultCard.classList.remove("success-pop");
      successBurst.classList.remove("is-active");
    }, duration);
  }

  window.ClueGameSound = {
    SOUND_STORAGE_KEY,
    SUCCESS_SOUND_PATH,
    initSoundSettings,
    updateSoundToggleUI,
    toggleSoundEnabled,
    playSuccessSound,
    resetSuccessSoundState,
    triggerSuccessEffects
  };
})();

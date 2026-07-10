(function () {
  const STORAGE_KEY = "clueGameSettings";

  const defaults = {
    title: "全班最後試煉",
    subtitle: "大家一起努力合作破關",
    answer: "BRAINSTORMING",
    letterCount: 13,
    hint1: '提示一：第一個字母是 "B"。',
    hint2: '提示二：最後一個字母是 "G"。',
    hint3: "提示三：這個單字拆成兩段理解，前 5 個字母＋後 8 個字母。",
    prize1: "全班手搖飲",
    prize2: "全班冰棒",
    prize3: "全班麥香紅茶",
    overtimeText: "通關完成小獎勵",
    hint1Time: 60,
    hint2Time: 180,
    hint3Time: 300
  };

  function normalizeAnswer(text) {
    return String(text || "").toUpperCase().replace(/[^A-Z]/g, "");
  }

  function normalizeSettings(raw) {
    const base = Object.assign({}, defaults, raw || {});
    const answer = normalizeAnswer(base.answer);
    const safeAnswer = answer.length >= 2 ? answer : defaults.answer;
    const hint1Time = parsePositiveInt(base.hint1Time, defaults.hint1Time);
    const hint2Time = Math.max(hint1Time + 1, parsePositiveInt(base.hint2Time, defaults.hint2Time));
    const hint3Time = Math.max(hint2Time + 1, parsePositiveInt(base.hint3Time, defaults.hint3Time));

    return {
      title: String(base.title || defaults.title).trim() || defaults.title,
      subtitle: String(base.subtitle || defaults.subtitle).trim() || defaults.subtitle,
      answer: safeAnswer,
      letterCount: safeAnswer.length,
      hint1: String(base.hint1 || defaults.hint1).trim() || defaults.hint1,
      hint2: String(base.hint2 || defaults.hint2).trim() || defaults.hint2,
      hint3: String(base.hint3 || defaults.hint3).trim() || defaults.hint3,
      prize1: String(base.prize1 || defaults.prize1).trim() || defaults.prize1,
      prize2: String(base.prize2 || defaults.prize2).trim() || defaults.prize2,
      prize3: String(base.prize3 || defaults.prize3).trim() || defaults.prize3,
      overtimeText: String(base.overtimeText || defaults.overtimeText).trim() || defaults.overtimeText,
      hint1Time,
      hint2Time,
      hint3Time
    };
  }

  function parsePositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  function loadSettings() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeSettings(JSON.parse(raw)) : normalizeSettings(defaults);
    } catch (error) {
      console.warn("Failed to load clueGameSettings", error);
      return normalizeSettings(defaults);
    }
  }

  function saveSettings(settings) {
    const normalized = normalizeSettings(settings);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      console.warn("Failed to save clueGameSettings", error);
    }
    return normalized;
  }

  function resetSettings() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to reset clueGameSettings", error);
    }
    return normalizeSettings(defaults);
  }

  function formatSeconds(totalSeconds) {
    const safe = parsePositiveInt(totalSeconds, 0);
    const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
    const seconds = String(safe % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function parseTimeInput(value, fallback) {
    const text = String(value || "").trim();
    if (!text) return fallback;
    if (/^\d+$/.test(text)) return parsePositiveInt(text, fallback);
    const match = text.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return fallback;
    const minutes = Number.parseInt(match[1], 10);
    const seconds = Number.parseInt(match[2], 10);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || seconds > 59) {
      return fallback;
    }
    return minutes * 60 + seconds;
  }

  window.ClueGameSettings = {
    STORAGE_KEY,
    defaults: normalizeSettings(defaults),
    normalizeAnswer,
    normalizeSettings,
    loadSettings,
    saveSettings,
    resetSettings,
    formatSeconds,
    parseTimeInput
  };
})();

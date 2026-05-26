let englishVoice: SpeechSynthesisVoice | null = null;
let chineseVoice: SpeechSynthesisVoice | null = null;

export const getSpeakText = (english: string) => english.split("/")[0].trim();

export function loadVoices() {
  if (!("speechSynthesis" in window)) return;

  const voices = window.speechSynthesis.getVoices();
  const naturalEnglishNames = [
    "samantha",
    "ava",
    "allison",
    "serena",
    "jamie",
    "daniel",
    "moira",
    "tessa",
    "fiona",
    "alex",
    "google us english",
    "google uk english female",
    "google uk english male",
    "microsoft aria",
    "microsoft jenny",
    "microsoft guy",
    "karen"
  ];

  englishVoice =
    voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = (voice.lang || "").toLowerCase();
      return lang.startsWith("en") && naturalEnglishNames.some(preferred => name.includes(preferred));
    }) ||
    voices.find(voice => voice.lang === "en-US" && voice.localService) ||
    voices.find(voice => voice.lang === "en-US") ||
    voices.find(voice => voice.lang && voice.lang.toLowerCase().startsWith("en")) ||
    null;

  chineseVoice =
    voices.find(voice => voice.lang === "zh-CN") ||
    voices.find(voice => voice.lang && voice.lang.toLowerCase().startsWith("zh")) ||
    null;
}

export function speakText(text: string, lang: string, voice: SpeechSynthesisVoice | null, rate = 0.82, pitch = 1.08) {
  if (!("speechSynthesis" in window)) {
    globalThis.alert("当前浏览器不支持语音朗读功能。");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1;
  if (voice) utterance.voice = voice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
}

export const speakEnglish = (english: string) => speakText(getSpeakText(english), "en-US", englishVoice, 0.82, 1.08);

export const speakChinese = (chinese: string) => speakText(chinese, "zh-CN", chineseVoice, 0.9, 1.04);

export const stopSpeech = () => {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
};

// Shared by the browser and scripts/tts.ts: same text -> same mp3 file name.
export function audioKey(lang: string, voice: string, text: string): string {
  const s = `${lang}|${voice}|${text.trim()}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619);
    h2 = Math.imul(h2 ^ c, 2246822519);
  }
  return `${lang}-${(h1 >>> 0).toString(36)}${(h2 >>> 0).toString(36)}`;
}

export const AUDIO_BASE = process.env.NEXT_PUBLIC_AUDIO_BASE || "/audio";
export const audioUrl = (lang: string, voice: string, text: string) =>
  `${AUDIO_BASE}/${audioKey(lang, voice, text)}.mp3`;

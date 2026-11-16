"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { audioUrl } from "./audio-key";
import type { Lang } from "@/content/types";

/**
 * Plays pre-generated narration. If a file fails to load (bad network), it waits
 * roughly the reading time instead, so the lesson never gets stuck.
 */
export function useVoice(lang: Lang) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const token = useRef(0);

  useEffect(() => {
    audio.current = new Audio();
    audio.current.preload = "auto";
    return () => {
      token.current++;
      audio.current?.pause();
    };
  }, []);

  const stop = useCallback(() => {
    token.current++;
    audio.current?.pause();
  }, []);

  const say = useCallback(
    (text: string, voice: string = "n"): Promise<boolean> => {
      const my = ++token.current;
      const a = audio.current;
      return new Promise((resolve) => {
        if (!a) return resolve(true);
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          clearTimeout(guard);
          a.onended = a.onerror = null;
          resolve(my === token.current); // false = interrupted by a newer line or stop()
        };
        const fallback = () => setTimeout(finish, Math.max(2500, text.length * 65));
        let guard = setTimeout(finish, 30000);
        a.onended = finish;
        a.onerror = () => {
          clearTimeout(guard);
          guard = fallback();
        };
        a.src = audioUrl(lang, voice, text);
        a.play().catch(() => {
          clearTimeout(guard);
          guard = fallback();
        });
      });
    },
    [lang],
  );

  /** Warm the browser cache for the next line. */
  const preload = useCallback(
    (text: string, voice: string = "n") => {
      const l = document.createElement("link");
      l.rel = "prefetch";
      l.href = audioUrl(lang, voice, text);
      document.head.appendChild(l);
    },
    [lang],
  );

  return useMemo(() => ({ say, stop, preload }), [say, stop, preload]);
}

export type Lang = "kk" | "ru";
/** Bilingual string: Kazakh first (state language), Russian second. */
export type L = { kk: string; ru: string };

export type Who = "grandma" | "grandpa" | "woman" | "man" | "boy" | "girl" | "scammer";
export type Mood = "calm" | "worried" | "happy" | "shocked" | "thinking";

/** One visual on the phone-shaped stage. Texts inside mockups are short. */
export type Scene =
  | { type: "title"; icon: string; text: L }
  | { type: "person"; who: Who; mood: Mood; thought?: L }
  | { type: "call"; caller: L; number: string; state: "ringing" | "talking"; danger?: boolean }
  | { type: "sms"; from: string; text: L; link?: string; danger?: boolean }
  | { type: "chat"; name: L; avatar: string; messages: { me?: boolean; text: L }[]; danger?: boolean }
  | { type: "web"; url: string; title: L; fields?: L[]; danger?: boolean }
  | { type: "listing"; icon: string; title: L; price: string; seller: L; danger?: boolean }
  | { type: "bank"; balance: string; delta?: string; note?: L }
  | { type: "flags"; items: { icon: string; text: L }[] }
  | { type: "rule"; icon: string; text: L; good?: boolean };

/** voice: n = narrator (female), s = scammer (male), v = victim/relative (female) */
export type Beat = { scene: Scene; say: L; voice?: "n" | "s" | "v" };

export type Question = {
  scene: Scene;
  q: L;
  options: { icon: string; text: L; correct?: boolean }[];
  explain: L;
};

export type Lesson = {
  id: string; // "l01".."l14"
  level: number; // 1..6
  icon: string;
  title: L;
  beats: Beat[];
  quiz: Question[]; // 2 questions after the lesson
  final: Question; // 1 question for the final test
};

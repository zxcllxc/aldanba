import l01 from "./lessons/l01";
import l02 from "./lessons/l02";
import l03 from "./lessons/l03";
import l04 from "./lessons/l04";
import l05 from "./lessons/l05";
import l06 from "./lessons/l06";
import l07 from "./lessons/l07";
import l08 from "./lessons/l08";
import l09 from "./lessons/l09";
import l10 from "./lessons/l10";
import l11 from "./lessons/l11";
import l12 from "./lessons/l12";
import l13 from "./lessons/l13";
import l14 from "./lessons/l14";

export const LESSONS = [l01, l02, l03, l04, l05, l06, l07, l08, l09, l10, l11, l12, l13, l14];
export const LESSON_IDS = new Set(LESSONS.map((l) => l.id));
export const FINAL_ID = "final";
export const FINAL_PASS = 10; // of 14

export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);

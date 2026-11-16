import type { L } from "./types";

export const LEVELS: { id: number; icon: string; color: string; title: L }[] = [
  { id: 1, icon: "📞", color: "#1f6feb", title: { kk: "Қоңыраулар", ru: "Звонки" } },
  { id: 2, icon: "✉️", color: "#0e9384", title: { kk: "Хабарламалар мен сілтемелер", ru: "Сообщения и ссылки" } },
  { id: 3, icon: "💬", color: "#7a5af8", title: { kk: "Мессенджерлер", ru: "Мессенджеры" } },
  { id: 4, icon: "🛒", color: "#dc6803", title: { kk: "Сауда және жұмыс", ru: "Покупки и работа" } },
  { id: 5, icon: "💰", color: "#c11574", title: { kk: "Ақша мен карта", ru: "Деньги и карты" } },
  { id: 6, icon: "🤖", color: "#344054", title: { kk: "Жаңа қауіптер", ru: "Новые угрозы" } },
];

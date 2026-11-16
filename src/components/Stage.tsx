import type { Lang, Mood, Scene, Who } from "@/content/types";

const WHO: Record<Who, string> = {
  grandma: "👵", grandpa: "👴", woman: "👩", man: "👨", boy: "👦", girl: "👧", scammer: "🕵️",
};
const MOOD: Record<Mood, string> = { calm: "🙂", worried: "😟", happy: "😊", shocked: "😱", thinking: "🤔" };

function Phone({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`pop mx-auto w-[min(270px,78vw)] rounded-[34px] border-[6px] ${danger ? "border-danger/80" : "border-ink"} bg-ink p-1.5 shadow-xl`}>
      <div className="relative h-[var(--phone-h,min(360px,52vh))] overflow-hidden rounded-[26px] bg-white">{children}</div>
    </div>
  );
}

function DangerTag({ lang }: { lang: Lang }) {
  return (
    <div className="drop delay-3 absolute right-2 top-2 z-10 rounded-full bg-danger px-3 py-1 text-sm font-bold text-white">
      ⚠️ {lang === "kk" ? "Алаяқ" : "Мошенник"}
    </div>
  );
}

export function Stage({ scene, lang }: { scene: Scene; lang: Lang }) {
  const tx = (s: { kk: string; ru: string }) => s[lang];

  switch (scene.type) {
    case "title":
      return (
        <div className="pop flex flex-col items-center gap-4 py-8 text-center">
          <div className="text-8xl">{scene.icon}</div>
          <div className="text-2xl font-extrabold">{tx(scene.text)}</div>
        </div>
      );

    case "person":
      return (
        <div className="pop flex flex-col items-center gap-3 py-6">
          {scene.thought && (
            <div className="drop delay-1 relative max-w-[260px] rounded-3xl bg-white px-5 py-3 text-center text-xl font-bold shadow">
              {tx(scene.thought)}
              <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white" />
            </div>
          )}
          <div className="relative">
            <div className="text-[120px] leading-none">{WHO[scene.who]}</div>
            <div className="absolute -right-3 bottom-0 rounded-full bg-white p-1 text-4xl shadow">{MOOD[scene.mood]}</div>
          </div>
        </div>
      );

    case "call":
      return (
        <Phone danger={scene.danger}>
          {scene.danger && <DangerTag lang={lang} />}
          <div className="flex h-full flex-col items-center justify-between bg-gradient-to-b from-[#1d2b3a] to-[#2f4a63] px-4 py-8 text-white">
            <div className="text-center">
              <div className={`mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-white/15 text-4xl ${scene.state === "ringing" ? "ring" : ""}`}>
                📞
              </div>
              <div className="text-xl font-bold">{tx(scene.caller)}</div>
              <div className="text-white/70">{scene.number}</div>
              <div className="mt-1 text-sm text-white/60">
                {scene.state === "ringing" ? (lang === "kk" ? "Кіріс қоңырау…" : "Входящий звонок…") : "00:42"}
              </div>
            </div>
            {scene.state === "ringing" ? (
              <div className="flex w-full justify-around">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-danger text-2xl">✕</span>
                <span className="grid h-14 w-14 place-items-center rounded-full bg-safe text-2xl">✆</span>
              </div>
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-full bg-danger text-2xl">✕</span>
            )}
          </div>
        </Phone>
      );

    case "sms":
      return (
        <Phone danger={scene.danger}>
          {scene.danger && <DangerTag lang={lang} />}
          <div className="border-b bg-gray-50 px-4 py-3 text-center">
            <div className="mx-auto mb-1 grid h-10 w-10 place-items-center rounded-full bg-gray-300 text-lg">✉️</div>
            <div className="font-bold">{scene.from}</div>
          </div>
          <div className="p-3">
            <div className="drop delay-1 max-w-[90%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-[17px]">
              {tx(scene.text)}
              {scene.link && (
                <div className={`mt-1 break-all font-medium underline ${scene.danger ? "text-danger" : "text-sky"}`}>{scene.link}</div>
              )}
            </div>
          </div>
        </Phone>
      );

    case "chat":
      return (
        <Phone danger={scene.danger}>
          {scene.danger && <DangerTag lang={lang} />}
          <div className="flex items-center gap-2 bg-[#1f7a5c] px-3 py-3 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-xl">{scene.avatar}</span>
            <span className="font-bold">{tx(scene.name)}</span>
          </div>
          <div className="flex h-full flex-col gap-2 bg-[#ece5dd] p-3">
            {scene.messages.map((m, i) => (
              <div
                key={i}
                className={`drop max-w-[85%] rounded-2xl px-3 py-2 text-[16px] shadow-sm ${m.me ? "self-end rounded-tr-sm bg-[#dcf8c6]" : "self-start rounded-tl-sm bg-white"}`}
                style={{ animationDelay: `${0.2 + i * 0.5}s` }}
              >
                {tx(m.text)}
              </div>
            ))}
          </div>
        </Phone>
      );

    case "web":
      return (
        <Phone danger={scene.danger}>
          {scene.danger && <DangerTag lang={lang} />}
          <div className="border-b bg-gray-100 px-3 py-2">
            <div className={`truncate rounded-full bg-white px-3 py-1.5 text-sm ${scene.danger ? "text-danger font-bold ring-2 ring-danger pulse-red" : ""}`}>
              🔒 {scene.url}
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div className="text-lg font-bold">{tx(scene.title)}</div>
            {scene.fields?.map((f, i) => (
              <div key={i} className="drop rounded-xl border-2 border-gray-200 px-3 py-2 text-gray-500" style={{ animationDelay: `${0.3 + i * 0.3}s` }}>
                {tx(f)}
              </div>
            ))}
            {scene.fields && <div className="rounded-xl bg-sky py-2 text-center font-bold text-white">OK</div>}
          </div>
        </Phone>
      );

    case "listing":
      return (
        <Phone danger={scene.danger}>
          {scene.danger && <DangerTag lang={lang} />}
          <div className="grid h-40 place-items-center bg-amber-50 text-7xl">{scene.icon}</div>
          <div className="space-y-1 p-4">
            <div className="text-lg font-bold">{tx(scene.title)}</div>
            <div className="text-2xl font-extrabold text-safe">{scene.price}</div>
            <div className="text-muted">👤 {tx(scene.seller)}</div>
          </div>
        </Phone>
      );

    case "bank":
      return (
        <Phone>
          <div className="bg-sky px-4 py-6 text-white">
            <div className="text-sm text-white/80">{lang === "kk" ? "Менің картам" : "Моя карта"}</div>
            <div className="text-4xl font-extrabold">{scene.balance}</div>
          </div>
          <div className="space-y-3 p-4">
            {scene.delta && (
              <div className="drop delay-1 flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
                <span>{scene.note ? tx(scene.note) : ""}</span>
                <span className="text-xl font-extrabold text-danger">{scene.delta}</span>
              </div>
            )}
            {!scene.delta && scene.note && <div className="text-muted">{tx(scene.note)}</div>}
          </div>
        </Phone>
      );

    case "flags":
      return (
        <div className="space-y-3 py-4">
          {scene.items.map((f, i) => (
            <div
              key={i}
              className="pop flex items-center gap-4 rounded-2xl border-l-8 border-danger bg-white px-4 py-4 shadow-sm"
              style={{ animationDelay: `${i * 0.6}s` }}
            >
              <span className="text-4xl">{f.icon}</span>
              <span className="text-xl font-bold">{tx(f.text)}</span>
            </div>
          ))}
        </div>
      );

    case "rule":
      return (
        <div className={`pop mx-auto flex max-w-[320px] flex-col items-center gap-4 rounded-[28px] px-6 py-8 text-center text-white shadow-lg ${scene.good === false ? "bg-danger" : "bg-safe"}`}>
          <div className="text-7xl">{scene.icon}</div>
          <div className="text-2xl font-extrabold leading-tight">{tx(scene.text)}</div>
        </div>
      );
  }
}

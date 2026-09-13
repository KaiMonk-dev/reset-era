// RESET ERA — spec §2-3 data + plan generator
// Source of truth: Truth-Vault 02-Work/reset-era-product-spec.md v1.0

export type TonePackId = "breakup" | "winter" | "streak" | "fresh";
export type AnchorId = "phone" | "gym" | "sleep" | "money";
export type Intensity = 15 | 30 | 60;

export const ARC_DAYS = 7; // V0 = 7-day Lock-In mini-arc (21 quests)

export const TONE_PACKS: Record<TonePackId, { label: string; blurb: string }> = {
  breakup: {
    label: "Breakup / rejection",
    blurb: "Turn the worst week into the best decision you ever made.",
  },
  winter: {
    label: "Winter arc",
    blurb: "The Great Lock-In runs to Dec 31. Most fold in December. Not you.",
  },
  streak: {
    label: "Failed a streak",
    blurb: "One miss never ended the arc. The comeback starts now.",
  },
  fresh: {
    label: "Fresh start",
    blurb: "New season. New standard. Locked in.",
  },
};

export const ANCHORS: Record<
  AnchorId,
  { label: string; enemy: string; quests: [string, string]; details: [string, string] }
> = {
  phone: {
    label: "Phone / screen time",
    enemy: "the scroll",
    quests: ["Screen-time check-in", "Phone out of bedroom"],
    details: [
      "Check yesterday's screen time. Compare it to your goal. Log the honest number below.",
      "Tonight, the phone charges outside the bedroom. Alarm goes off somewhere you have to stand up.",
    ],
  },
  gym: {
    label: "Gym consistency",
    enemy: "the skip",
    quests: ["Log your session", "Off-day movement"],
    details: [
      "Train: beginner full-body. Log the session — sets, reps, honest effort.",
      "No session today. Hit your step goal instead. Movement is the standard, not motivation.",
    ],
  },
  sleep: {
    label: "Sleep schedule",
    enemy: "the 2am scroll",
    quests: ["Hit your in-bed window", "Wake within ±30 min"],
    details: [
      "In bed by your window tonight. No negotiation, no 'one more video'.",
      "Wake within 30 minutes of your target time. Feet on the floor, lights on.",
    ],
  },
  money: {
    label: "Spending",
    enemy: "the impulse buy",
    quests: ["No-spend day", "Daily spend report"],
    details: [
      "Zero discretionary spend today. Needs only. The arc doesn't cost money — it saves it.",
      "Log every dollar you spent today. Awareness kills the impulse.",
    ],
  },
};

export const SUPPORT_POOL: { title: string; detail: string }[] = [
  { title: "Water goal", detail: "Drink your daily water target. Bottle on the desk." },
  { title: "Protein hit", detail: "Hit today's protein target. Eat like someone who trains." },
  { title: "10-min sunlight walk", detail: "Ten minutes outside. No headphones required." },
  { title: "10 pages", detail: "Read 10 pages of a real book. Input for the rebuild." },
  { title: "Cold shower", detail: "30 seconds cold at the end. You know why." },
  { title: "5-min room reset", detail: "Your space is your score. Five minutes, surfaces clear." },
  {
    title: "One-line journal",
    detail: "One line: what would Day-30 you respect about today?",
  },
  { title: "Stretch", detail: "Five minutes, full body. Future you moves better." },
  { title: "No-phone first 30 min", detail: "First 30 minutes of the day are yours, not the feed's." },
  { title: "Bed made", detail: "First win of the day takes 60 seconds." },
];

// Q3: time available scales quest intensity → detail copy suffix
export const INTENSITY_COPY: Record<Intensity, string> = {
  15: "15-minute version: minimum viable rep. Done counts.",
  30: "30-minute version: the standard rep.",
  60: "60+ minute version: full send. You said you had the time.",
};

// Q5: identity → plan name + notification hook
export function makeHook(identity: string): string {
  const trimmed = identity.trim();
  if (!trimmed) return "The guy who doesn't skip today.";
  return `The guy who ${trimmed.toLowerCase().replace(/^the guy who /i, "")} doesn't skip today.`;
}

export function makePlanName(identity: string, tone: TonePackId): string {
  const t = identity.trim();
  if (t) return t.length > 42 ? t.slice(0, 42) : t;
  return TONE_PACKS[tone].label + " reset";
}

// Deterministic daily quest set: anchor (alternates its two actions by day) + 2 supports
export interface DayQuest {
  slot: "anchor" | "support1" | "support2";
  title: string;
  detail: string;
}

export function questsForDay(day: number, anchor: AnchorId, intensity: Intensity): DayQuest[] {
  const d = ((day - 1) % ARC_DAYS + ARC_DAYS) % ARC_DAYS; // 0-based within arc
  const a = ANCHORS[anchor];
  const anchorQuest: DayQuest = {
    slot: "anchor",
    title: a.quests[d % 2],
    detail: `${a.details[d % 2]} ${INTENSITY_COPY[intensity]}`,
  };
  const s1 = SUPPORT_POOL[(d * 2) % SUPPORT_POOL.length];
  const s2 = SUPPORT_POOL[(d * 2 + 5) % SUPPORT_POOL.length];
  return [
    anchorQuest,
    { slot: "support1", title: s1.title, detail: s1.detail },
    { slot: "support2", title: s2.title, detail: s2.detail },
  ];
}

export const SEASON_BADGE = "Great Lock-In '26";

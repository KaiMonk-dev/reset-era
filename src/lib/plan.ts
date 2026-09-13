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
  { label: string; enemy: string; quests: [string, string]; details: [(i: Intensity) => string, (i: Intensity) => string] }
> = {
  phone: {
    label: "Phone / screen time",
    enemy: "the scroll",
    quests: ["Screen-time check-in", "Phone out of bedroom"],
    details: [
      (i) =>
        `Check yesterday's screen time against your goal. Log the honest number.${
          i === 60 ? " Then cut today's target by 20% — you said you had the time." : ""
        }`,
      (i) =>
        i === 15
          ? "Tonight the phone charges outside the bedroom. Alarm goes off where you have to stand up."
          : i === 30
            ? "Phone charges outside the bedroom AND no screens in bed. Book or nothing."
            : "Phone out of the room, grayscale all evening, no screens in bed. Full digital curfew.",
    ],
  },
  gym: {
    label: "Gym consistency",
    enemy: "the skip",
    quests: ["Log your session", "Off-day movement"],
    details: [
      (i) =>
        i === 15
          ? "20-minute session, no excuses: push-ups, squats, plank. Log it."
          : i === 30
            ? "Train: beginner full-body at the gym. Log the session — sets, reps, honest effort."
            : "Full gym session plus a 10-minute finisher (row/bike/incline walk). Log everything.",
      (i) =>
        i === 15
          ? "No session today. 15-minute walk, outside. Movement is the standard."
          : i === 30
            ? "No session today. Hit 8k steps. Movement is the standard, not motivation."
            : "No session today. 12k steps plus 10 minutes of stretching. The standard is high.",
    ],
  },
  sleep: {
    label: "Sleep schedule",
    enemy: "the 2am scroll",
    quests: ["Hit your in-bed window", "Wake within ±30 min"],
    details: [
      (i) =>
        i === 15
          ? "In bed by your window tonight. No negotiation, no 'one more video'."
          : i === 30
            ? "In bed by your window. Phone stays outside. No negotiation."
            : "In bed by your window, 30 minutes of wind-down first, lights out on time. Professional athlete rules.",
      (i) =>
        i === 15
          ? "Wake within 45 minutes of your target. Feet on the floor."
          : i === 30
            ? "Wake within 30 minutes of your target. Feet on the floor, lights on."
            : "Wake within 15 minutes of your target, both days this weekend. Feet on the floor, no snooze.",
    ],
  },
  money: {
    label: "Spending",
    enemy: "the impulse buy",
    quests: ["No-spend day", "Daily spend report"],
    details: [
      (i) =>
        i === 15
          ? "Zero discretionary spend today. Needs only."
          : i === 30
            ? "Zero discretionary spend today. The arc doesn't cost money — it saves it."
            : "Zero-spend day AND move the money you didn't spend into savings tonight.",
      (i) =>
        i === 15
          ? "Note every dollar you spent today. Awareness kills the impulse."
          : i === 30
            ? "Log every dollar spent today, then find one subscription to cancel."
            : "Full spend report plus a 24-hour rule on the next thing you almost bought.",
    ],
  },
};

export const SUPPORT_POOL: {
  title: string;
  detail: (i: Intensity) => string;
}[] = [
  {
    title: "Water goal",
    detail: (i) =>
      i === 15
        ? "2L today. Bottle on the desk, empty before dinner."
        : i === 30
          ? "3L today. Bottle on the desk, empty before dinner."
          : "A gallon today. Bottle never leaves your hand.",
  },
  {
    title: "Protein hit",
    detail: (i) =>
      i === 15
        ? "Hit your protein floor. One clean meal does most of it."
        : i === 30
          ? "Hit your protein target. Eat like someone who trains."
          : "Protein at every meal. Weigh it if you're serious.",
  },
  {
    title: "10-min sunlight walk",
    detail: (i) =>
      i === 15
        ? "Ten minutes outside, no headphones. Eyes off the screen."
        : i === 30
          ? "Twenty minutes outside, no headphones. Morning light if possible."
          : "Thirty-plus outside. Walk like it's a meeting with yourself.",
  },
  {
    title: "10 pages",
    detail: (i) =>
      i === 15
        ? "5 pages of a real book. Input for the rebuild."
        : i === 30
          ? "10 pages of a real book. Input for the rebuild."
          : "20+ pages. The feed is someone else's brain; this is yours.",
  },
  {
    title: "Cold shower",
    detail: () => "30 seconds cold at the end. You know why.",
  },
  {
    title: "5-min room reset",
    detail: (i) =>
      i === 15
        ? "Five minutes. Bed, desk, floor. Your space is your score."
        : i === 30
          ? "Ten minutes. Bed, desk, floor, laundry. Your space is your score."
          : "Full reset. Your room should look like a Day-30 guy lives in it.",
  },
  {
    title: "One-line journal",
    detail: () => "One line: what would Day-30 you respect about today?",
  },
  {
    title: "Stretch",
    detail: (i) =>
      i === 15
        ? "Five minutes, full body. Future you moves better."
        : i === 30
          ? "Ten minutes, hips and shoulders. Future you moves better."
          : "Fifteen minutes, full session. Mobility is a weapon.",
  },
  {
    title: "No-phone first 30 min",
    detail: (i) =>
      i === 15
        ? "First 30 minutes of the day are yours, not the feed's."
        : i === 30
          ? "First hour of the day is yours, not the feed's."
          : "No phone until your anchor is done. Non-negotiable.",
  },
  {
    title: "Bed made",
    detail: () => "First win of the day takes 60 seconds.",
  },
];

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

// Q3 quiz copy (the engine scales quest details individually)
export const INTENSITY_COPY: Record<Intensity, string> = {
  15: "Minimum viable rep. Done counts.",
  30: "The standard rep.",
  60: "Full send. You said you had the time.",
};

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
    detail: a.details[d % 2](intensity),
  };
  const s1 = SUPPORT_POOL[(d * 2) % SUPPORT_POOL.length];
  const s2 = SUPPORT_POOL[(d * 2 + 5) % SUPPORT_POOL.length];
  return [
    anchorQuest,
    { slot: "support1", title: s1.title, detail: s1.detail(intensity) },
    { slot: "support2", title: s2.title, detail: s2.detail(intensity) },
  ];
}

export const SEASON_BADGE = "Great Lock-In '26";

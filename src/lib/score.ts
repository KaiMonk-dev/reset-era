// RESET ERA — spec §4: Momentum Score + stat bars (transparent, shown on card)
import { ARC_DAYS } from "./plan";
import type { AnchorId } from "./plan";
import type { QuestLog } from "./store";

export interface Score {
  momentum: number; // 0-100
  streak: number; // current consecutive day-locked streak
  comebackBonus: number;
  bars: { discipline: number; strength: number; focus: number; sleep: number; money: number };
}

// momentum = (completions last 7d ÷ 21) × 70 + streak bonus ≤20 + comeback bonus ≤10
export function computeScore(
  log: QuestLog,
  anchor: AnchorId,
  todayDay: number,
  comebackDone: number,
): Score {
  const cappedDay = Math.min(todayDay, ARC_DAYS);
  let completions = 0;
  let streak = 0;
  for (let d = 1; d <= cappedDay; d++) {
    const slots = ["anchor", "support1", "support2"] as const;
    const done = slots.filter((s) => log[`${d}-${s}`]).length;
    completions += done;
    if (done === 3) streak += 1;
    else if (d < todayDay) streak = 0; // past incomplete days break the streak; today (unfinished) never does
  }
  // streak bonus: +3 per locked day, cap 20
  const streakBonus = Math.min(20, streak * 3);
  const comebackB = Math.min(10, comebackDone * 5);
  const momentum = Math.round((completions / (ARC_DAYS * 3)) * 70 + streakBonus + comebackB);

  // stat bars — honest, derived from related quest completions vs arc length
  const rate = (n: number) => Math.round((n / ARC_DAYS) * 100);
  const phoneCount = countAnchorActions(log, anchor, "phone");
  const gymCount = countAnchorActions(log, anchor, "gym");
  const sleepCount = countAnchorActions(log, anchor, "sleep");
  const moneyCount = countAnchorActions(log, anchor, "money");
  const bars = {
    discipline: Math.round((completions / (ARC_DAYS * 3)) * 100),
    strength: rate(gymCount),
    focus: rate(phoneCount),
    sleep: rate(sleepCount),
    money: rate(moneyCount),
  };
  return { momentum: Math.min(100, momentum), streak, comebackBonus: comebackB, bars };
}

function countAnchorActions(log: QuestLog, chosen: AnchorId, barAnchor: AnchorId): number {
  if (chosen !== barAnchor) return 0;
  let n = 0;
  for (let d = 1; d <= ARC_DAYS; d++) {
    if (log[`${d}-anchor`]) n += 1;
  }
  return n;
}

// RESET ERA — day helpers (local-time day keys)
import { ARC_DAYS } from "./plan";
import { useEra } from "./store";

export function arcStartDay(profile: { startedAt: number }): number {
  const start = new Date(profile.startedAt);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((now.getTime() - start.getTime()) / 86_400_000);
  return diff + 1; // Day 1 = start day
}

export interface DayState {
  day: number; // current arc day (1-based), capped at ARC_DAYS
  missedYesterday: boolean;
  complete: boolean; // arc finished
  dayLocked: boolean; // all 3 quests done today
}

export function dayState(profile: { startedAt: number }): DayState {
  const raw = arcStartDay(profile);
  if (raw > ARC_DAYS) {
    return { day: ARC_DAYS, missedYesterday: false, complete: true, dayLocked: false };
  }
  const day = Math.max(1, raw);
  const { log } = useEra.getState();
  const slots = ["anchor", "support1", "support2"] as const;
  const doneYesterday =
    day > 1 ? slots.filter((s) => log[`${day - 1}-${s}`]).length === 3 : true;
  const doneToday = slots.filter((s) => log[`${day}-${s}`]).length === 3;
  return {
    day,
    missedYesterday: !doneYesterday && day > 1,
    complete: false,
    dayLocked: doneToday,
  };
}

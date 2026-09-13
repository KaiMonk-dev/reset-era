// RESET ERA — analytics: PostHog if EXPO_PUBLIC_POSTHOG_KEY present, console-gated otherwise.
// V0 gate events (spec §6): 60% D1 complete · 35% D7 return · 25% complete 15/21 · 15% share.
const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

type GateEvent =
  | "quiz_started"
  | "quiz_completed"
  | "plan_created"
  | "quest_completed"
  | "day_locked"
  | "comeback_used"
  | "share_card"
  | "reminder_captured"
  | "price_reveal_cta";

let posthog: any | null = null;
let initTried = false;

async function client(): Promise<any | null> {
  if (!KEY) return null;
  if (initTried) return posthog;
  initTried = true;
  try {
    const mod = await import("posthog-js");
    posthog = mod.default.init(KEY, { api_host: HOST, autocapture: false, capture_pageview: false });
  } catch {
    posthog = null;
  }
  return posthog;
}

export function track(event: GateEvent, props?: Record<string, unknown>): void {
  if (!KEY) {
    console.debug(`[gate] ${event}`, props ?? "");
    return;
  }
  void client().then((ph) => ph?.capture(event, props));
}

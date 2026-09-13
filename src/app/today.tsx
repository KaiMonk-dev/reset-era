import { Redirect, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { track } from "@/lib/analytics";
import { dayState } from "@/lib/days";
import { ANCHORS, questsForDay, TONE_PACKS } from "@/lib/plan";
import { computeScore } from "@/lib/score";
import { useEra } from "@/lib/store";

const SLOTS = ["anchor", "support1", "support2"] as const;

export default function Today() {
  const router = useRouter();
  const profile = useEra((s) => s.profile);
  const log = useEra((s) => s.log);
  const hydrated = useEra((s) => s.hydrated);
  const completeQuest = useEra((s) => s.completeQuest);
  const uncompleteQuest = useEra((s) => s.uncompleteQuest);
  const comebackDone = profile?.comebackDone ?? 0;

  if (!hydrated) return null;
  if (!profile) return <Redirect href="/quiz" />;

  const state = dayState(profile);
  if (state.complete) return <Redirect href="/card?final=1" />;

  const quests = questsForDay(state.day, profile.anchor, profile.intensity);
  const score = computeScore(log, profile.anchor, state.day, comebackDone);
  const comeback = state.missedYesterday && !log[`${state.day}-anchor`];

  const visibleQuests = comeback ? quests.filter((q) => q.slot === "anchor") : quests;
  const doneToday = SLOTS.filter((s) => log[`${state.day}-${s}`]).length;
  const allDone = comeback ? !!log[`${state.day}-anchor`] : doneToday === 3;

  return (
    <ScrollView contentContainerClassName="min-h-full bg-ink px-6 pb-24 pt-16">
      {/* header: days-locked + momentum */}
      <View className="mb-6 flex-row items-end justify-between">
        <View>
          <Text className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
            {TONE_PACKS[profile.tone].label} · {profile.planName}
          </Text>
          <Text className="mt-1 text-5xl font-black text-white">
            Day {state.day}
            <Text className="text-xl text-zinc-600"> / 30</Text>
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-4xl font-black text-gold">{score.momentum}</Text>
          <Text className="text-[10px] uppercase tracking-widest text-zinc-500">momentum</Text>
        </View>
      </View>

      {/* comeback banner (spec §3: never zero-out, never shame) */}
      {comeback && (
        <View className="mb-6 rounded-xl border border-gold/40 bg-gold/10 p-4">
          <Text className="text-sm font-bold text-gold">Comeback quest</Text>
          <Text className="mt-1 text-sm text-zinc-300">
            Missed a day. One quest. That's it. The arc continues.
          </Text>
        </View>
      )}

      {/* quests */}
      <View className="gap-3">
        {visibleQuests.map((q) => {
          const key = `${state.day}-${q.slot}`;
          const done = !!log[key];
          return (
            <Pressable
              key={key}
              onPress={() => {
                if (done) {
                  uncompleteQuest(state.day, q.slot);
                } else {
                  completeQuest(state.day, q.slot);
                  track("quest_completed", { day: state.day, slot: q.slot, anchor: profile.anchor });
                  if (comeback && q.slot === "anchor") track("comeback_used", { day: state.day });
                  const nextDone = comeback
                    ? true
                    : SLOTS.filter((s) => log[`${state.day}-${s}`] || s === q.slot).length;
                  if (!comeback && nextDone === 3) track("day_locked", { day: state.day });
                  if (comeback) track("day_locked", { day: state.day, comeback: true });
                }
              }}
              className={`rounded-xl border p-4 ${done ? "border-ember/60 bg-ember/10" : "border-line bg-panel/60"}`}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className={`h-6 w-6 items-center justify-center rounded-md border ${
                    done ? "border-ember bg-ember" : "border-line"
                  }`}
                >
                  {done && <Text className="text-xs font-black text-ink">✓</Text>}
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-semibold ${done ? "text-zinc-400 line-through" : "text-white"}`}
                  >
                    {q.title}
                  </Text>
                  <Text className="mt-1 text-xs leading-4 text-zinc-500">{q.detail}</Text>
                </View>
                {q.slot === "anchor" && (
                  <Text className="text-[9px] font-bold uppercase tracking-widest text-ember">
                    anchor
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* locked state / day-7 CTA */}
      {allDone && (
        <View className="mt-8 rounded-xl border border-ember/40 bg-ember/10 p-5">
          <Text className="text-base font-bold text-white">
            Day {state.day} locked. {score.streak > 1 ? `${score.streak} days straight.` : "It counts."}
          </Text>
          <Text className="mt-1 text-sm text-zinc-400">{profile.hook}</Text>
          {state.day === 7 ? (
            <Pressable
              onPress={() => router.push("/card?final=1")}
              className="mt-4 rounded-xl bg-ember py-4"
            >
              <Text className="text-center text-base font-bold text-white">
                Get your Day-7 card →
              </Text>
            </Pressable>
          ) : (
            <Text className="mt-2 text-xs text-zinc-500">
              Next quest drops at {profile.wakeTime}. See you then.
            </Text>
          )}
        </View>
      )}

      {/* footer nav */}
      <View className="mt-10 flex-row justify-between">
        <Pressable onPress={() => router.push("/card")} className="py-3">
          <Text className="text-sm text-zinc-400">Stat card</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/reminder")} className="py-3">
          <Text className="text-sm text-zinc-400">Reminders</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

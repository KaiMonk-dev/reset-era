import { Redirect, useRouter } from "expo-router";
import { MotiView } from "moti";
import { Pressable, ScrollView, View } from "react-native";
import { Check, ChevronRight, Flame, MoonStar } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { anchorQuestIcon, supportIcon } from "@/components/quest-icon";
import { track } from "@/lib/analytics";
import { dayState } from "@/lib/days";
import { tap, success } from "@/lib/haptics";
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
    <ScrollView contentContainerClassName="min-h-full bg-background px-5 pb-16 pt-14">
      {/* header */}
      <View className="mb-7 flex-row items-end justify-between">
        <View>
          <Text className="font-display text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            {TONE_PACKS[profile.tone].label}
          </Text>
          <View className="mt-1.5 flex-row items-baseline">
            <Text className="font-displayBold text-[44px] leading-[48px] text-foreground">
              Day {state.day}
            </Text>
            <Text className="ml-2 font-display text-[15px] text-muted-foreground">of 30</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="font-displayBold text-[38px] leading-[40px] text-gold">
            {score.momentum}
          </Text>
          <Text className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            momentum
          </Text>
        </View>
      </View>

      {/* comeback banner (spec §3: never zero-out, never shame) */}
      {comeback && (
        <MotiView
          from={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 rounded-lg border border-gold/40 bg-gold/10 p-4"
        >
          <Text className="font-bodyBold text-[14px] text-gold">Comeback quest</Text>
          <Text className="mt-1 font-body text-[13px] text-foreground/80">
            Missed a day. One quest. That's it. The arc continues.
          </Text>
        </MotiView>
      )}

      {/* quests */}
      <View className="gap-3">
        {visibleQuests.map((q, i) => {
          const key = `${state.day}-${q.slot}`;
          const done = !!log[key];
          const Icon =
            q.slot === "anchor"
              ? anchorQuestIcon(profile.anchor, q.title)
              : supportIcon(q.title);
          const isAnchor = q.slot === "anchor";
          const iconColor = done
            ? "hsl(240 8% 45%)"
            : isAnchor
              ? "hsl(16 100% 56%)"
              : "hsl(40 100% 59%)";
          return (
            <MotiView
              key={key}
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 200, delay: 80 + i * 90 }}
            >
              <Pressable
                onPress={() => {
                  if (done) {
                    uncompleteQuest(state.day, q.slot);
                  } else {
                    completeQuest(state.day, q.slot);
                    tap();
                    track("quest_completed", { day: state.day, slot: q.slot, anchor: profile.anchor });
                    if (comeback && q.slot === "anchor") {
                      track("comeback_used", { day: state.day });
                      success();
                    }
                    const nextDone = comeback
                      ? true
                      : SLOTS.filter((s) => log[`${state.day}-${s}`] || s === q.slot).length;
                    if (!comeback && nextDone === 3) {
                      track("day_locked", { day: state.day });
                      success();
                    }
                    if (comeback) track("day_locked", { day: state.day, comeback: true });
                  }
                }}
                className={`flex-row items-center rounded-lg border p-4 ${
                  done ? "border-border bg-card/40" : "border-border bg-card"
                }`}
              >
                <View
                  className={`mr-3.5 h-10 w-10 items-center justify-center rounded-lg ${
                    done ? "bg-secondary/50" : isAnchor ? "bg-primary/15" : "bg-gold/10"
                  }`}
                >
                  <Icon size={19} color={iconColor} strokeWidth={2.2} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-bodyMedium text-[15px] ${
                      done ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {q.title}
                  </Text>
                  <Text className="mt-0.5 font-body text-[12px] leading-[16px] text-muted-foreground">
                    {q.detail}
                  </Text>
                </View>
                <View
                  className={`ml-2 h-6 w-6 items-center justify-center rounded-full border ${
                    done ? "border-primary bg-primary" : "border-border"
                  }`}
                >
                  {done && <Check size={14} color="hsl(240 15% 6%)" strokeWidth={3} />}
                </View>
              </Pressable>
            </MotiView>
          );
        })}
      </View>

      {/* locked state / day-7 CTA */}
      {allDone && (
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="mt-6 rounded-lg border border-primary/40 bg-primary/10 p-5"
        >
          <View className="flex-row items-center gap-2">
            <Flame size={17} color="hsl(16 100% 56%)" />
            <Text className="font-bodyBold text-[15px] text-foreground">
              Day {state.day} locked.{" "}
              {score.streak > 1 ? `${score.streak} days straight.` : "It counts."}
            </Text>
          </View>
          <Text className="mt-1.5 font-body text-[13px] italic text-muted-foreground">
            "{profile.hook}"
          </Text>
          {state.day === 7 ? (
            <Button onPress={() => router.push("/card?final=1")} className="mt-4 h-11 rounded-lg">
              <Text className="font-bodyBold text-[14px] text-primary-foreground">
                Get your Day-7 card
              </Text>
              <ChevronRight size={16} color="hsl(240 15% 6%)" />
            </Button>
          ) : (
            <View className="mt-3 flex-row items-center gap-1.5">
              <MoonStar size={13} color="hsl(240 8% 45%)" />
              <Text className="font-body text-[12px] text-muted-foreground">
                Next quest drops at {profile.wakeTime}. See you then.
              </Text>
            </View>
          )}
        </MotiView>
      )}

      {/* arc progress strip */}
      <View className="mt-8">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Week one · foundation
          </Text>
          <Text className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {doneToday}/3 today
          </Text>
        </View>
        <View className="flex-row gap-1.5">
          {Array.from({ length: 7 }, (_, i) => {
            const d = i + 1;
            const slots = SLOTS.filter((s) => log[`${d}-${s}`]).length;
            const passed = d < state.day || (d === state.day && slots === 3);
            const partial = d === state.day && slots > 0 && slots < 3;
            return (
              <View
                key={d}
                className={`h-1.5 flex-1 rounded-full ${
                  slots === 3
                    ? "bg-primary"
                    : partial
                      ? "bg-primary/40"
                      : passed
                        ? "bg-gold/50"
                        : "bg-secondary"
                }`}
              />
            );
          })}
        </View>
      </View>

      <View className="mt-8 flex-row items-center">
        <Pressable onPress={() => router.push("/card")} className="flex-1 py-2">
          <Text className="font-bodyMedium text-[13px] text-muted-foreground">Stat card</Text>
        </Pressable>
        <Separator orientation="vertical" className="h-4" />
        <Pressable onPress={() => router.push("/reminder")} className="flex-1 items-end py-2">
          <Text className="font-bodyMedium text-[13px] text-muted-foreground">Reminders</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

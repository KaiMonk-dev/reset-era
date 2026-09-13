import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import ViewShot, { type ViewShotRef } from "react-native-view-shot";
import { track } from "@/lib/analytics";
import { SEASON_BADGE, ARC_DAYS } from "@/lib/plan";
import { computeScore } from "@/lib/score";
import { useEra } from "@/lib/store";
import { exportCard } from "@/lib/share";

const BAR_LABELS = {
  discipline: "Discipline",
  strength: "Strength",
  focus: "Focus",
  sleep: "Sleep",
  money: "Money",
} as const;

export default function Card() {
  const router = useRouter();
  const { final } = useLocalSearchParams<{ final?: string }>();
  const profile = useEra((s) => s.profile);
  const log = useEra((s) => s.log);
  const cardRef = useRef<ViewShotRef>(null);

  if (!profile) return null;
  const isFinal = final === "1";
  const day = isFinal ? ARC_DAYS : Math.min(ARC_DAYS, Math.max(1, dayNum(profile.startedAt)));
  const score = computeScore(log, profile.anchor, day, profile.comebackDone);
  const alias = profile.alias || "LOCKED IN";

  return (
    <ScrollView contentContainerClassName="min-h-full items-center bg-ink px-6 pb-20 pt-16">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-ember">
        {isFinal ? "Day 7 · Arc complete" : "Your stat card"}
      </Text>
      <Text className="mb-8 text-center text-2xl font-bold text-white">
        {isFinal
          ? "Seven days. The bars moved because you did."
          : "This is the honest screenshot nobody else has."}
      </Text>

      <ViewShot ref={cardRef} options={{ format: "png", quality: 1 }}>
        <View className="w-[340px] rounded-2xl border border-line bg-panel p-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
              {SEASON_BADGE}
            </Text>
            <Text className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Day {day}
            </Text>
          </View>

          <Text className="mt-6 text-6xl font-black text-gold">{score.momentum}</Text>
          <Text className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            momentum score
          </Text>

          <View className="mt-6 gap-4">
            {(Object.keys(BAR_LABELS) as (keyof typeof BAR_LABELS)[]).map((k) => (
              <View key={k}>
                <View className="mb-1 flex-row justify-between">
                  <Text className="text-xs font-semibold text-zinc-300">{BAR_LABELS[k]}</Text>
                  <Text className="text-xs text-zinc-500">{score.bars[k]}</Text>
                </View>
                <View className="h-2 w-full rounded bg-line">
                  <View
                    className="h-2 rounded bg-ember"
                    style={{ width: `${Math.min(100, score.bars[k])}%` }}
                  />
                </View>
              </View>
            ))}
          </View>

          <View className="mt-6 flex-row justify-between border-t border-line pt-4">
            <View>
              <Text className="text-[9px] uppercase tracking-widest text-zinc-600">streak</Text>
              <Text className="text-lg font-bold text-white">{score.streak}d</Text>
            </View>
            <View>
              <Text className="text-[9px] uppercase tracking-widest text-zinc-600">comebacks</Text>
              <Text className="text-lg font-bold text-white">{score.comebackBonus / 5}</Text>
            </View>
            <View>
              <Text className="text-[9px] uppercase tracking-widest text-zinc-600">alias</Text>
              <Text className="text-lg font-bold text-white">{alias}</Text>
            </View>
          </View>

          <Text className="mt-6 text-center text-[9px] uppercase tracking-[0.3em] text-zinc-600">
            reset era · v0 · real actions only
          </Text>
        </View>
      </ViewShot>

      <Pressable
        onPress={async () => {
          const ok = await exportCard(cardRef.current, `reset-era-day${day}.png`);
          if (ok) track("share_card", { card: isFinal ? "day7" : "stat" });
        }}
        className="mt-8 rounded-xl border border-line bg-panel px-8 py-4"
      >
        <Text className="text-base font-semibold text-white">Save card (PNG)</Text>
      </Pressable>

      {isFinal && (
        <View className="mt-10 w-full rounded-xl border border-gold/40 bg-gold/10 p-5">
          <Text className="text-base font-bold text-white">Want the full 30-day program?</Text>
          <Text className="mt-1 text-sm text-zinc-300">
            Seasons, all eras, every card. $9.99/mo or $39.99/yr when it ships.
          </Text>
          <Pressable
            onPress={() => track("price_reveal_cta", { placement: "day7-final" })}
            className="mt-4 rounded-xl bg-gold py-4"
          >
            <Text className="text-center text-base font-bold text-ink">
              Tell me when it's live →
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={() => router.push("/today")} className="mt-8 py-3">
        <Text className="text-sm text-zinc-400">← Back to today</Text>
      </Pressable>
    </ScrollView>
  );
}

function dayNum(startedAt: number): number {
  const start = new Date(startedAt);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((now.getTime() - start.getTime()) / 86_400_000) + 1;
}

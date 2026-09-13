import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Redirect } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import ViewShot, { type ViewShotRef } from "react-native-view-shot";
import { ArrowLeft, ArrowRight, Flame, Share, TrendingUp } from "lucide-react-native";
import { MotiView } from "moti";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { track } from "@/lib/analytics";
import { ARC_DAYS, SEASON_BADGE } from "@/lib/plan";
import { tap } from "@/lib/haptics";
import { computeScore } from "@/lib/score";
import { useEra } from "@/lib/store";
import { exportCard } from "@/lib/share";

const BARS = [
  { key: "discipline", label: "Discipline", colorClass: "bg-foreground" },
  { key: "strength", label: "Strength", colorClass: "bg-foreground/75" },
  { key: "focus", label: "Focus", colorClass: "bg-foreground/55" },
  { key: "sleep", label: "Sleep", colorClass: "bg-foreground/40" },
  { key: "money", label: "Money", colorClass: "bg-foreground/25" },
] as const;

export default function Card() {
  const router = useRouter();
  const { final } = useLocalSearchParams<{ final?: string }>();
  const profile = useEra((s) => s.profile);
  const log = useEra((s) => s.log);
  const setProfile = useEra((s) => s.setProfile);
  const reset = useEra((s) => s.reset);
  const cardRef = useRef<ViewShotRef>(null);
  const [shared, setShared] = useState(false);

  if (!profile) return <Redirect href="/quiz" />;
  const isFinal = final === "1";
  const day = isFinal ? ARC_DAYS : Math.min(ARC_DAYS, Math.max(1, dayNum(profile.startedAt)));
  const score = computeScore(log, profile.anchor, day, profile.comebackDone);
  const alias = profile.alias || "LOCKED IN";

  return (
    <ScrollView contentContainerClassName="min-h-full items-center bg-background px-5 pb-14 pt-14 pt-safe">
      <Text className="mb-2 font-display text-[11px] font-medium uppercase tracking-[0.35em] text-primary">
        {isFinal ? "Day 7 · Arc complete" : "Your stat card"}
      </Text>
      <Text className="mb-7 text-center font-body text-[14px] text-muted-foreground">
        {isFinal
          ? "Day 1 → Day 7. The numbers moved because you did."
          : "This is the honest screenshot nobody else has."}
      </Text>

      <MotiView
        from={{ opacity: 0, translateY: 20, scale: 0.98 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 190 }}
      >
        <ViewShot ref={cardRef} options={{ format: "png", quality: 1 }}>
          <LinearGradient
            colors={["hsl(240 15% 7%)", "hsl(242 20% 11%)", "hsl(246 22% 6%)"]}
            style={{ width: 340, borderRadius: 16, borderWidth: 1, borderColor: "hsl(240 11% 17%)" }}
          >
            <View className="w-full rounded-2xl p-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <Flame size={11} color="hsl(0 0% 96%)" />
                  <Text className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {SEASON_BADGE}
                  </Text>
                </View>
                <Text className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Day {day}
                </Text>
              </View>

              {/* momentum — the number */}
              {isFinal ? (
                <View className="mt-5">
                  <Text className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    momentum · day 1 → day {day}
                  </Text>
                  <View className="mt-2 flex-row items-baseline gap-3">
                    <Text className="font-displayBold text-[40px] leading-[44px] text-muted-foreground/40">
                      0
                    </Text>
                    <ArrowRight size={20} color="hsl(0 0% 58%)" />
                    <Text
                      className="font-displayBold text-[56px] leading-[56px] text-foreground"
                      style={{
                        shadowColor: "hsl(0 0% 96%)",
                        shadowOpacity: 0.35,
                        shadowRadius: 20,
                        shadowOffset: { width: 0, height: 0 },
                      }}
                    >
                      {score.momentum}
                    </Text>
                  </View>
                  <View className="mt-1.5 flex-row items-center gap-1">
                    <TrendingUp size={11} color="hsl(0 0% 58%)" />
                    <Text className="font-body text-[11px] text-muted-foreground">
                      streak {score.streak}d · {score.comebackBonus / 5} comebacks
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="mt-6 flex-row items-end justify-between">
                  <View
                    style={{
                      shadowColor: "hsl(0 0% 96%)",
                      shadowOpacity: 0.55,
                      shadowRadius: 28,
                      shadowOffset: { width: 0, height: 0 },
                    }}
                  >
                    <Text className="font-displayBold text-[64px] leading-[60px] text-gold">
                      {score.momentum}
                    </Text>
                  </View>
                  <View className="items-end pb-1.5">
                    <Text className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      momentum
                    </Text>
                    <View className="mt-1 flex-row items-center gap-1">
                      <TrendingUp size={11} color="hsl(240 8% 45%)" />
                      <Text className="font-body text-[11px] text-muted-foreground">
                        streak {score.streak}d
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* stat bars / recap deltas */}
              {isFinal ? (
                <View className="mt-6 gap-2.5">
                  {BARS.map((b) => (
                    <View
                      key={b.key}
                      className="flex-row items-center justify-between border-b border-border/50 pb-2.5"
                    >
                      <Text className="font-display text-[11px] uppercase tracking-[0.15em] text-foreground/90">
                        {b.label}
                      </Text>
                      <View className="flex-row items-baseline gap-2">
                        <Text className="font-displayBold text-[15px] text-muted-foreground/40">
                          0
                        </Text>
                        <Text className="font-body text-[11px] text-muted-foreground">→</Text>
                        <Text className="font-displayBold text-[17px] text-foreground">
                          {score.bars[b.key]}
                        </Text>
                        <View className="w-6" />
                        <Text className="font-bodyMedium text-[12px] text-muted-foreground">
                          {score.bars[b.key] > 0 ? `+${score.bars[b.key]}` : "±0"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="mt-6 gap-3.5">
                  {BARS.map((b) => (
                    <View key={b.key}>
                      <View className="mb-1.5 flex-row items-center justify-between">
                        <Text className="font-display text-[11px] uppercase tracking-[0.15em] text-foreground/90">
                          {b.label}
                        </Text>
                        <Text className="font-bodyMedium text-[12px] text-muted-foreground">
                          {score.bars[b.key]}
                        </Text>
                      </View>
                      <Progress
                        value={Math.min(100, score.bars[b.key])}
                        className="h-[5px] rounded-full bg-secondary"
                        indicatorClassName={`rounded-full ${b.colorClass}`}
                      />
                    </View>
                  ))}
                </View>
              )}

              <Separator className="my-5" />

              <View className="flex-row items-end justify-between">
                <View>
                  <Text className="font-display text-[9px] uppercase tracking-[0.25em] text-muted-foreground/70">
                    alias
                  </Text>
                  <Text className="mt-0.5 font-displayBold text-[15px] text-foreground">
                    {alias}
                  </Text>
                </View>
                <View>
                  <Text className="font-display text-[9px] uppercase tracking-[0.25em] text-muted-foreground/70">
                    comebacks
                  </Text>
                  <Text className="mt-0.5 text-right font-displayBold text-[15px] text-foreground">
                    {score.comebackBonus / 5}
                  </Text>
                </View>
              </View>

              <Text className="mt-6 text-center font-display text-[9px] uppercase tracking-[0.35em] text-muted-foreground/50">
                reset era · real actions only
              </Text>
            </View>
          </LinearGradient>
        </ViewShot>
      </MotiView>

      <Pressable
        onPress={async () => {
          const result = await exportCard(cardRef.current, `reset-era-day${day}.png`);
          if (result) {
            tap();
            setShared(result === "shared");
            track("share_card", { card: isFinal ? "day7" : "stat", via: result });
          }
        }}
        className="mt-8 w-full flex-row items-center justify-center rounded-lg border border-border bg-card py-4"
      >
        <Share size={16} color="hsl(240 10% 96%)" />
        <Text className="ml-2 font-bodyMedium text-[14px] text-foreground">
          {shared ? "Shared ✓" : "Save card (PNG)"}
        </Text>
      </Pressable>

      {isFinal && (
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200, delay: 200 }}
          className="mt-8 w-full rounded-lg border border-gold/40 bg-gold/10 p-5"
        >
          <Text className="font-bodyBold text-[15px] text-foreground">
            Want the full 30-day program?
          </Text>
          <Text className="mt-1 font-body text-[13px] text-foreground/70">
            Seasons, all eras, every card. $9.99/mo or $39.99/yr when it ships.
          </Text>
          <Pressable
            onPress={() => {
              tap();
              track("price_reveal_cta", { placement: "day7-final" });
            }}
            className="mt-4 h-11 items-center justify-center rounded-lg bg-foreground"
          >
            <Text className="font-bodyBold text-[14px] text-background">
              Tell me when it's live →
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              tap();
              setProfile({ ...profile, startedAt: Date.now(), comebackDone: 0 });
              reset();
              router.replace("/today");
            }}
            className="mt-3 h-11 items-center justify-center rounded-lg border border-border"
          >
            <Text className="font-bodyMedium text-[13px] text-muted-foreground">
              Restart the week
            </Text>
          </Pressable>
        </MotiView>
      )}

      <Pressable onPress={() => router.push("/today")} className="mt-6 flex-row items-center py-2">
        <ArrowLeft size={14} color="hsl(240 8% 58%)" />
        <Text className="ml-1.5 font-bodyMedium text-[13px] text-muted-foreground">
          Back to today
        </Text>
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

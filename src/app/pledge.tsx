import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import ViewShot, { type ViewShotRef } from "react-native-view-shot";
import { Flame, Lock } from "lucide-react-native";
import { MotiView } from "moti";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { track } from "@/lib/analytics";
import { SEASON_BADGE } from "@/lib/plan";
import { tap } from "@/lib/haptics";
import { useEra } from "@/lib/store";
import { exportCard } from "@/lib/share";

export default function Pledge() {
  const router = useRouter();
  const profile = useEra((s) => s.profile);
  const setProfile = useEra((s) => s.setProfile);
  const cardRef = useRef<ViewShotRef>(null);
  const [exported, setExported] = useState(false);

  if (!profile) return null;
  const day1 = new Date(profile.startedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <ScrollView contentContainerClassName="min-h-full items-center bg-background px-5 pb-14 pt-14 pt-safe">
      <MotiView
        from={{ opacity: 0, translateY: 18 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 200 }}
        className="w-full items-center"
      >
        <Text className="mb-2 font-display text-[11px] font-medium uppercase tracking-[0.35em] text-primary">
          Day 1 · The Pledge
        </Text>
        <Text className="mb-7 text-center font-body text-[14px] text-muted-foreground">
          Screenshot this. Not for them — for Day 30 you.
        </Text>

        {/* the card — exportable */}
        <ViewShot ref={cardRef} options={{ format: "png", quality: 1 }}>
          <LinearGradient
            colors={["hsl(240 15% 7%)", "hsl(240 18% 10%)", "hsl(245 20% 6%)"]}
            style={{ width: 320, borderRadius: 16, borderWidth: 1, borderColor: "hsl(240 11% 17%)" }}
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
                  Day 1
                </Text>
              </View>

              <View className="mt-12 items-center">
                <View className="mb-5 h-11 w-11 items-center justify-center rounded-full border border-primary/50 bg-primary/15">
                  <Lock size={19} color="hsl(0 0% 96%)" />
                </View>
                <Text className="text-center font-displayBold text-[34px] leading-[36px] tracking-tight text-foreground">
                  Locked in.
                </Text>
                <Text className="text-center font-displayBold text-[34px] leading-[36px] tracking-tight text-muted-foreground/60">
                  Tell nobody.
                </Text>
              </View>

              <View className="mt-12">
                <Separator className="mb-4" />
                <Text className="text-center font-body text-[13px] text-muted-foreground">
                  Mission · <Text className="text-gold">{profile.planName}</Text>
                </Text>
                <Text className="mt-1 text-center font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  {day1} → Day 30
                </Text>
              </View>

              <View className="mt-10 flex-row items-center justify-between">
                <Text className="font-display text-[9px] uppercase tracking-[0.35em] text-muted-foreground/50">
                  reset era
                </Text>
                {profile.alias ? (
                  <Text className="font-displayBold text-[11px] tracking-[0.15em] text-foreground/80">
                    {profile.alias}
                  </Text>
                ) : null}
              </View>
            </View>
          </LinearGradient>
        </ViewShot>
      </MotiView>

      <View className="mt-8 w-full">
        <Text className="mb-2 font-body text-[13px] text-muted-foreground">
          Name on your card — an alias works. No real names needed.
        </Text>
        <TextInput
          value={profile.alias}
          onChangeText={(t) => setProfile({ ...profile, alias: t })}
          placeholder="e.g. WINTER ARC GUY"
          placeholderTextColor="hsl(240 8% 40%)"
          maxLength={20}
          autoCapitalize="characters"
          className="rounded-lg border border-input bg-card p-4 font-display text-[15px] uppercase tracking-widest text-foreground"
        />
      </View>

      <Pressable
        onPress={async () => {
          const ok = await exportCard(cardRef.current, "reset-era-day1.png");
          setExported(!!ok);
          tap();
          track("share_card", { card: "day1-pledge" });
        }}
        className="mt-7 w-full rounded-lg border border-border bg-card py-4"
      >
        <Text className="text-center font-bodyMedium text-[14px] text-foreground">
          {exported ? "Saved ✓" : "Save pledge card"}
        </Text>
      </Pressable>

      <Button
        onPress={() => router.push("/reminder")}
        className="mt-3 h-12 w-full rounded-lg"
      >
        <Text className="font-bodyBold text-[15px] text-primary-foreground">Continue</Text>
      </Button>
    </ScrollView>
  );
}

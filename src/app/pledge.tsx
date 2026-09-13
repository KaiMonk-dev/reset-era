import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import ViewShot, { type ViewShotRef } from "react-native-view-shot";
import { track } from "@/lib/analytics";
import { SEASON_BADGE } from "@/lib/plan";
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
    year: "numeric",
  });

  return (
    <ScrollView contentContainerClassName="min-h-full items-center bg-ink px-6 pb-16 pt-16">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-ember">
        Day 1 · The Pledge
      </Text>
      <Text className="mb-8 text-center text-2xl font-bold text-white">
        Screenshot this. Not for them — for Day 30 you.
      </Text>

      <ViewShot ref={cardRef} options={{ format: "png", quality: 1 }}>
        <View className="w-[320px] rounded-2xl border border-line bg-panel p-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
              {SEASON_BADGE}
            </Text>
            <Text className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Day 1
            </Text>
          </View>
          <Text className="mt-10 text-center text-4xl font-black leading-tight text-white">
            Locked in.
          </Text>
          <Text className="mt-2 text-center text-4xl font-black text-zinc-600">
            Tell nobody.
          </Text>
          <View className="mt-10 gap-2">
            <Text className="text-center text-sm text-zinc-400">
              Mission: <Text className="text-gold">{profile.planName}</Text>
            </Text>
            <Text className="text-center text-xs text-zinc-500">{day1} → Day 30</Text>
          </View>
          <Text className="mt-10 text-center text-[9px] uppercase tracking-[0.3em] text-zinc-600">
            reset era · v0
          </Text>
        </View>
      </ViewShot>

      <View className="mt-8 w-full">
        <Text className="mb-2 text-sm text-zinc-400">
          Name on your card — an alias works. No real names needed.
        </Text>
        <TextInput
          value={profile.alias}
          onChangeText={(t) => setProfile({ ...profile, alias: t })}
          placeholder="e.g. WINTER ARC GUY"
          placeholderTextColor="#5A5A66"
          maxLength={20}
          autoCapitalize="characters"
          className="rounded-xl border border-line bg-panel p-4 text-base text-white"
        />
      </View>

      <Pressable
        onPress={async () => {
          const ok = await exportCard(cardRef.current, "reset-era-day1.png");
          setExported(!!ok);
          track("share_card", { card: "day1-pledge" });
        }}
        className="mt-8 rounded-xl border border-line bg-panel px-8 py-4"
      >
        <Text className="text-base font-semibold text-white">
          {exported ? "Saved ✓" : "Save pledge card"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/reminder")}
        className="mt-4 w-full rounded-xl bg-ember py-4"
      >
        <Text className="text-center text-base font-bold text-white">Continue</Text>
      </Pressable>
    </ScrollView>
  );
}

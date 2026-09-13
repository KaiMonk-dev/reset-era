import { useRouter } from "expo-router";
import { Redirect } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { ChevronRight, RotateCcw } from "lucide-react-native";
import { MotiView } from "moti";
import { Text } from "@/components/ui/text";
import { ANCHORS, TONE_PACKS } from "@/lib/plan";
import { success, tap } from "@/lib/haptics";
import { useEra } from "@/lib/store";

export default function Settings() {
  const router = useRouter();
  const profile = useEra((s) => s.profile);
  const log = useEra((s) => s.log);
  const setProfile = useEra((s) => s.setProfile);
  const reset = useEra((s) => s.reset);
  const [confirming, setConfirming] = useState(false);

  if (!profile) return <Redirect href="/quiz" />;
  const completedCount = Object.keys(log).length;

  const restartArc = () => {
    if (!confirming) {
      tap();
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3500);
      return;
    }
    success();
    setProfile({ ...profile, startedAt: Date.now(), comebackDone: 0 });
    reset();
    router.replace("/today");
  };

  return (
    <ScrollView contentContainerClassName="min-h-full bg-background px-5 pb-16 pt-14 pt-safe">
      <Text className="mb-1 font-display text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground">
        Settings
      </Text>
      <Text className="mb-8 font-displayBold text-[26px] leading-[32px] text-foreground">
        {profile.planName}
      </Text>

      {/* plan */}
      <Section label="Your plan">
        <Row k="Era" v={TONE_PACKS[profile.tone].label} />
        <Row k="Anchor" v={ANCHORS[profile.anchor].label} />
        <Row k="Daily time" v={profile.intensity === 60 ? "60+ min" : `${profile.intensity} min`} />
        <Row k="Day starts" v={profile.wakeTime} last />
      </Section>

      <Section label="Identity">
        <Text className="font-body text-[13px] italic leading-[18px] text-muted-foreground">
          "{profile.hook}"
        </Text>
        <View className="mt-3">
          <Text className="mb-1.5 font-bodyMedium text-[12px] text-muted-foreground">
            Alias on your card
          </Text>
          <TextInput
            value={profile.alias}
            onChangeText={(t) => setProfile({ ...profile, alias: t })}
            placeholder="LOCKED IN"
            placeholderTextColor="hsl(0 0% 40%)"
            maxLength={20}
            autoCapitalize="characters"
            className="rounded-lg border border-input bg-card p-3.5 font-display text-[14px] uppercase tracking-widest text-foreground"
          />
        </View>
      </Section>

      <Section label="Stats">
        <Row k="Quests completed" v={String(completedCount)} />
        <Row k="Comebacks used" v={String(profile.comebackDone)} last />
      </Section>

      <Section label="Reminder">
        <Pressable
          onPress={() => {
            tap();
            router.push("/reminder");
          }}
          className="flex-row items-center justify-between py-0.5"
        >
          <Text className="font-bodyMedium text-[15px] text-foreground">
            {profile.email ? `Saved · ${profile.reminderTime}` : "Set a daily reminder"}
          </Text>
          <ChevronRight size={16} color="hsl(0 0% 40%)" />
        </Pressable>
        <View className="mt-3" />
        <View className="mt-3" />
        <Pressable
          onPress={() => {
            tap();
            router.push("/pledge");
          }}
          className="flex-row items-center justify-between"
        >
          <Text className="font-bodyMedium text-[15px] text-foreground">View pledge card</Text>
          <ChevronRight size={16} color="hsl(0 0% 40%)" />
        </Pressable>
        <View className="mt-3" />
        <Pressable
          onPress={() => {
            tap();
            router.push("/studio");
          }}
          className="flex-row items-center justify-between"
        >
          <Text className="font-bodyMedium text-[15px] text-foreground">Content studio</Text>
          <ChevronRight size={16} color="hsl(0 0% 40%)" />
        </Pressable>
      </Section>

      {/* danger zone */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
      >
        <Text className="font-bodyBold text-[14px] text-foreground">Restart the arc</Text>
        <Text className="mt-1 font-body text-[12px] leading-[17px] text-muted-foreground">
          Wipes your quest log and starts Day 1 over. Your alias and plan stay.
        </Text>
        <Pressable
          onPress={restartArc}
          className={`mt-3 flex-row items-center justify-center rounded-lg py-3 ${
            confirming ? "bg-destructive" : "border border-border bg-card"
          }`}
        >
          <RotateCcw size={15} color={confirming ? "hsl(0 0% 96%)" : "hsl(0 0% 72%)"} />
          <Text
            className={`ml-2 font-bodyMedium text-[13px] ${
              confirming ? "text-white" : "text-foreground"
            }`}
          >
            {confirming ? "Tap again to confirm" : "Restart"}
          </Text>
        </Pressable>
      </MotiView>

      <Text className="mt-10 text-center font-display text-[9px] uppercase tracking-[0.35em] text-muted-foreground/40">
        reset era · v0
      </Text>

      <Pressable onPress={() => router.back()} className="mt-6 self-center py-2">
        <Text className="font-bodyMedium text-[13px] text-muted-foreground">Done</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-7">
      <Text className="mb-2.5 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </Text>
      <View className="rounded-lg border border-border bg-card px-4 py-3">
        {children}
      </View>
      <View className="h-5" />
    </View>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <View>
      <View className="flex-row items-center justify-between py-2">
        <Text className="font-body text-[14px] text-muted-foreground">{k}</Text>
        <Text className="font-bodyMedium text-[14px] text-foreground">{v}</Text>
      </View>
      {!last && <View className="h-px bg-border" />}
    </View>
  );
}

import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { track } from "@/lib/analytics";
import { useEra } from "@/lib/store";

export default function Reminder() {
  const router = useRouter();
  const profile = useEra((s) => s.profile);
  const setEmail = useEra((s) => s.setEmail);
  const [email, setEmailText] = useState(profile?.email ?? "");
  const [time, setTime] = useState(profile?.reminderTime ?? profile?.wakeTime ?? "07:00");
  const [saved, setSaved] = useState(false);
  const valid = /.+@.+\..+/.test(email);

  if (!profile) return null;

  return (
    <ScrollView contentContainerClassName="min-h-full bg-ink px-6 pb-20 pt-16">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-ember">
        Daily reminder
      </Text>
      <Text className="mb-8 text-2xl font-bold leading-tight text-white">
        {profile.hook}
      </Text>
      <Text className="mb-6 text-sm leading-5 text-zinc-400">
        One push a day, at the time your day starts. That's the whole notification budget — no
        spam, no streak-guilt pings at 11pm.
      </Text>

      <Text className="mb-2 text-sm text-zinc-400">Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmailText}
        placeholder="you@example.com"
        placeholderTextColor="#5A5A66"
        keyboardType="email-address"
        autoCapitalize="none"
        className="mb-5 rounded-xl border border-line bg-panel p-4 text-base text-white"
      />

      <Text className="mb-2 text-sm text-zinc-400">Send time</Text>
      <View className="mb-8 flex-row flex-wrap gap-3">
        {["06:00", "06:30", "07:00", "08:00", "17:00"].map((t) => (
          <Pressable
            key={t}
            onPress={() => setTime(t)}
            className={`rounded-full border px-4 py-3 ${
              time === t ? "border-ember bg-ember/20" : "border-line bg-panel/60"
            }`}
          >
            <Text className="text-sm text-white">{t}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        disabled={!valid}
        onPress={() => {
          setEmail(email.trim(), time);
          setSaved(true);
          track("reminder_captured", { time });
          setTimeout(() => router.replace("/today"), 900);
        }}
        className={`rounded-xl py-4 ${valid ? "bg-ember" : "bg-line opacity-40"}`}
      >
        <Text className="text-center text-base font-bold text-white">
          {saved ? "Locked in ✓" : "Set my reminder"}
        </Text>
      </Pressable>

      {saved && (
        <Text className="mt-4 text-center text-xs text-zinc-500">
          Saved. You're on the list for {time} — no email sent yet in V0.
        </Text>
      )}

      <Pressable onPress={() => router.back()} className="mt-8 py-3">
        <Text className="text-center text-sm text-zinc-400">Skip for now</Text>
      </Pressable>
    </ScrollView>
  );
}

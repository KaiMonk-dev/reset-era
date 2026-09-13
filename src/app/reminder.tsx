import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { BellRing, Mail } from "lucide-react-native";
import { MotiView } from "moti";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { track } from "@/lib/analytics";
import { success, tap } from "@/lib/haptics";
import { useEra } from "@/lib/store";

const TIMES = ["06:00", "06:30", "07:00", "08:00", "17:00"];

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
    <ScrollView contentContainerClassName="min-h-full bg-background px-5 pb-14 pt-14 pt-safe">
      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 200 }}
      >
        <View className="mb-6 h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
          <BellRing size={20} color="hsl(0 0% 96%)" />
        </View>
        <Text className="mb-3 font-display text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground">
          Daily reminder
        </Text>
        <Text className="font-displayBold text-[26px] leading-[32px] text-foreground">
          "{profile.hook}"
        </Text>
        <Text className="mt-4 font-body text-[14px] leading-[20px] text-muted-foreground">
          One notification a day, at the time your day starts. That's the whole budget — no spam,
          no streak-guilt pings at 11pm.
        </Text>
      </MotiView>

      <View className="mt-8">
        <View className="mb-2 flex-row items-center gap-1.5">
          <Mail size={13} color="hsl(240 8% 58%)" />
          <Text className="font-bodyMedium text-[13px] text-muted-foreground">Email</Text>
        </View>
        <TextInput
          value={email}
          onChangeText={setEmailText}
          placeholder="you@example.com"
          placeholderTextColor="hsl(240 8% 40%)"
          keyboardType="email-address"
          autoCapitalize="none"
          className="rounded-lg border border-input bg-card p-4 font-body text-[15px] text-foreground"
        />
      </View>

      <View className="mt-6">
        <Text className="mb-2 font-bodyMedium text-[13px] text-muted-foreground">Send time</Text>
        <View className="flex-row flex-wrap gap-2">
          {TIMES.map((t) => (
            <Pressable
              key={t}
              onPress={() => {
                tap();
                setTime(t);
              }}
              className={`rounded-full border px-4 py-2.5 ${
                time === t ? "border-primary bg-primary/15" : "border-border bg-card/60"
              }`}
            >
              <Text
                className={`font-display text-[13px] tracking-wide ${
                  time === t ? "text-primary" : "text-foreground"
                }`}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Button
        disabled={!valid}
        onPress={() => {
          setEmail(email.trim(), time);
          setSaved(true);
          success();
          track("reminder_captured", { time });
          setTimeout(() => router.replace("/today"), 900);
        }}
        className="mt-9 h-12 rounded-lg"
      >
        <Text className="font-bodyBold text-[15px] text-primary-foreground">
          {saved ? "Locked in ✓" : "Set my reminder"}
        </Text>
      </Button>

      {saved && (
        <Text className="mt-4 text-center font-body text-[12px] text-muted-foreground">
          Saved. You're on the list for {time}.
        </Text>
      )}

      <Pressable onPress={() => router.back()} className="mt-6 self-center py-2">
        <Text className="font-bodyMedium text-[13px] text-muted-foreground">Skip for now</Text>
      </Pressable>
    </ScrollView>
  );
}

import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Check, ChevronLeft, ChevronRight } from "lucide-react-native";
import { MotiView } from "moti";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { track } from "@/lib/analytics";
import {
  ANCHORS,
  INTENSITY_COPY,
  TONE_PACKS,
  makeHook,
  makePlanName,
  type AnchorId,
  type Intensity,
  type TonePackId,
} from "@/lib/plan";
import { tap, success } from "@/lib/haptics";
import { useEra } from "@/lib/store";

const WAKE_PRESETS = ["05:30", "06:00", "06:30", "07:00", "08:00", "09:00", "10:00", "11:00"];
const IDENTITY_CHIPS = [
  "shows up every day",
  "is disciplined with money",
  "trains 4x a week",
  "fixed his sleep",
  "doesn't scroll all day",
  "is unrecognizable",
];

const QUESTIONS = [
  "What dragged you here?",
  "Your #1 enemy right now?",
  "How much time can you actually give this daily?",
  "When does your day start?",
  "What does 'him' look like on Day 30?",
];

export default function Quiz() {
  const router = useRouter();
  const setProfile = useEra((s) => s.setProfile);
  const [step, setStep] = useState(0);
  const [tone, setTone] = useState<TonePackId | null>(null);
  const [anchor, setAnchor] = useState<AnchorId | null>(null);
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [wakeTime, setWakeTime] = useState<string | null>(null);
  const [identity, setIdentity] = useState("");

  const answers = [tone, anchor, intensity, wakeTime, identity.trim()];
  const canNext = answers[step] != null && (step !== 4 || identity.trim().length > 0);

  const finish = () => {
    const t = tone!;
    const a = anchor!;
    const i = intensity!;
    const id = identity.trim();
    setProfile({
      tone: t,
      anchor: a,
      intensity: i,
      wakeTime: wakeTime!,
      identity: id,
      planName: makePlanName(id, t),
      hook: makeHook(id),
      alias: "",
      startedAt: Date.now(),
      comebackDone: 0,
    });
    success();
    track("quiz_completed", { tone: t, anchor: a, intensity: i });
    track("plan_created", { plan: makePlanName(id, t) });
    router.replace("/pledge");
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="min-h-full px-5 pb-14 pt-16"
    >
      <View className="mb-9">
        <Text className="font-display text-[11px] font-medium uppercase tracking-[0.35em] text-primary">
          Reset Era
        </Text>
        <View className="mt-4 flex-row gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className={`h-[3px] flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`}
            />
          ))}
        </View>
      </View>

      <MotiView
        key={step}
        from={{ opacity: 0, translateY: 14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 220 }}
      >
        <Text className="mb-7 font-displayBold text-[28px] leading-[1.15] text-foreground">
          {QUESTIONS[step]}
        </Text>
        <View className="gap-2.5">
          {step === 0 &&
            (Object.keys(TONE_PACKS) as TonePackId[]).map((k) => (
              <Option
                key={k}
                label={TONE_PACKS[k].label}
                sub={TONE_PACKS[k].blurb}
                selected={tone === k}
                onPress={() => {
                  tap();
                  setTone(k);
                }}
              />
            ))}
          {step === 1 &&
            (Object.keys(ANCHORS) as AnchorId[]).map((k) => (
              <Option
                key={k}
                label={ANCHORS[k].label}
                sub={`vs ${ANCHORS[k].enemy}`}
                selected={anchor === k}
                onPress={() => {
                  tap();
                  setAnchor(k);
                }}
              />
            ))}
          {step === 2 &&
            ([15, 30, 60] as Intensity[]).map((m) => (
              <Option
                key={m}
                label={m === 60 ? "60+ minutes" : `${m} minutes`}
                sub={INTENSITY_COPY[m]}
                selected={intensity === m}
                onPress={() => {
                  tap();
                  setIntensity(m);
                }}
              />
            ))}
          {step === 3 && (
            <View className="flex-row flex-wrap gap-2">
              {WAKE_PRESETS.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  selected={wakeTime === t}
                  onPress={() => {
                    tap();
                    setWakeTime(t);
                  }}
                />
              ))}
            </View>
          )}
          {step === 4 && (
            <>
              <View className="mb-4 flex-row flex-wrap gap-2">
                {IDENTITY_CHIPS.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    selected={identity === c}
                    onPress={() => {
                      tap();
                      setIdentity(c);
                    }}
                  />
                ))}
              </View>
              <TextInput
                value={identity}
                onChangeText={setIdentity}
                placeholder="or type it — finish the sentence: 'He…'"
                placeholderTextColor="hsl(240 8% 40%)"
                multiline
                className="native:text-lg rounded-lg border border-input bg-card p-4 font-body text-base text-foreground"
              />
            </>
          )}
        </View>
      </MotiView>

      <View className="mt-10 flex-row items-center justify-between gap-3">
        {step > 0 ? (
          <Button variant="ghost" onPress={() => setStep(step - 1)} className="px-5">
            <ChevronLeft size={18} className="text-muted-foreground" color="hsl(240 8% 58%)" />
            <Text className="text-muted-foreground">Back</Text>
          </Button>
        ) : (
          <View />
        )}
        <Button
          disabled={!canNext}
          onPress={() => {
            if (step < 4) {
              tap();
              setStep(step + 1);
            } else {
              finish();
            }
          }}
          className="h-12 min-w-[130px] rounded-lg px-7"
        >
          <Text className="font-bodyBold text-[15px] text-primary-foreground">
            {step < 4 ? "Next" : "Lock in"}
          </Text>
          <ChevronRight size={18} color="hsl(240 15% 6%)" />
        </Button>
      </View>
    </ScrollView>
  );
}

function Option({
  label,
  sub,
  selected,
  onPress,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center rounded-lg border p-4 ${
        selected ? "border-primary bg-primary/10" : "border-border bg-card/60"
      }`}
    >
      <View className="flex-1">
        <Text className="font-bodyMedium text-[16px] text-foreground">{label}</Text>
        <Text className="mt-0.5 font-body text-[13px] text-muted-foreground">{sub}</Text>
      </View>
      <View
        className={`h-5 w-5 items-center justify-center rounded-full border ${
          selected ? "border-primary bg-primary" : "border-border"
        }`}
      >
        {selected && <Check size={13} color="hsl(240 15% 6%)" strokeWidth={3} />}
      </View>
    </Pressable>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-2.5 ${
        selected ? "border-primary bg-primary/15" : "border-border bg-card/60"
      }`}
    >
      <Text className={`font-body text-[13px] ${selected ? "text-primary" : "text-foreground"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

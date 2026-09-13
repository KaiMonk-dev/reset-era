import { Redirect } from "expo-router";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { useEra } from "@/lib/store";

export default function Gate() {
  const profile = useEra((s) => s.profile);
  const hydrated = useEra((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !profile) track("quiz_started");
  }, [hydrated, profile]);

  if (!hydrated) return null;
  if (!profile) return <Redirect href="/quiz" />;
  return <Redirect href="/today" />;
}

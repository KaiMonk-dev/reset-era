// supabase/functions/send-reminders — daily reminder email via Resend.
// Deploy: supabase functions deploy send-reminders
// Secrets: supabase secrets set RESEND_API_KEY=... MAIL_FROM="Reset Era <hello@yourdomain>"
// Called daily by GitHub Actions cron (see .github/workflows/send-reminders.yml).

const RESEND_API = "https://api.resend.com/emails";

interface Subscriber {
  email: string;
  reminder_time: string;
  arc_day: number;
}

function emailHtml(s: Subscriber): string {
  return `<!doctype html><html><body style="margin:0;background:#0b0b0f;font-family:-apple-system,Helvetica,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:40px 28px;color:#f5f5f7">
    <p style="font-size:11px;letter-spacing:5px;text-transform:uppercase;color:#8a8a93;margin:0 0 18px">Reset Era · Day ${s.arc_day}</p>
    <h1 style="font-size:26px;line-height:1.2;margin:0 0 14px">The guy who shows up every day doesn't skip today.</h1>
    <p style="font-size:15px;line-height:1.6;color:#a5a5ad;margin:0 0 28px">Three quests. That's the whole ask. The bars only move because you did.</p>
    <a href="https://kaimonk-dev.github.io/reset-era/today" style="display:inline-block;background:#f5f5f7;color:#0b0b0f;text-decoration:none;font-weight:700;font-size:15px;padding:13px 26px;border-radius:10px">Open today's quests →</a>
    <p style="font-size:11px;color:#5a5a63;margin-top:34px">You get one email a day. Unsubscribe by replying "stop".</p>
  </div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method", { status: 405 });
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${Deno.env.get("CRON_SECRET")}`) {
    return new Response("forbidden", { status: 403 });
  }

  const { createClient } = await import("npm:@supabase/supabase-js@2");
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: subs, error } = await db
    .from("subscribers")
    .select("email, reminder_time, arc_day")
    .eq("active", true);
  if (error) return new Response(error.message, { status: 500 });

  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("MAIL_FROM") ?? "Reset Era <onboarding@resend.dev>";
  let sent = 0;
  const failures: string[] = [];

  for (const s of (subs ?? []) as Subscriber[]) {
    const r = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: s.email,
        subject: `Day ${s.arc_day} — the arc continues`,
        html: emailHtml(s),
      }),
    });
    if (r.ok) sent += 1;
    else failures.push(s.email);
  }

  return Response.json({ sent, failures: failures.length });
});

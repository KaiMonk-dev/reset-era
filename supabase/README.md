# Reminder email pipeline — ready for keys

Everything is built. When the two accounts exist, this is the ~15-minute wiring checklist:

## 1. Supabase (free tier)
1. Create project at supabase.com (alias email).
2. SQL Editor → paste `supabase/schema.sql` → run.
3. Install CLI: `brew install supabase/tap/supabase`, then `supabase login`, link project.
4. Deploy the function from repo root:
   `supabase functions deploy send-reminders`
5. Set function secrets:
   `supabase secrets set RESEND_API_KEY=<from Resend> MAIL_FROM="Reset Era <onboarding@resend.dev>" CRON_SECRET=<random string>`

## 2. Resend (free tier, 100 emails/day)
1. Sign up, verify the sending email (onboarding@resend.dev works for testing).
2. Copy API key → used above.

## 3. GitHub Actions cron (already scaffolded: .github/workflows/send-reminders.yml)
Add repo secrets:
- `SUPABASE_FUNCTION_URL` = https://<project-ref>.supabase.co/functions/v1/send-reminders
- `CRON_SECRET` = same random string as above.

## 4. App → database
Reminder captures currently store email+time in localStorage only. Wire-up step:
`src/app/reminder.tsx` → on save, POST { email, reminder_time } to the subscribers table
(via supabase-js anon insert once RLS policy allows, or through a tiny edge function).
The public schema/table name matches: `subscribers(email, reminder_time, arc_day)`.

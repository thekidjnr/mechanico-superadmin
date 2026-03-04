# Mechanico Super Admin

Internal admin panel for managing Mechanico merchant accounts.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm run dev  # runs on http://localhost:3001
```

## Environment Variables

See `.env.local.example`. Uses the **same Supabase project** as `mechanico-frontend` but with the service role key for privileged operations.

## First Superadmin Account

Create it directly in Supabase Dashboard → Authentication → Users → Add user.
Then update the user's `user_metadata` to include `{ "role": "superadmin" }`:

```sql
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "superadmin"}'::jsonb
where email = 'your-admin@email.com';
```

## DB Note

The `profiles` table needs an `is_active` boolean column and a `role` text column.
Run in Supabase SQL editor:

```sql
alter table profiles add column if not exists is_active boolean default true;
alter table profiles add column if not exists role text default 'merchant';
```

## Routes

| Route | Description |
|---|---|
| `/` | Login (superadmin only) |
| `/dashboard` | Stats overview |
| `/merchants` | All merchant accounts |
| `/merchants/[id]` | Merchant detail + actions |
| `/create` | Create new merchant account |

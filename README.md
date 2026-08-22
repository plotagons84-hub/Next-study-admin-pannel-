# Next Study Admin Panel

A separate, standalone web app whose only job is controlling the **Next Study** public site remotely. Deploy this to its own URL (different from the public site) - it's the same black & orange liquid-glass style, React + TanStack Router + Tailwind + Firebase, but there is no public-facing content here at all: opening the URL takes you straight into the admin flow.

`robots: noindex, nofollow` is set in `index.html` so it doesn't show up in search results - it's not linked from the public site either. Treat the URL itself as semi-private, and definitely don't publish it anywhere public. The Firebase Auth login is the real gate, but there's no reason to advertise the address.

## The flow

**Splash** ("Enter System") → **Login / Register** (name + password) → **Access Granted** (brief animated transition) → **Panel** with 6 tabs: **Stats, Control, Links, Buttons, Announce, AI Chat**. Voice plays throughout via the browser's built-in Web Speech API (free, no key) - a greeting on login, "Access granted, welcome back", and the AI Tutor speaks every answer.

### Logging in — Name + Password, backed by Firebase

Firebase Auth's email/password sign-in needs an email, but the login screen only asks for a name. Each name is turned into a throwaway address like `zishan.ahmad@admin.nextstudy.local` purely so Firebase has something to key the account on - nothing is ever sent there.

**First time**: tap **"First time here? Create an admin account"**, enter `ZISHAN AHMAD` / `ZISHANAHMAD2009`, submit - that creates the real Firebase account. From then on, log in with the same name + password. Repeat for any other admin; everyone who's ever logged in shows up in **Control → Admins**, by name only.

### The 6 tabs

- **Stats** — real Firestore numbers: total opens, online now (approximate presence heartbeat), how many top-level cards are locked, admin count. System Health reflects Maintenance Mode.
- **Control** — Maintenance Mode / Telegram-popup / urgent-alert on-off switches, and the Admins list.
- **Links** — lock/unlock any of the 4 top-level cards on the public site, and edit any PW/Next Topper sub-platform's destination URL. This is the "lock it so no one else can open it" feature - takes effect on the live site within seconds.
- **Buttons** — edit where the Telegram-popup button and the urgent-alert banner actually point.
- **Announce** — write the banner shown on the public site's home page: text, a color (red/orange/green), on/off.
- **AI Chat** — demo NEET/JEE knowledge base (`src/lib/aiTutor.js`), speaks its answers, has a mic button for spoken questions. For genuinely intelligent answers, that file has a documented spot for a real AI API call - needs a small backend, since browsers can't safely hold a secret API key or call most AI providers directly.

## New in this update

- **Live/Lock switches everywhere** — every card (top-level and every PW/Next Topper sub-platform) now has a proper ON/OFF switch instead of a button. Live = unlocked, Lock = locked, and it looks and works identically everywhere.
- **A platform with no URL auto-locks.** If a card's link is blank (e.g. Mission Jeet until you add one), it shows "Coming Soon" on the public site automatically, even before you've explicitly toggled it off.
- **A second "secret code" is now required to save any URL change** (top-level cards, PW/Next Topper sub-platforms, and the Telegram/Kuku TV/Urgent Alert links in Buttons) — set to `AHMADNEXTSTUDY2026`.
- **Kuku TV** now shows its actual logo (the one you sent) instead of a generic icon, and joins Telegram Popup / Urgent Alert as a third controllable banner — toggle in **Control**, edit its link in **Buttons**.
- **New admin panel logo** applied throughout `next-study-admin` — splash screen, login screen, and the whole PWA icon set.
- **Every save now shows a real error if it fails**, instead of silently doing nothing. If you flip a toggle or save a link and see a red box saying it was blocked by Firestore rules, that's the fix to make: publish `firestore.rules` (below) in the Firebase console.
- **Maintenance Mode now really blocks the public site**, and can no longer get stuck showing a blank screen if Firestore is briefly slow — see `next-study`'s README for what changed there.

### About the secret code — please read this

This still runs entirely in the browser, so there's a real limit to what "secure" can mean here, and it matters that you understand it precisely:

- The code is **never stored as plaintext** in the code or the shipped app — only its SHA-256 hash (`src/lib/secretCode.js`). Casually opening devtools or viewing the page source will not show you the code.
- **But** a technically determined person *can* copy that hash out of the deployed JavaScript and try to crack it offline (dictionary/brute-force), with no rate limit stopping them, since there's no server involved to say "too many attempts." For a code this long and this specific, that's a real, meaningful deterrent — not nothing — but it is **not the same guarantee** as a password check that happens on a server you control.
- If this ever needs to be genuinely unbreakable (e.g. this becomes a real business and the links matter financially), the fix is a small backend endpoint that checks the code server-side and never sends it to the browser at all — a different, bigger project than what's here.

## Why a toggle might look like it "isn't working"

This is almost always one of three things, not a code bug in the toggle itself:

1. **Firestore rules were never published** — the single most common cause. Firebase denies everything by default. Fix: Firebase console → Firestore Database → Rules → paste `firestore.rules` → Publish. You'll now see a clear red error in the admin app itself if this is the issue, instead of a silent no-op.
2. **The public site (`next-study`) is running an old deployed build** that predates the Firestore integration — rebuild and redeploy it.
3. **Mismatched Firebase project** between the two apps — both `firebase.js` files need the same `projectId`.

## Firebase setup (shared with the public site — one Firebase project, two apps)

This project and the public **Next Study** site both point at the same Firebase project (`next-study-admin-pannel`, config already in `src/lib/firebase.js`) - that's the entire "how do I link them" answer: no separate linking step, they just both read/write the same Firestore database.

In the [Firebase console](https://console.firebase.google.com/):

1. **Authentication → Sign-in method** → confirm **Email/Password** is enabled.
2. **Firestore Database** → **Create database** if you haven't already (production mode is fine).
3. **Firestore Database → Rules** → paste in `firestore.rules` (included in this project) and **Publish**:
   - `config/*` (platform locks, announcement, toggles) — anyone can read, only a signed-in admin can write.
   - `stats/*` (opens counter) — anyone can bump it, only an admin can delete it.
   - `presence/*` (online-now heartbeats) — open, since visitors aren't signed in.
   - `admins/*` — only signed-in admins can read the list; each admin can only write their own record.

### Two honest caveats

- **"Online now" is approximate** — each open tab on the public site pings every 20s; the count is "pings in the last 60 seconds," with no server-side cleanup of stale sessions.
- **The opens counter and presence writes are open to any visitor**, by design - a public-site visitor isn't logged in, so there's no other way for their browser to bump a counter. Fine for a display metric; if abuse ever becomes a real concern, the fix is a Cloud Function instead of a direct client write - a backend change, not something these rules alone prevent.

## Running it

```bash
npm install
npm run dev
```

Runs on port 5174 by default (the public site's `npm run dev` uses 5173), so you can run both side by side. `npm run build` produces a production build in `dist/` - deploy that to its own hosting (e.g. a separate Netlify/Vercel project) so it has its own URL, separate from the public site.

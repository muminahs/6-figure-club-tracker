# The 6 Figure Club tracker

A live tracker for the club's run from 20 to 50 members. Everyone with the link
sees the same page; only the owner, with a passcode, can add members, name
people or change settings. Every change is kept in the history on the page.

## How it works

- `public/index.html` is the whole page: the sunset scene, the numbers, the history.
- `netlify/functions/state.mjs` is a small server function at `/api/state`.
  Visitors read from it; the owner saves to it with the passcode.
- Data is stored in Netlify Blobs (built into Netlify, nothing to set up).
- `data/seed.mjs` is the starting data (your 20 founders, names and history),
  used until the first save on the live site.
- The page checks for updates every 30 seconds, so open copies stay current.

## Put it online (about 15 minutes)

1. **Create a Netlify account** at https://app.netlify.com/signup and choose
   "Sign up with GitHub".
2. **Import this repository:** in Netlify, choose *Add new site → Import an
   existing project → GitHub*, then pick this repository. Leave the build
   settings as they are (Netlify reads `netlify.toml`) and click *Deploy*.
3. **Set your passcode:** *Site configuration → Environment variables → Add a
   variable*. Key: `ADMIN_PASSCODE`. Value: a passcode only you know (use
   something long, like four random words). Then go to *Deploys → Trigger
   deploy → Deploy site* so the passcode takes effect.
4. **Unlock editing:** open your site, click **owner** at the bottom, and enter
   the passcode. That device stays unlocked until you click **lock**.
5. **Optional, your own address:** *Domain management → Add a domain*. You can
   buy one there or connect one you already own.

Your site's address appears at the top of the Netlify dashboard
(something like `six-figure-club.netlify.app`). You can rename it under
*Site configuration → Change site name*.

## Changing the page later

Edit `public/index.html` and push to GitHub. Netlify redeploys on its own.
Member data lives in Netlify Blobs, so redeploying never resets it.

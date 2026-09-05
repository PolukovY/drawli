# Manual test plan: voice quality on a real iPad

Everything in this repo's own test suite proves the *selection logic* is
correct — locale priority, fallback order, per-language persistence, the
debounce/cancel-race guard. None of it can prove a voice actually *sounds*
good, or that Safari behaves exactly like the Chromium this was built and
tested against. This is not tested; treat every step below as open until
someone runs it on physical hardware.

## Setup

1. Open the deployed app (or `npm run dev` and open the printed LAN URL) in
   Safari on an iPad.
2. Add it to the Home Screen (share icon → "Add to Home Screen") — several
   of the checks below only matter for the installed PWA, not the browser tab.
3. In the device's own Settings → Accessibility → Spoken Content → Voices,
   note which Ukrainian and Spanish voices are installed, and whether either
   has an "Enhanced"/"Premium" option not yet downloaded. Download it if so —
   this alone may be the entire fix for a given device.

## 1. The diagnostics page

Only exists in a dev build (`npm run dev`), at `/#/dev/speech`. Open it and
record:

- [ ] How many voices are listed for `uk-UA`, and for `es-ES`/`es-MX`/`es-US`.
- [ ] Which voice this app picked for each of the three languages, and the
      reason column (exact / same-language-other-region / generic / none).
      **Ukrainian and Spanish must both say "exact"** if the device has any
      voice for that exact locale at all — if either says "same-language-
      other-region" or "generic" despite an exact-locale voice being visible
      in the table above it, that is a real bug, not a hardware limitation.
- [ ] Tap every "System voice" test button (uk: яблуко, веселка, черепаха,
      "Це червоне яблуко"; es: manzana, arcoíris, tortuga, "Esta es una
      manzana roja"; en: apple, rainbow, turtle, "This is a red apple.").
      Confirm: right language, right accent (Ukrainian — not Russian; Spain
      Spanish — not Mexican or American), understandable pronunciation, no
      crash, no console error.
- [ ] Check the "Neural" column only if `VITE_TTS_ENDPOINT` is configured for
      this build — otherwise it will correctly say "unavailable".

## 2. The actual app, not just the diagnostics page

- [ ] Settings → turn the tutor voice on → pick Ukrainian → the voice-card
      grid should list real, distinct system voices; tapping one plays a
      preview in that voice.
- [ ] Repeat for Spanish. Pick a *different* character/voice than Ukrainian's.
      Switch back to Ukrainian in the same screen — **the original Ukrainian
      pick must still be selected**, not reset to the top option. This is the
      per-language persistence fix; a shared session (not yet closed) is the
      weakest form of this test — see the next point for the real one.
- [ ] Fully quit the app (swipe it away, not just background it) and reopen
      it. Settings should still show the same voice picked for each language.
- [ ] Play "Listen and spell" (`/#/listen`), "Odd word out" (`/#/odd-word`),
      and "Clap the word" (`/#/syllables`) in Ukrainian and in Spanish. These
      three specifically used to bypass all of this app's voice selection —
      confirm the voice they use now matches what Settings has picked, not
      some other, plainer-sounding voice.

## 3. The Safari/PWA-specific bugs this fix targets

- [ ] **Backgrounding.** Start any drawing exercise with the tutor voice on,
      let it start speaking a step, press the Home button mid-sentence
      (backgrounding, not quitting), wait 15+ seconds, reopen the app. It
      should not be stuck silent — tap "Say again" and it should speak
      normally. This is the known "PWA comes back with `speechSynthesis`
      stuck paused" bug; the fix calls `resume()` defensively on foreground.
- [ ] **Fast repeated taps.** In "Listen and spell", tap the speaker button
      three or four times as fast as possible. Expect one clean word, not a
      garbled overlap of several. This is the debounce/cancel-race fix.
- [ ] **Leaving mid-word.** Start a word playing in any of the three
      games above, immediately navigate Home before it finishes. It should
      stop, not keep talking over the home screen.
- [ ] **Voice download mid-session.** With the app open, go to
      Settings → Accessibility → Spoken Content → Voices and download a new
      Ukrainian or Spanish voice pack. Return to the app's own Settings and
      use the (dev-only) "Rescan" button on `/#/dev/speech`, or simply revisit
      the voice-language section — the newly downloaded voice should appear
      as a candidate without a full app restart.

## 4. What "good" looks like, and what to do if it still isn't

If Ukrainian or Spanish still sounds flat/robotic after confirming the
diagnostics page shows "exact" locale match and the best available voice
selected, that is very likely a **hardware/OS limitation**, not a code bug:
the device genuinely has nothing better installed for that language. Two
honest options at that point:

1. In the device's own Settings, check for and download an
   Enhanced/Premium/Siri voice for that language, if one is offered.
2. Deploy the optional neural layer (`server/README.md`) and set
   `VITE_TTS_ENDPOINT` — this is exactly the situation it exists for. Use
   the diagnostics page's "Neural" test buttons to compare it against the
   system voice for the exact same words before deciding it is worth the
   ongoing cost.

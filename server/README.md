# Drawli TTS backend (optional, reference implementation)

This is the piece of infrastructure the app's neural voice layer needs and
GitHub Pages (where the app itself is hosted) cannot provide: a small server
that holds a paid TTS provider's API key and exposes one endpoint the
frontend is allowed to call.

**The app works completely without this.** With no backend deployed, every
child hears the browser's own system voice, exactly as before this feature
existed — see the root `README`/PR description for what was fixed there.
This backend is what upgrades that to a neural voice for Ukrainian and
Spanish specifically, once someone has deployed it and picked a provider.

## Why this exists as a separate package

The main app is a static site (GitHub Pages has no server runtime), and this
is a real server with a real recurring cost once deployed — which provider,
which region, and how much to spend are decisions for whoever runs this app,
not something to bake in. This directory is a complete, independently
deployable Node package: it does not import anything from `src/`, and the
main app's build does not touch it.

## Deploying it

Any host that runs Node works — a small VM, Fly.io, Render, Railway, a
Cloudflare Worker (with the `fetch`-based provider code adapted to the
Workers runtime), etc. There is no state beyond the on-disk audio cache,
which is safe to lose (it just refills on the next request for that word).

```sh
cd server
npm install
cp .env.example .env   # fill in one provider's key below
npm start               # listens on PORT (default 8787)
```

Then set `VITE_TTS_ENDPOINT` (in the main app's `.env.local`, or as a build
env var wherever the app is built) to `https://<wherever-you-deployed-this>/api/speak`,
and rebuild the app. That is the entire integration — the frontend
(`src/audio/tts/NeuralSpeech.ts`) already knows how to call it, cache its
response, and fall back to the system voice on any failure.

## Choosing a provider

Two are implemented, behind the same `TtsProvider` interface
(`providers/types.d.ts`) — swapping or adding a third is one new file:

- **Azure Cognitive Services Speech** (`providers/AzureTtsProvider.mjs`) —
  the suggested default for this app. Its neural voices are named per exact
  locale (`uk-UA-PolinaNeural`, `es-ES-ElviraNeural`), so the accent is a
  parameter, not something a model infers from the text. Needs
  `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` (from an Azure Speech
  resource).
- **OpenAI text-to-speech** (`providers/OpenAiTtsProvider.mjs`) — one key,
  no region, simpler to set up. It infers language and accent from the input
  text rather than a locale parameter, so it cannot promise Spain Spanish
  specifically the way Azure can; a reasonable choice for English, or as a
  fallback.

Neither has been listened to from this environment — there is no audio
output here to judge it with. The `/dev/speech` diagnostics page (in the
main app, `npm run dev`) is built to A/B whichever provider is configured
against the system voice once you can actually listen; use it before
committing to one for real.

## Environment variables

See `.env.example`. `TTS_PROVIDER` picks explicitly (`azure` or `openai`);
left unset, Azure is tried first if its two variables are present, then
OpenAI. No key is ever read from anywhere but `process.env` — nothing here
is copied into a config file, logged, or reachable by the frontend.

## What the endpoint does before calling a provider

Every request to `POST /api/speak` goes through, in order:

1. **Validation** (`validate.mjs`) — text is a non-empty string under 200
   characters with no `< > { }`, `locale` is one of `uk-UA`, `es-ES`,
   `en-GB`, `en-US` (this is also what stops `es-ES` from ever silently
   becoming `es-MX`/`es-US` server-side — they are not on the list),
   `speed` is 0.5–1.5, `style` is one of the three named ones.
2. **Rate limiting** (`rateLimit.mjs`) — a token bucket per client IP, 20
   requests with a 20/minute refill by default. In-memory, which is enough
   for one instance; put a shared store (Redis/Upstash) behind the same two
   functions before running more than one.
3. **Cache lookup** (`cache.mjs`) — keyed by `sha256(text|locale|voice|speed|modelVersion)`,
   the same scheme the frontend's own Cache Storage layer uses
   (`src/audio/tts/cacheKey.ts`). A hit never calls the provider at all —
   the same word is never paid for twice.
4. Only then, the configured provider, and only a **successful** result is
   cached — a failed synthesis is retried on the next request rather than
   remembered as a permanent "no".

A provider error becomes a plain `502` with no detail in the response body;
the real error (which can carry account/billing information) is logged
server-side only, never sent to a client and never including the request's
own text (a child's words have no reason to sit in a log file either).

## Running the tests

Zero extra test dependencies — Node's own test runner:

```sh
cd server
npm test
```

## Cost

See the root PR description for a worked estimate against this app's actual
word count. The short version: at Azure's or OpenAI's public per-character
pricing, generating every word this app currently has in Ukrainian and
Spanish once is on the order of a few dollars, one time — the cache means it
is never paid for again after that for the same word at the same settings.

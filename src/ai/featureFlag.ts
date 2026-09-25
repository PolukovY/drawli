/**
 * Build-time kill switch, independent of the per-device Settings toggle
 * (`aiIdeasEnabled` in `AppSettings`, which is a parent's own opt-in once
 * this is available). This one is for pulling the whole feature from a
 * build — hiding the Settings section entirely and never even constructing
 * `TransformersJsProvider` — without touching code, in case it doesn't work
 * out. Same idiom as `VITE_TTS_ENDPOINT` in `NeuralSpeech.ts`.
 */
export function isAiFeatureEnabled(): boolean {
  return import.meta.env.VITE_AI_FEATURE_ENABLED !== 'false'
}

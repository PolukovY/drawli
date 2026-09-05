/**
 * OpenAI's text-to-speech REST endpoint. Simpler to set up than Azure — one
 * key, no region, no SSML — but it infers a language and accent from the
 * text itself rather than taking an explicit locale, so it cannot promise
 * "Spain Spanish" the way `AzureTtsProvider` can with a named `es-ES` voice.
 * Kept as the second option this app's provider abstraction was built to
 * support, and a reasonable fallback for English, where accent is less of a
 * concern to begin with.
 *
 * Docs: https://platform.openai.com/docs/guides/text-to-speech
 */

const DEFAULT_VOICE = 'alloy'

/**
 * @param {{ apiKey: string, model?: string }} config
 * @returns {import('./types').TtsProvider}
 */
export function createOpenAiTtsProvider({ apiKey, model = 'gpt-4o-mini-tts' }) {
  return {
    id: 'openai',
    async synthesize({ text, voice, speed = 1 }) {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          voice: voice ?? DEFAULT_VOICE,
          input: text,
          response_format: 'mp3',
          speed,
        }),
      })

      if (!response.ok) {
        const detail = await response.text().catch(() => '')
        throw new Error(`OpenAI TTS ${response.status}: ${detail.slice(0, 300)}`)
      }

      return { audio: await response.arrayBuffer(), contentType: 'audio/mpeg' }
    },
  }
}

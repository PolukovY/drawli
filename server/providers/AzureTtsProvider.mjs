/**
 * Azure Cognitive Services Speech, over its plain REST endpoint (no SDK, so
 * this has no dependency beyond `fetch`). The reason this is the suggested
 * default over OpenAI's TTS for this app specifically: Azure's neural voices
 * are named per exact locale — `uk-UA-PolinaNeural` is Ukrainian, not "some
 * language the model happened to infer from the text" — which is exactly the
 * uk-UA / es-ES guarantee this project needs and OpenAI's current TTS API
 * does not expose a parameter for.
 *
 * Docs: https://learn.microsoft.com/azure/ai-services/speech-service/rest-text-to-speech
 */

/** Reasonable defaults chosen for being named, documented Azure neural voices
 *  for exactly these locales — not verified by ear against alternatives from
 *  this environment, which has no audio output. See the PR description for
 *  how to actually pick between voices once someone can listen. */
const DEFAULT_VOICE = {
  'uk-UA': 'uk-UA-PolinaNeural',
  'es-ES': 'es-ES-ElviraNeural',
  'en-GB': 'en-GB-SoniaNeural',
  'en-US': 'en-US-JennyNeural',
}

const xmlEscape = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/**
 * @param {{ apiKey: string, region: string }} config
 * @returns {import('./types').TtsProvider}
 */
export function createAzureTtsProvider({ apiKey, region }) {
  return {
    id: 'azure',
    async synthesize({ text, locale, voice, speed = 1 }) {
      const voiceName = voice ?? DEFAULT_VOICE[locale]
      if (!voiceName) throw new Error(`no default Azure voice configured for locale "${locale}"`)

      // A plain rate percentage rather than SSML's <prosody> tag would be
      // simpler, but Azure's REST endpoint only accepts prosody through
      // SSML, so the request is built as SSML either way.
      const ratePercent = Math.round((speed - 1) * 100)
      const ssml =
        `<speak version="1.0" xml:lang="${locale}">` +
        `<voice xml:lang="${locale}" name="${voiceName}">` +
        (ratePercent !== 0 ? `<prosody rate="${ratePercent}%">${xmlEscape(text)}</prosody>` : xmlEscape(text)) +
        `</voice></speak>`

      const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'application/ssml+xml',
          // 48kHz mono MP3: good quality, small enough to cache and ship over
          // a tablet connection without thinking about it.
          'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3',
          'User-Agent': 'drawli-tts-backend',
        },
        body: ssml,
      })

      if (!response.ok) {
        const detail = await response.text().catch(() => '')
        throw new Error(`Azure TTS ${response.status}: ${detail.slice(0, 300)}`)
      }

      return { audio: await response.arrayBuffer(), contentType: 'audio/mpeg' }
    },
  }
}

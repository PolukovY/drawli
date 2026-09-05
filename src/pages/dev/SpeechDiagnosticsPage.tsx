import { Fragment, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  describeVoiceSelection, refreshVoicesNow, speakWord, type VoiceLang, type VoiceSelection,
} from '../../audio/speech'
import { fetchNeuralAudio, isNeuralConfigured, playNeuralAudio, unlockAudioForGesture } from '../../audio/tts/NeuralSpeech'
import './SpeechDiagnosticsPage.css'

/**
 * Not part of the app a child uses — a dev-only screen (see the route guard
 * in `../../app/router.tsx`, which keeps this out of the router entirely in
 * a production build) for actually seeing what a given device reports:
 * every voice `speechSynthesis` knows about, which one this app picked for
 * each language and why, and buttons to hear the difference for real.
 *
 * Reports to the screen only — nothing here writes to the console, in dev or
 * otherwise.
 */

const TEST_LINES: Record<VoiceLang, { words: string[]; phrase: string }> = {
  uk: { words: ['яблуко', 'веселка', 'черепаха'], phrase: 'Це червоне яблуко.' },
  es: { words: ['manzana', 'arcoíris', 'tortuga'], phrase: 'Esta es una manzana roja.' },
  en: { words: ['apple', 'rainbow', 'turtle'], phrase: 'This is a red apple.' },
}

const LANG_LABEL: Record<VoiceLang, string> = { uk: 'Українська (uk-UA)', en: 'English', es: 'Español (es-ES)' }

function detectEnvironment() {
  const ua = navigator.userAgent
  const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua)
  const iosMatch = ua.match(/OS (\d+)_(\d+)(?:_(\d+))?/)
  const iosVersion = iosMatch ? `${iosMatch[1]}.${iosMatch[2]}${iosMatch[3] ? `.${iosMatch[3]}` : ''}` : null
  // iPadOS has reported a desktop "Macintosh" user agent by default since
  // iPadOS 13 — the one thing that reliably tells an iPad apart from an
  // actual Mac from the UA string alone is that a Mac has no touch screen.
  const looksLikeIPadInDesktopMode = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  const standaloneNav = (navigator as unknown as { standalone?: boolean }).standalone
  const isStandalone = Boolean(standaloneNav) || window.matchMedia?.('(display-mode: standalone)').matches
  return { ua, isSafari, iosVersion, looksLikeIPadInDesktopMode, isStandalone }
}

function tierLabel(selection: VoiceSelection): string {
  switch (selection.tier) {
    case 'exact': return 'exact locale match'
    case 'fallback-region': return 'same language, different region'
    case 'generic': return 'generic language voice only'
    case 'none': return 'no voice at all for this language'
  }
}

export function SpeechDiagnosticsPage() {
  const navigate = useNavigate()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [neuralStatus, setNeuralStatus] = useState<Record<string, string>>({})
  const env = useMemo(detectEnvironment, [])

  const load = () => {
    refreshVoicesNow()
    setVoices(typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [])
  }

  useEffect(() => {
    load()
    const api = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
    api?.addEventListener('voiceschanged', load)
    return () => api?.removeEventListener('voiceschanged', load)
  }, [])

  const selections = (['uk', 'en', 'es'] as VoiceLang[]).map((lang) => ({ lang, selection: describeVoiceSelection(lang) }))

  async function testNeural(lang: VoiceLang, text: string) {
    unlockAudioForGesture()
    setNeuralStatus((s) => ({ ...s, [text]: 'requesting…' }))
    const blob = await fetchNeuralAudio({ text, locale: lang === 'uk' ? 'uk-UA' : lang === 'es' ? 'es-ES' : 'en-GB' })
    if (!blob) {
      setNeuralStatus((s) => ({ ...s, [text]: 'unavailable (no backend configured, or the request failed)' }))
      return
    }
    setNeuralStatus((s) => ({ ...s, [text]: 'playing' }))
    try {
      await playNeuralAudio(blob)
      setNeuralStatus((s) => ({ ...s, [text]: 'played' }))
    } catch {
      setNeuralStatus((s) => ({ ...s, [text]: 'blocked by the browser (needs a fresh tap)' }))
    }
  }

  return (
    <div className="diag">
      <header className="diag__header">
        <button onClick={() => navigate('/')}>← Back</button>
        <h1>Speech diagnostics</h1>
        <span className="diag__badge">dev only — not in production builds</span>
      </header>

      <section className="diag__section">
        <h2>Environment</h2>
        <dl className="diag__grid">
          <dt>Safari</dt><dd>{env.isSafari ? 'yes' : 'no (or not detectable)'}</dd>
          <dt>Standalone / installed PWA</dt><dd>{env.isStandalone ? 'yes' : 'no'}</dd>
          <dt>iOS/iPadOS version (best effort)</dt>
          <dd>
            {env.iosVersion ?? 'not present in the user agent string'}
            {env.looksLikeIPadInDesktopMode ? (
              <> — this device reports a desktop "Macintosh" user agent (normal for iPadOS since 13), so a
                version number will usually not be here even though this is an iPad. Check Settings → General →
                About on the device itself for a real answer; do not trust this field on iPadOS.</>
            ) : null}
          </dd>
          <dt>Neural backend</dt>
          <dd>{isNeuralConfigured() ? 'configured' : 'not configured — every test below uses the system voice only'}</dd>
          <dt>User agent</dt><dd className="diag__ua">{env.ua}</dd>
        </dl>
      </section>

      <section className="diag__section">
        <div className="diag__row">
          <h2>Voices this device reports</h2>
          <button onClick={load}>Rescan</button>
        </div>
        <div className="diag__table-wrap">
          <table className="diag__table">
            <thead>
              <tr><th>name</th><th>voiceURI</th><th>lang</th><th>localService</th><th>default</th></tr>
            </thead>
            <tbody>
              {voices.length === 0 ? (
                <tr><td colSpan={5}>No voices reported yet — some browsers need a moment, or a rescan.</td></tr>
              ) : voices.map((voice) => (
                <tr key={voice.voiceURI}>
                  <td>{voice.name}</td>
                  <td>{voice.voiceURI}</td>
                  <td>{voice.lang}</td>
                  <td>{String(voice.localService)}</td>
                  <td>{String(voice.default)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="diag__section">
        <h2>What this app picked for each language</h2>
        <dl className="diag__grid">
          {selections.map(({ lang, selection }) => (
            <Fragment key={lang}>
              <dt>{LANG_LABEL[lang]}</dt>
              <dd>
                {selection.voice ? `${selection.voice.name} (${selection.voice.lang})` : 'nothing available'}
                {' — '}{tierLabel(selection)}, {selection.candidateCount} candidate voice(s) found
              </dd>
            </Fragment>
          ))}
        </dl>
      </section>

      {(['uk', 'es', 'en'] as VoiceLang[]).map((lang) => (
        <section className="diag__section" key={lang}>
          <h2>{LANG_LABEL[lang]}</h2>
          <div className="diag__tests">
            {TEST_LINES[lang].words.map((word) => (
              <div className="diag__test-row" key={word}>
                <span className="diag__word">{word}</span>
                <button onClick={() => speakWord(word, lang)}>System voice</button>
                <button onClick={() => void testNeural(lang, word)}>Neural</button>
                <span className="diag__status">{neuralStatus[word] ?? ''}</span>
              </div>
            ))}
            <div className="diag__test-row">
              <span className="diag__word">{TEST_LINES[lang].phrase}</span>
              <button onClick={() => speakWord(TEST_LINES[lang].phrase, lang)}>System voice</button>
              <button onClick={() => void testNeural(lang, TEST_LINES[lang].phrase)}>Neural</button>
              <span className="diag__status">{neuralStatus[TEST_LINES[lang].phrase] ?? ''}</span>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

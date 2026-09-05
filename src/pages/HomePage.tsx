import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../app/store'
import { Icon } from '../components/Icon'
import { CoachMarks, type CoachStep } from '../components/CoachMarks'
import { assetUrl, loadIndex } from '../exercise/ExerciseLoader'
import type { CategoryKind, ExerciseIndex } from '../exercise/Exercise'
import type { WordLanguage } from '../exercise/ExerciseLoader'
import { gamesFor } from '../games/catalogue'
import { latestInProgress, subscribeDrawings } from '../storage/DrawingRepository'
import type { SavedDrawing } from '../storage/types'
import '../styles/ui.css'
import './HomePage.css'

/** Which tab the child was on, so coming back from a game lands there. */
const MODE_KEY = 'drawli.home.mode'

function rememberedMode(): CategoryKind | 'play' {
  try {
    const saved = sessionStorage.getItem(MODE_KEY)
    if (saved === 'draw' || saved === 'write' || saved === 'play') return saved
  } catch { /* private mode has no storage; the default tab is fine */ }
  return 'draw'
}

const PLAY_LANGUAGES: Array<{ id: WordLanguage; label: string }> = [
  { id: 'uk', label: 'Українська' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
]

export function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const settings = useAppStore((s) => s.settings)
  const markTutorialDone = useAppStore((s) => s.markTutorialDone)

  useEffect(() => {
    if (settings?.language) setPlayLanguage(settings.language)
  }, [settings?.language])

  const [index, setIndex] = useState<ExerciseIndex | null>(null)
  const [mode, setMode] = useState<CategoryKind | 'play'>(rememberedMode)
  const [category, setCategory] = useState<string>('all')
  const [playLanguage, setPlayLanguage] = useState<WordLanguage>('uk')
  const [resume, setResume] = useState<SavedDrawing | null>(null)

  useEffect(() => {
    void loadIndex().then(setIndex).catch(() => undefined)

    const refresh = () => { void latestInProgress().then((d) => setResume(d ?? null)) }
    refresh()
    // Autosave can land just after the child leaves the drawing screen.
    return subscribeDrawings(refresh)
  }, [])

  // Modes split the library: pictures to draw, glyphs to write, games to play.
  const categories = useMemo(
    () => (index?.categories ?? [])
      .filter((c) => c.kind === (mode === 'play' ? 'draw' : mode))
      .slice()
      .sort((a, b) => a.order - b.order),
    [index, mode],
  )

  const exercises = useMemo(() => {
    const ids = new Set(categories.map((c) => c.id))
    const all = (index?.exercises ?? []).filter((e) => ids.has(e.category))
    return category === 'all' ? all : all.filter((e) => e.category === category)
  }, [index, categories, category])

  function switchMode(next: CategoryKind | 'play') {
    setMode(next)
    setCategory('all')
    try { sessionStorage.setItem(MODE_KEY, next) } catch { /* nothing to remember with */ }
  }

  const resumeExercise = index?.exercises.find((e) => e.id === resume?.exerciseId)

  // First visit only, and only once the cards are actually on screen.
  const showCoach = settings ? !settings.tutorialHomeDone && exercises.length > 0 : false
  const coachSteps: CoachStep[] = [
    {
      selector: '.home__grid .exercise-card',
      titleKey: 'coach.home.pickTitle',
      textKey: 'coach.home.pickText',
      placement: 'below',
    },
    {
      selector: '.home__nav',
      titleKey: 'coach.home.navTitle',
      textKey: 'coach.home.navText',
      placement: 'above',
    },
  ]

  return (
    <div className="screen home">
      <header className="row">
        <div className="row grow" style={{ gap: 10 }}>
          <div className="home__logo">
            <Icon name="pencil" size={24} color="#fff" />
          </div>
          <div>
            <div className="home__brand" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>
              Drawli
            </div>
            {settings ? (
              <div className="muted home__greeting" style={{ fontSize: 15 }}>
                {t('home.greeting', { name: settings.childName })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="star-badge">
          <Icon name="star" size={24} color="var(--c-star)" filled />
          {settings?.stars ?? 0}
        </div>

        <button className="icon-btn" onClick={() => navigate('/settings')} aria-label={t('nav.settings')}>
          <Icon name="gear" size={26} color="var(--c-text-muted)" width={2} />
        </button>
      </header>

      {resume && resumeExercise ? (
        <button className="resume" onClick={() => navigate(`/draw/${resume.exerciseId}`)}>
          <span className="resume__thumb">
            <img src={assetUrl(resumeExercise.thumbnail)} alt="" />
          </span>
          <span className="resume__text">
            <span className="resume__title">{t('home.resume')}</span>
            <span className="muted" style={{ fontSize: 15 }}>
              {t('home.resumeStep', {
                title: t(resumeExercise.titleKey),
                step: Math.min(resume.currentStep + 1, resumeExercise.steps),
                total: resumeExercise.steps,
              })}
            </span>
          </span>
          <span className="btn btn--primary" style={{ pointerEvents: 'none' }}>
            <Icon name="play" size={20} color="#fff" filled />
            {t('home.continue')}
          </span>
        </button>
      ) : null}

      <div className="mode-tabs">
        <button className={`mode-tab ${mode === 'draw' ? 'mode-tab--on' : ''}`} onClick={() => switchMode('draw')}>
          <Icon name="pencil" size={24} color={mode === 'draw' ? '#fff' : 'var(--c-text-muted)'} />
          <span className="mode-tab__full">{t('mode.draw')}</span>
          <span className="mode-tab__short">{t('mode.drawShort')}</span>
        </button>
        <button className={`mode-tab ${mode === 'write' ? 'mode-tab--on' : ''}`} onClick={() => switchMode('write')}>
          <span className="mode-tab__glyph">Aa1</span>
          <span className="mode-tab__full">{t('mode.write')}</span>
          <span className="mode-tab__short">{t('mode.writeShort')}</span>
        </button>
        <button className={`mode-tab ${mode === 'play' ? 'mode-tab--on' : ''}`} onClick={() => switchMode('play')}>
          <Icon name="star" size={24} color={mode === 'play' ? '#fff' : 'var(--c-text-muted)'} filled={mode === 'play'} />
          <span className="mode-tab__full">{t('mode.play')}</span>
          <span className="mode-tab__short">{t('mode.playShort')}</span>
        </button>
      </div>

      <div className="row home__head" style={{ gap: 12 }}>
        <div className="title grow home__question">
          {mode === 'play' ? t('play.title') : mode === 'write' ? t('home.writeQuestion') : t('home.question')}
        </div>

        {/* Games have no categories — the choice that matters there is the
            language the child wants to play in. */}
        {mode === 'play' ? (
          <div className="home__categories scroll-row">
            {PLAY_LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                className={`chip ${playLanguage === lang.id ? 'chip--on' : ''}`}
                onClick={() => setPlayLanguage(lang.id)}
              >
                {lang.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="home__categories scroll-row">
            <button className={`chip ${category === 'all' ? 'chip--on' : ''}`} onClick={() => setCategory('all')}>
              {t('home.all')}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`chip ${category === c.id ? 'chip--on' : ''}`}
                onClick={() => setCategory(c.id)}
              >
                {t(c.titleKey)}
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === 'play' ? (
        <div className="home__grid">
          {gamesFor(playLanguage).map((game) => (
            <button
              key={game.id}
              className="exercise-card game-card"
              onClick={() => navigate(`${game.path}?lang=${playLanguage}`)}
            >
              <span className="game-card__art">{game.art}</span>
              <span>{t(game.titleKey)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="home__grid">
          {mode === 'draw' ? (
            <button className="exercise-card free-card" onClick={() => navigate('/free')}>
              <span className="free-card__art">
                <Icon name="pencil" size={40} color="#fff" />
              </span>
              <span>{t('free.title')}</span>
            </button>
          ) : null}

          {/* The library is a hundred and fifty pictures. Decoding all of them
              for a screen that shows a dozen is work a tablet pays for on
              every visit home, so the ones below the fold wait their turn. */}
          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              className={`exercise-card ${exercise.glyph ? 'exercise-card--glyph' : ''}`}
              onClick={() => navigate(`/draw/${exercise.id}`)}
            >
              {exercise.glyph ? (
                <span className="exercise-card__glyph">{exercise.glyph}</span>
              ) : (
                <img src={assetUrl(exercise.thumbnail)} alt="" loading="lazy" decoding="async" />
              )}
              {/* The glyph is its own label; text only when it adds something
                  (Spanish letters carry their spoken name). */}
              {t(exercise.titleKey) === exercise.glyph ? null : (
                <span className="exercise-card__label">{t(exercise.titleKey)}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* The blank sheet, the gallery and progress belong to drawing. Letters,
          numbers and games get the screen to themselves. */}
      {mode === 'draw' ? (
      <nav className="home__nav">
        <button className="btn btn--primary" onClick={() => navigate('/free')}>
          <Icon name="pencil" size={26} color="#fff" />
          {t('free.title')}
        </button>
        <button className="btn" onClick={() => navigate('/drawings')}>
          <Icon name="gallery" size={26} color="var(--c-text-muted)" />
          {t('nav.drawings')}
        </button>
        <button className="btn" onClick={() => navigate('/progress')}>
          <Icon name="star" size={26} color="var(--c-text-muted)" />
          {t('nav.progress')}
        </button>
      </nav>
      ) : null}

      {showCoach ? (
        <CoachMarks steps={coachSteps} onDone={() => void markTutorialDone('home')} />
      ) : null}
    </div>
  )
}

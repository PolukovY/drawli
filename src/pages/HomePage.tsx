import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../app/store'
import { Icon } from '../components/Icon'
import { CoachMarks, type CoachStep } from '../components/CoachMarks'
import { assetUrl, loadIndex } from '../exercise/ExerciseLoader'
import type { ExerciseIndex } from '../exercise/Exercise'
import { latestInProgress } from '../storage/DrawingRepository'
import type { SavedDrawing } from '../storage/types'
import '../styles/ui.css'
import './HomePage.css'

export function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const settings = useAppStore((s) => s.settings)
  const markTutorialDone = useAppStore((s) => s.markTutorialDone)

  const [index, setIndex] = useState<ExerciseIndex | null>(null)
  const [category, setCategory] = useState<string>('all')
  const [resume, setResume] = useState<SavedDrawing | null>(null)

  useEffect(() => {
    void loadIndex().then(setIndex).catch(() => undefined)
    void latestInProgress().then((d) => setResume(d ?? null))
  }, [])

  const categories = useMemo(
    () => (index?.categories ?? []).slice().sort((a, b) => a.order - b.order),
    [index],
  )

  const exercises = useMemo(() => {
    const all = index?.exercises ?? []
    return category === 'all' ? all : all.filter((e) => e.category === category)
  }, [index, category])

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
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>Drawli</div>
            {settings ? (
              <div className="muted" style={{ fontSize: 15 }}>
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

      <div className="row" style={{ gap: 12 }}>
        <div className="title grow">{t('home.question')}</div>
        <div className="home__categories">
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
      </div>

      <div className="home__grid">
        {exercises.map((exercise) => (
          <button
            key={exercise.id}
            className="exercise-card"
            onClick={() => navigate(`/draw/${exercise.id}`)}
          >
            <img src={assetUrl(exercise.thumbnail)} alt="" />
            <span>{t(exercise.titleKey)}</span>
          </button>
        ))}
      </div>

      <nav className="home__nav">
        <button className="btn btn--primary" onClick={() => navigate('/')}>
          <Icon name="pencil" size={26} color="#fff" />
          {t('nav.draw')}
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

      {showCoach ? (
        <CoachMarks steps={coachSteps} onDone={() => void markTutorialDone('home')} />
      ) : null}
    </div>
  )
}

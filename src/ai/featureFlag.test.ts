import { afterEach, describe, expect, it, vi } from 'vitest'
import { isAiFeatureEnabled } from './featureFlag'

describe('isAiFeatureEnabled', () => {
  afterEach(() => { vi.unstubAllEnvs() })

  it('defaults to enabled when unset', () => {
    vi.stubEnv('VITE_AI_FEATURE_ENABLED', undefined)
    expect(isAiFeatureEnabled()).toBe(true)
  })

  it('is disabled only when explicitly set to "false"', () => {
    vi.stubEnv('VITE_AI_FEATURE_ENABLED', 'false')
    expect(isAiFeatureEnabled()).toBe(false)
  })

  it('stays enabled for any other value', () => {
    vi.stubEnv('VITE_AI_FEATURE_ENABLED', 'true')
    expect(isAiFeatureEnabled()).toBe(true)
  })
})

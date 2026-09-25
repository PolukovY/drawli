import { describe, expect, it } from 'vitest'
import { NoopProvider } from './NoopProvider'

describe('NoopProvider', () => {
  it('reports as unsupported and unavailable', () => {
    const provider = new NoopProvider()
    expect(provider.isSupported()).toBe(false)
    expect(provider.status).toBe('unavailable')
  })

  it('load() resolves false without throwing', async () => {
    const provider = new NoopProvider()
    await expect(provider.load()).resolves.toBe(false)
  })

  it('every generate* method rejects, so callers fall back deterministically', async () => {
    const provider = new NoopProvider()
    await expect(provider.generateDistractors({ correctAnswer: 'cat', category: 'animal', count: 3 })).rejects.toThrow()
    await expect(provider.generateHint({ context: 'the word CAT' })).rejects.toThrow()
    await expect(provider.generateVariation({ prompt: 'say something nice' })).rejects.toThrow()
    await expect(provider.generateDrawingPrompt({})).rejects.toThrow()
    await expect(provider.generateStory({ topic: 'a happy dog' })).rejects.toThrow()
  })

  it('unload() and abort() are safe no-ops', () => {
    const provider = new NoopProvider()
    expect(() => { provider.unload() }).not.toThrow()
    expect(() => { provider.abort() }).not.toThrow()
  })
})

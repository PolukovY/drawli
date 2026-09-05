import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateSpeakRequest } from '../validate.mjs'

test('accepts a well-formed request', () => {
  assert.equal(validateSpeakRequest({ text: 'яблуко', locale: 'uk-UA' }), null)
  assert.equal(validateSpeakRequest({ text: 'manzana', locale: 'es-ES', speed: 0.9, style: 'child-friendly' }), null)
})

test('rejects missing or empty text', () => {
  assert.ok(validateSpeakRequest({ locale: 'uk-UA' }))
  assert.ok(validateSpeakRequest({ text: '   ', locale: 'uk-UA' }))
})

test('rejects text over the length limit', () => {
  assert.ok(validateSpeakRequest({ text: 'a'.repeat(500), locale: 'en-US' }))
})

test('rejects markup-looking text', () => {
  assert.ok(validateSpeakRequest({ text: '<script>alert(1)</script>', locale: 'en-US' }))
})

test('rejects a locale outside the allow-list — this is what keeps es-MX/es-US from ever being requested by accident', () => {
  assert.ok(validateSpeakRequest({ text: 'hola', locale: 'es-MX' }))
  assert.ok(validateSpeakRequest({ text: 'hola', locale: 'ru-RU' }))
})

test('rejects an out-of-range speed', () => {
  assert.ok(validateSpeakRequest({ text: 'hi', locale: 'en-US', speed: 3 }))
  assert.ok(validateSpeakRequest({ text: 'hi', locale: 'en-US', speed: 0.1 }))
})

test('rejects an unknown style', () => {
  assert.ok(validateSpeakRequest({ text: 'hi', locale: 'en-US', style: 'dramatic' }))
})

test('rejects a non-object body', () => {
  assert.ok(validateSpeakRequest(null))
  assert.ok(validateSpeakRequest('hi'))
})

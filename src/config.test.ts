import { expect, test } from 'claude-code/testing'

import { DEFAULT_CONFIG, parseConfig } from './config'

test('options が空なら既定値になる', async () => {
  expect(parseConfig({})).toEqual(DEFAULT_CONFIG)
})

test('テーマの色キーと #RRGGBB を受け付ける', async () => {
  expect(parseConfig({ borderColor: 'claude' }).borderColor).toBe('claude')
  expect(parseConfig({ borderColor: '#ff8800' }).borderColor).toBe('#ff8800')
})

test('不正な色は既定値に戻る', async () => {
  for (const borderColor of ['nope', '#fff', '#gggggg', '', 'inverseText']) {
    expect(parseConfig({ borderColor }).borderColor).toBe(DEFAULT_CONFIG.borderColor)
  }
})

test('一覧にない線の種類は既定値に戻る', async () => {
  expect(parseConfig({ borderStyle: 'double' }).borderStyle).toBe('double')
  expect(parseConfig({ borderStyle: 'wavy' }).borderStyle).toBe(DEFAULT_CONFIG.borderStyle)
  expect(parseConfig({ borderStyle: 3 }).borderStyle).toBe(DEFAULT_CONFIG.borderStyle)
})

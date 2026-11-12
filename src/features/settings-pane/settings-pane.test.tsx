import type { ConfigRow, ConfigSetInput, On } from 'claude-code'
import type { Engine } from 'claude-code/testing'
import { expect, test } from 'claude-code/testing'

import { PANE_ID } from '.'

const PANE = {
  plugin: 'prompt-frame',
  component: 'Pane',
  requestId: PANE_ID,
  props: {
    title: 'Prompt frame',
    isFocused: true,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

const row = (field: string, value: string): ConfigRow => ({
  key: `prompt-frame@inline.${field}`,
  label: field,
  kind: 'text',
  value,
  provider: { plugin: 'prompt-frame@inline', tier: 'user' },
  isLocked: false,
}) as ConfigRow

/** エンジンの代わりに /config の行と書き込みを受け持つ */
const fakeConfig = (on: On) => {
  const writes: Pick<ConfigSetInput, 'key' | 'value'>[] = []

  on('config.list', () => ({ value: [row('borderColor', 'suggestion'), row('borderStyle', 'round')] }))
  on('config.set', (_, e) => {
    writes.push({ key: e.key, value: e.value })

    return { value: e.value }
  })

  return writes
}

const mount = ($: Engine) => $.ui.mount({ ...PANE, surface: 'terminal' })

test('パネルに今の設定と見本の枠が出る', async $ => {
  const ui = await mount($)

  expect((await ui.find({ key: 'borderColor' }))?.props).toMatchObject({ value: 'suggestion' })
  expect((await ui.find({ key: 'borderStyle' }))?.props).toMatchObject({ value: 'round' })
  expect(await ui.find({ type: 'Text', text: '見本のプロンプト' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Tab/ })).toBeDefined()
  await ui.unmount()
})

test('色を選ぶと userConfig の borderColor を書き換える', async ($, on) => {
  const writes = fakeConfig(on)
  const ui = await mount($)

  await ui.select({ key: 'borderColor', value: 'claude' })

  expect(writes).toEqual([{ key: 'prompt-frame@inline.borderColor', value: 'claude' }])
  await ui.unmount()
})

test('線の種類を選ぶと userConfig の borderStyle を書き換える', async ($, on) => {
  const writes = fakeConfig(on)
  const ui = await mount($)

  await ui.select({ key: 'borderStyle', value: 'double' })

  expect(writes).toEqual([{ key: 'prompt-frame@inline.borderStyle', value: 'double' }])
  await ui.unmount()
})

test('/prompt-frame でパネルが開く', async ($, on) => {
  const opened: string[] = []

  on('ui.open', (_, e) => {
    opened.push(e.id)

    return { value: { isPlaced: true } }
  })

  await $.command.run({
    command: 'prompt-frame',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 80 },
  })

  expect(opened).toEqual([PANE_ID])
})

test('パネルを開けなかったときは、その旨を返す', async ($, on) => {
  on('ui.open', () => {
    throw new Error('dummy failure')
  })

  const result = await $.command.run({
    command: 'prompt-frame',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 80 },
  })

  expect(result.text).toBe('枠の設定パネルを開けませんでした')
})

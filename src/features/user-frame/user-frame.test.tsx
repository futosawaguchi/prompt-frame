import type { RenderPropsOf, RenderSurface } from 'claude-code'
import type { Engine } from 'claude-code/testing'
import { expect, test } from 'claude-code/testing'

// テストではダミーの文字列だけを使う
const prompt = (overrides: Partial<RenderPropsOf['UserMessage']> = {}): RenderPropsOf['UserMessage'] => ({
  text: 'dummy prompt',
  origin: { kind: 'composer' },
  isExpanded: false,
  ...overrides,
})

const mount = ($: Engine, surface: RenderSurface, props: RenderPropsOf['UserMessage']) =>
  $.ui.mount({ plugin: 'prompt-frame', surface, component: 'UserMessage', requestId: 'm1', props })

test('ターミナルで自分が入力したプロンプトは既定の枠で囲まれる', async $ => {
  const ui = await mount($, 'terminal', prompt())

  expect(await ui.drawn()).toMatchObject({
    type: 'Box',
    props: { borderStyle: 'round', borderColor: 'suggestion', paddingX: 1, alignSelf: 'flex-start' },
  })
  expect((await ui.find({ type: 'Text', text: 'dummy prompt' }))?.text).toBe('dummy prompt')
  await ui.unmount()
})

test(
  '設定した色と線の種類で囲まれる',
  { options: { borderColor: '#ff8800', borderStyle: 'double' } },
  async $ => {
    const ui = await mount($, 'terminal', prompt())

    expect(await ui.drawn()).toMatchObject({
      type: 'Box',
      props: { borderStyle: 'double', borderColor: '#ff8800' },
    })
    await ui.unmount()
  },
)

test('不正な色の設定は既定の色に戻る', { options: { borderColor: 'nope' } }, async $ => {
  const ui = await mount($, 'terminal', prompt())

  expect(await ui.drawn()).toMatchObject({ props: { borderColor: 'suggestion' } })
  await ui.unmount()
})

test('自分の入力でない行は囲まれない', async $ => {
  const others: RenderPropsOf['UserMessage'][] = [
    prompt({ origin: { kind: 'task-notification' }, task: { id: 't1', status: 'completed' } }),
    prompt({ origin: { kind: 'bridge' } }),
    prompt({ from: { name: 'dummy-agent' } }),
  ]

  for (const props of others) {
    const ui = await mount($, 'terminal', props)

    // エンジンの行がそのまま返る
    expect(await ui.drawn()).toMatchObject({ type: 'engine' })
    await ui.unmount()
  }
})

test('ターミナル以外の画面では囲まれない', async $ => {
  for (const surface of ['desktop', 'vscode', 'mobile'] as const) {
    const ui = await mount($, surface, prompt())

    // エンジンの行がそのまま返る
    expect(await ui.drawn()).toMatchObject({ type: 'engine' })
    await ui.unmount()
  }
})

import type { RenderPropsOf, RenderSurface } from 'claude-code'
import type { Engine } from 'claude-code/testing'
import { expect, test } from 'claude-code/testing'

// テストではダミーの文字列だけを使う
const answered = {
  questions: [{ question: 'Dummy question?', header: 'Dummy', options: [], multiSelect: false }],
  answers: { 'Dummy question?': 'Dummy answer' },
}

const result = (overrides: Partial<RenderPropsOf['ToolResult']> = {}): RenderPropsOf['ToolResult'] => ({
  tool_use_id: 't1',
  tool: 'AskUserQuestion',
  output: answered,
  isErrored: false,
  ...overrides,
})

const mount = ($: Engine, surface: RenderSurface, props: RenderPropsOf['ToolResult']) =>
  $.ui.mount({ plugin: 'prompt-frame', surface, component: 'ToolResult', requestId: 't1', props })

test('ターミナルでの質問への回答はプロンプトと同じ枠で囲まれる', async $ => {
  const ui = await mount($, 'terminal', result())

  expect(await ui.drawn()).toMatchObject({
    type: 'Box',
    props: { borderStyle: 'round', borderColor: 'suggestion', paddingX: 1, alignSelf: 'flex-start' },
  })
  expect((await ui.find({ type: 'Text', text: 'Dummy answer' }))?.text).toBe('Dummy answer')
  expect((await ui.find({ type: 'Text', text: 'Dummy →' }))?.text).toBe('Dummy →')
  await ui.unmount()
})

test(
  '設定した色と線の種類で囲まれる',
  { options: { borderColor: '#ff8800', borderStyle: 'double' } },
  async $ => {
    const ui = await mount($, 'terminal', result())

    expect(await ui.drawn()).toMatchObject({
      type: 'Box',
      props: { borderStyle: 'double', borderColor: '#ff8800' },
    })
    await ui.unmount()
  },
)

test('ほかのツール、エラー、答えのない結果は囲まれない', async $ => {
  const others: RenderPropsOf['ToolResult'][] = [
    result({ tool: 'Bash', output: { stdout: 'dummy', stderr: '' } }),
    result({ isErrored: true }),
    result({ output: { ...answered, answers: {} } }),
    result({ output: { ...answered, afkTimeoutMs: 60000 } }),
  ]

  for (const props of others) {
    const ui = await mount($, 'terminal', props)

    // エンジンの表示がそのまま返る
    expect(await ui.drawn()).toMatchObject({ type: 'engine' })
    await ui.unmount()
  }
})

test('ターミナル以外の画面では囲まれない', async $ => {
  for (const surface of ['desktop', 'vscode', 'mobile'] as const) {
    const ui = await mount($, surface, result())

    expect(await ui.drawn()).toMatchObject({ type: 'engine' })
    await ui.unmount()
  }
})

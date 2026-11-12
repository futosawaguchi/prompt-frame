// 自分のプロンプト（UserMessage）を枠で囲む機能のフック登録。
import type { On, RenderInput } from 'claude-code'

import type { Config } from '../../config'
import { renderFrame } from '../../shared/frame'

/** 枠で囲む行かどうか。ターミナルで自分が入力したプロンプトだけを対象にする。 */
export const shouldFrame = (
  e: RenderInput<'UserMessage'>,
): e is RenderInput<'UserMessage', 'terminal'> =>
  e.surface === 'terminal' &&
  e.props.origin.kind === 'composer' &&
  e.props.task === undefined &&
  e.props.from === undefined

export const registerUserFrame = (on: On, config: Config): void => {
  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if (!shouldFrame(e)) return next(e)

    // エンジンの行は上の余白と背景色を持つため、包まずに本文を描き直す
    const { Box, Text } = $.ui.resolve(e)

    return renderFrame({ Box, Text, text: e.props.text, config })
  })
}

// Claude の質問（AskUserQuestion）への自分の回答を、プロンプトと同じ枠で囲む機能のフック登録。
import type { On, RenderInput } from 'claude-code'

import type { Config } from '../../config'
import { renderFramedRows } from '../../shared/frame'
import { parseAnswers } from './answers'

/** 回答の行を出すツールの名前 */
export const ANSWER_TOOL = 'AskUserQuestion'

/** 枠で囲む結果かどうか。ターミナルの、エラーで終わっていない AskUserQuestion の結果だけを対象にする。 */
export const shouldFrameAnswer = (
  e: RenderInput<'ToolResult'>,
): e is RenderInput<'ToolResult', 'terminal'> =>
  e.surface === 'terminal' && e.props.tool === ANSWER_TOOL && !e.props.isErrored

export const registerAnswerFrame = (on: On, config: Config): void => {
  on('ui.render', { component: 'ToolResult' }, async ($, e, next) => {
    if (!shouldFrameAnswer(e)) return next(e)

    const rows = parseAnswers(e.props.output)
    if (rows === undefined) return next(e)

    // 保存された結果は変えず、表示だけを描き直す
    const { Box, Text } = $.ui.resolve(e)

    return renderFramedRows({ Box, Text, rows, config })
  })
}

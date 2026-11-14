// AskUserQuestion の結果から、枠に並べる「質問 → 回答」の行を取り出す。
// 結果は unknown として届くので、形を確かめながら読む。
import type { FrameRow } from '../../shared/frame'

type Question = { readonly question: string; readonly header?: string }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const nonEmpty = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined

const readQuestions = (value: unknown): Question[] =>
  Array.isArray(value)
    ? value.flatMap(item => {
        if (!isRecord(item)) return []
        const question = nonEmpty(item['question'])
        return question === undefined ? [] : [{ question, header: nonEmpty(item['header']) }]
      })
    : []

const readNote = (annotations: unknown, question: string): string | undefined => {
  if (!isRecord(annotations)) return undefined
  const entry = annotations[question]
  return isRecord(entry) ? nonEmpty(entry['notes']) : undefined
}

/**
 * 利用者が答えた行だけを返す。答えがない、または席を外していて自動で閉じた
 * （afkTimeoutMs がある）ときは undefined を返し、エンジンの表示に任せる。
 */
export const parseAnswers = (output: unknown): FrameRow[] | undefined => {
  if (!isRecord(output) || output['afkTimeoutMs'] !== undefined) return undefined

  const answers = isRecord(output['answers']) ? output['answers'] : {}
  const rows: FrameRow[] = readQuestions(output['questions']).flatMap(({ question, header }) => {
    const text = nonEmpty(answers[question])
    if (text === undefined) return []
    const note = readNote(output['annotations'], question)
    return [{ label: header ?? question, text, ...(note === undefined ? {} : { note }) }]
  })

  // 選択肢を選ばずに文章で答えたとき
  const response = nonEmpty(output['response'])
  if (response !== undefined) rows.push({ text: response })

  return rows.length === 0 ? undefined : rows
}

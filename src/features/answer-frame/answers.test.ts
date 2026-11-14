import { expect, test } from 'claude-code/testing'

import { parseAnswers } from './answers'

// テストではダミーの文字列だけを使う
const questions = [
  { question: 'Dummy question one?', header: 'One', options: [], multiSelect: false },
  { question: 'Dummy question two?', header: 'Two', options: [], multiSelect: true },
]

test('答えた質問だけが見出しと回答の行になる', async () => {
  expect(
    parseAnswers({ questions, answers: { 'Dummy question one?': 'Alpha' } }),
  ).toEqual([{ label: 'One', text: 'Alpha' }])
})

test('メモと文章での回答も行に入る', async () => {
  expect(
    parseAnswers({
      questions,
      answers: { 'Dummy question one?': 'Alpha', 'Dummy question two?': 'Beta, Gamma' },
      annotations: { 'Dummy question two?': { notes: 'dummy note' } },
      response: 'dummy free text',
    }),
  ).toEqual([
    { label: 'One', text: 'Alpha' },
    { label: 'Two', text: 'Beta, Gamma', note: 'dummy note' },
    { text: 'dummy free text' },
  ])
})

test('見出しがなければ質問の文を使う', async () => {
  expect(
    parseAnswers({ questions: [{ question: 'Dummy question?' }], answers: { 'Dummy question?': 'Yes' } }),
  ).toEqual([{ label: 'Dummy question?', text: 'Yes' }])
})

test('答えがない、自動で閉じた、形が違うときは何も返さない', async () => {
  expect(parseAnswers({ questions, answers: {} })).toBeUndefined()
  expect(
    parseAnswers({ questions, answers: { 'Dummy question one?': 'Alpha' }, afkTimeoutMs: 60000 }),
  ).toBeUndefined()
  expect(parseAnswers('dummy')).toBeUndefined()
  expect(parseAnswers(undefined)).toBeUndefined()
})

import { expect, test } from 'claude-code/testing'

import { colorOptions } from './render'

test('テーマの色なら選択肢はテーマの色だけ', async () => {
  expect(colorOptions('claude')[0]).toEqual({ value: 'text' })
})

test('#RRGGBB の色は選択肢の先頭にカスタムとして足す', async () => {
  expect(colorOptions('#ff8800')[0]).toEqual({ value: '#ff8800', label: '#ff8800（カスタム）' })
})

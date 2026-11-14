// 枠で囲んだプロンプトの描画。user-frame、answer-frame、settings-pane の見本で使う。
// $ は受け取らず、要素と値だけで組み立てる。
import type { ElementTable, RenderElement } from 'claude-code'

import type { Config } from '../config'

/** エンジンがプロンプトの先頭に付ける印と同じもの */
export const PROMPT_MARKER = '❯'

type FrameElements = {
  readonly Box: ElementTable<'terminal'>['Box']
  readonly Text: ElementTable<'terminal'>['Text']
}

type RenderFrameInput = FrameElements & {
  readonly text: string
  readonly config: Config
}

/** 枠の中の 1 行。label は薄く描き、text を目立たせる */
export type FrameRow = {
  readonly label?: string
  readonly text: string
  readonly note?: string
}

type RenderFramedRowsInput = FrameElements & {
  readonly rows: readonly FrameRow[]
  readonly config: Config
}

export const renderFrame = ({ Box, Text, text, config }: RenderFrameInput): RenderElement => (
  // alignSelf で枠を本文の幅まで縮める。上の余白は枠の外に取る
  <Box
    marginTop={1}
    alignSelf="flex-start"
    borderStyle={config.borderStyle}
    borderColor={config.borderColor}
    paddingX={1}
  >
    <Text dimColor>{PROMPT_MARKER} </Text>
    <Text>{text}</Text>
  </Box>
)

/** 複数行を 1 つの枠で囲む。印は先頭の行だけに付け、2 行目からは字下げでそろえる */
export const renderFramedRows = ({ Box, Text, rows, config }: RenderFramedRowsInput): RenderElement => (
  <Box
    marginTop={1}
    alignSelf="flex-start"
    flexDirection="column"
    borderStyle={config.borderStyle}
    borderColor={config.borderColor}
    paddingX={1}
  >
    {rows.map((row, index) => (
      <Box key={String(index)} flexDirection="column">
        <Box>
          {/* 回答が長いと行の中身が縮められるので、印と字下げの幅は固定する */}
          <Box flexShrink={0} width={2}>
            <Text dimColor>{index === 0 ? PROMPT_MARKER : ''}</Text>
          </Box>
          {row.label === undefined ? null : (
            // 末尾の空白は回答が折り返すと削られるので、余白で間を空ける
            <Box flexShrink={0} marginRight={1}>
              <Text dimColor>{row.label} →</Text>
            </Box>
          )}
          <Text>{row.text}</Text>
        </Box>
        {row.note === undefined ? null : (
          <Box paddingLeft={4}>
            <Text dimColor>メモ: {row.note}</Text>
          </Box>
        )}
      </Box>
    ))}
  </Box>
)

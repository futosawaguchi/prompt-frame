// 枠で囲んだプロンプトの描画。user-frame と settings-pane の見本の両方で使う。
// $ は受け取らず、要素と値だけで組み立てる。
import type { ElementTable, RenderElement } from 'claude-code'

import type { Config } from '../config'

/** エンジンがプロンプトの先頭に付ける印と同じもの */
export const PROMPT_MARKER = '❯'

type RenderFrameInput = {
  readonly Box: ElementTable<'terminal'>['Box']
  readonly Text: ElementTable<'terminal'>['Text']
  readonly text: string
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

// 設定パネルの描画。$ は受け取らず、要素と値とハンドラだけで組み立てる。
import type { ElementTable, RenderElement, SelectOption } from 'claude-code'

import { BORDER_STYLES, THEME_COLORS, type Config } from '../../config'
import { renderFrame } from '../../shared/frame'

type Elements = ElementTable<'terminal'>

type RenderSettingsPaneInput = {
  readonly Box: Elements['Box']
  readonly Text: Elements['Text']
  readonly Select: Elements['Select']
  readonly Button: Elements['Button']
  readonly config: Config
  readonly onColor: (value: string) => void
  readonly onStyle: (value: string) => void
  readonly onClose: () => void
}

const SAMPLE_TEXT = '見本のプロンプト'

/** Select にフォーカスがあると矢印は選択肢の切り替えに使われるので、項目の移動は Tab で行う */
export const KEY_HINT = 'Tab / Shift+Tab: 項目の移動  ↑↓: 選ぶ  Enter: 決定  Esc: プロンプトに戻る'

/** 今の色が #RRGGBB なら、選択肢の先頭に足して選ばれた状態で見せる */
export const colorOptions = (current: string): SelectOption[] => {
  const themes: SelectOption[] = THEME_COLORS.map(value => ({ value }))

  return (THEME_COLORS as readonly string[]).includes(current)
    ? themes
    : [{ value: current, label: `${current}（カスタム）` }, ...themes]
}

export const styleOptions = (): SelectOption[] => BORDER_STYLES.map(value => ({ value }))

export const renderSettingsPane = ({
  Box,
  Text,
  Select,
  Button,
  config,
  onColor,
  onStyle,
  onClose,
}: RenderSettingsPaneInput): RenderElement => (
  <Box flexDirection="column">
    <Select
      key="borderColor"
      label="色 "
      options={colorOptions(config.borderColor)}
      value={config.borderColor}
      onSelect={onColor}
      autoFocus
    />
    <Select
      key="borderStyle"
      label="線 "
      options={styleOptions()}
      value={config.borderStyle}
      onSelect={onStyle}
    />
    {renderFrame({ Box, Text, text: SAMPLE_TEXT, config })}
    <Box marginTop={1} flexDirection="column">
      <Text dimColor>{KEY_HINT}</Text>
      <Text dimColor>#RRGGBB の色は /config の Border color から設定できます</Text>
    </Box>
    <Box marginTop={1}>
      <Button key="close" label="閉じる" onPress={onClose} />
    </Box>
  </Box>
)

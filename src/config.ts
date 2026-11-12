// userConfig の読み取り・検証・既定値。設定値はすべてここを通して読む。
import type { PluginOptions, ThemeKey } from 'claude-code'

/** 枠の線の種類として受け付ける値。plugin.json の options と揃える。 */
export const BORDER_STYLES = ['round', 'single', 'double', 'bold', 'dashed', 'classic'] as const

export type BorderStyle = (typeof BORDER_STYLES)[number]

/** 枠の色として受け付けるテーマの色キー。 */
export const THEME_COLORS = [
  'text',
  'inactive',
  'subtle',
  'suggestion',
  'remember',
  'success',
  'error',
  'warning',
  'merged',
  'claude',
  'permission',
  'planMode',
  'autoAccept',
  'promptBorder',
  'bashBorder',
  'ide',
] as const satisfies readonly ThemeKey[]

export type ConfigField = 'borderColor' | 'borderStyle'

export type Config = {
  /** テーマの色キー、または #RRGGBB */
  readonly borderColor: string
  readonly borderStyle: BorderStyle
}

export const DEFAULT_CONFIG: Config = {
  borderColor: 'suggestion',
  borderStyle: 'round',
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

const isOneOf = <T extends string>(values: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (values as readonly string[]).includes(value)

export const parseBorderColor = (value: unknown): string => {
  if (isOneOf(THEME_COLORS, value)) return value
  if (typeof value === 'string' && HEX_COLOR.test(value)) return value

  return DEFAULT_CONFIG.borderColor
}

export const parseBorderStyle = (value: unknown): BorderStyle =>
  isOneOf(BORDER_STYLES, value) ? value : DEFAULT_CONFIG.borderStyle

/** register に渡された options を検証し、不正な値は既定値に戻す。 */
export const parseConfig = (options: PluginOptions): Config => ({
  borderColor: parseBorderColor(options['borderColor']),
  borderStyle: parseBorderStyle(options['borderStyle']),
})

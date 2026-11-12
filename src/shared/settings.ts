// userConfig の値を書き換える。/config と同じ設定を書くので、どちらから変えても同じ値になる。
import type { EngineInterface } from 'claude-code'

import type { ConfigField } from '../config'

export const PLUGIN_NAME = 'prompt-frame'

/** `/config` の行のキーは `<plugin>.<field>`。--plugin-dir では `<plugin>@inline` になることもある */
const isOwnRow = (key: string, field: ConfigField): boolean => {
  const dot = key.lastIndexOf('.')
  const plugin = key.slice(0, dot).split('@')[0]

  return plugin === PLUGIN_NAME && key.slice(dot + 1) === field
}

/** 設定を書き換える。断られたときはその理由を返す */
// 別ファイルから $ を受け取る関数は function 宣言で書く（エンジンの決まり）
export async function setOption(
  $: EngineInterface,
  field: ConfigField,
  value: string,
): Promise<string | undefined> {
  const rows = await $.config.list()
  const row = rows.find(one => isOwnRow(one.key, field))

  if (row === undefined) return `設定項目 ${field} が見つかりません`

  const result = await $.config.set({ key: row.key, value })

  return result.deny
}

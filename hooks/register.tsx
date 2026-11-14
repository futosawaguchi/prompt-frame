// エントリポイント。設定を読み、各機能の登録関数を呼ぶだけにする。
import type { Register } from 'claude-code'

import { parseConfig } from '../src/config'
import { registerAnswerFrame } from '../src/features/answer-frame'
import { registerSettingsPane } from '../src/features/settings-pane'
import { registerUserFrame } from '../src/features/user-frame'

export const register: Register = (on, options) => {
  const config = parseConfig(options)

  registerUserFrame(on, config)
  registerAnswerFrame(on, config)
  registerSettingsPane(on, config)
}

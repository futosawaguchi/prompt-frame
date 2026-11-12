// /prompt-frame で開く設定パネル。色と線の種類を選ぶと userConfig を書き換える。
import type { On } from 'claude-code'

import type { Config, ConfigField } from '../../config'
import { PLUGIN_NAME, setOption } from '../../shared/settings'
import { renderSettingsPane } from './render'

export const COMMAND_NAME = PLUGIN_NAME
export const PANE_ID = 'prompt-frame-settings'
const PANE_TITLE = 'Prompt frame'

export const registerSettingsPane = (on: On, config: Config): void => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND_NAME,
      description: 'プロンプトの枠の色と線の種類を選ぶパネルを開く',
    })

    return next(e)
  })

  on('command.run', { command: COMMAND_NAME }, async $ => {
    await $.ui.open({ id: PANE_ID, title: PANE_TITLE, focus: true })

    return { text: '枠の設定パネルを開きました' }
  }).catch(($, e, next) =>
    // パネルを開けなかったときは、その旨だけを返してコマンドを終える
    next.called ? next(e) : { text: '枠の設定パネルを開けませんでした' },
  )

  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {
    if (e.surface !== 'terminal') {
      const { Text } = $.ui.resolve(e)

      return <Text dimColor>この設定パネルはターミナルで使ってください</Text>
    }

    const { Box, Text, Select, Button } = $.ui.resolve(e)
    const apply = (field: ConfigField) => async (value: string) => {
      const deny = await setOption($, field, value)

      if (deny !== undefined) $.ui.toast(`設定を変えられませんでした: ${deny}`)
    }

    return renderSettingsPane({
      Box,
      Text,
      Select,
      Button,
      config,
      onColor: apply('borderColor'),
      onStyle: apply('borderStyle'),
      onClose: () => $.ui.close({ id: PANE_ID }),
    })
  })
}

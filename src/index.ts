import fs from 'fs'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { createNodeWebSocket } from '@hono/node-ws'
import { AnthropicClient } from './AnthropicClient.js'
import type { Config } from './types.js'

// 設定ファイルの読み込み
const config: Config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))

// anthoropic client の起動
const anthropicClient = new AnthropicClient({ apiKey: config.claudeApiKey })
anthropicClient.on('recive_assistant_message', ({ message }) => { console.log(`Claude: ${message}`) })
await anthropicClient.setupTools(config.mcpServers || {})

const app = new Hono()
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

app.get(
  '/ws',
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`)
        ws.send('Hello from server!')
      },
      onClose: () => {
        console.log('Connection closed')
      },
    }
  })
)

const server = serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
injectWebSocket(server)

// 終了処理
const cleanup = async () => {
  await anthropicClient.dispose()
  process.exit(0)
}
process.on('SIGINT', async() => { await cleanup() })
process.on('SIGTERM', async() => { await cleanup() })

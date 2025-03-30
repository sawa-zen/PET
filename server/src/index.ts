import fs from 'fs'
import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'node:http';
import cors from 'cors';
import { AnthropicClient } from './AnthropicClient.js'
import type { Config, SocketEvents } from './types.js'

const app = express()
app.use(cors())
app.use(express.json())
const server = createServer(app)
const io = new Server<SocketEvents>(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// anthoropic client の起動
const config: Config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
const anthropicClient = new AnthropicClient({
  apiKey: config.claudeApiKey,
  systemPrompt: config.systemPrompt,
})
await anthropicClient.setupTools(config.mcpServers || {})
anthropicClient.on('recive_assistant_message', async ({ message, audioArrayBuffer }) => {
  console.log(`Claude: ${message}`)
  console.log('event: s_send_message')
  io.emit('s_send_message', {
    payload: {
      message: message || '',
      audioArrayBuffer,
    }
  })
})
anthropicClient.on('tool_use', async (event) => {
  console.log(`Claude: ${event.name} ${JSON.stringify(event.input)}`)
  console.log(`event: s_tool_use`)
  io.emit('s_tool_use', {
    payload: {
      name: event.name,
      input: event.input,
    }
  })
})
anthropicClient.on('receive_tool_result', (event) => {
  console.log(`event: s_tool_result`)
  io.emit('s_tool_result', { payload: { result: event } })
})
anthropicClient.on('conversation_timeout', () => {
  console.log('event: s_conversation_timeout')
  io.emit('s_conversation_timeout')
})
anthropicClient.on('show_list_card', (event) => {
  console.log(`event: s_show_list_card`)
  io.emit('s_show_list_card', { payload: { title: event.title, items: event.items } })
})
anthropicClient.on('show_detail_card', (event) => {
  console.log(`event: s_show_detail_card`)
  io.emit('s_show_detail_card', { payload: { title: event.title, description: event.description, imageUrl: event.imageUrl } })
})
anthropicClient.on('error', (event) => {
  console.error(`event: s_error`)
  io.emit('s_error', { message: event.message })
})

// socket.io の設定
io.on('connection', (socket) => {
  console.log('event: a user connected')
  socket.on('c_send_message', ({ payload }) => {
    console.log('event: c_send_message')
    if (payload.message === '') return
    console.log(`User: ${payload.message}`);
    anthropicClient.submitUserMessage(payload.message);
  });
  socket.on('disconnect', () => {
    console.log('event: user disconnected')
    anthropicClient.resetMessages()
  });
});


server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});


// 終了処理
const cleanup = async () => {
  await anthropicClient.dispose()
  process.exit(0)
}
process.on('SIGINT', async() => { await cleanup() })
process.on('SIGTERM', async() => { await cleanup() })

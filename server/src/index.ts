import fs from 'fs'
import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'node:http';
import { AnthropicClient } from './AnthropicClient.js'
import type { Config, SocketEvents } from './types.js'

const app = express()
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
anthropicClient.on('recive_assistant_message', ({ message }) => {
  console.log(`Claude: ${message}`)
  io.emit('s_send_message', { message: message.trim() })
})
await anthropicClient.setupTools(config.mcpServers || {})


// socket.io の設定
io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('c_send_message', ({ message }) => {
    if (message === '') return
    console.log(`message: ${message}`);
    anthropicClient.pushMessages({ role: 'user', content: message });
    anthropicClient.sendMessages();
  });
  socket.on('disconnect', () => {
    console.log('user disconnected')
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

import fs from 'fs'
import express from 'express'
import { AnthropicClient } from './AnthropicClient.js'
import type { Config } from './types.js'
import { Server } from 'socket.io'

// 設定ファイルの読み込み
const config: Config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))

// anthoropic client の起動
const anthropicClient = new AnthropicClient({ apiKey: config.claudeApiKey })
anthropicClient.on('recive_assistant_message', ({ message }) => { console.log(`Claude: ${message}`) })
await anthropicClient.setupTools(config.mcpServers || {})

import { createServer } from 'node:http';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
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

import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface MCPServer {
  command: string
  args: string[]
  env: Record<string, string>
}

export type MCPServers = Record<string, MCPServer>

export interface Config {
  claudeApiKey: string
  systemPrompt?: string
  mcpServers?: MCPServers
}

export type Transports = Record<string, StdioClientTransport>

export interface ClientSendMessageEvent {
  message: string
}

export interface ServerSendMessageEvent {
  message: string
}

export interface SocketEvents {
  c_send_message: (event: ClientSendMessageEvent) => void
  s_send_message: (event: ServerSendMessageEvent) => void
}

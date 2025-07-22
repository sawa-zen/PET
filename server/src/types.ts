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
  voiceboxEndpoint?: string
  mcpServers?: MCPServers
}

export type Transports = Record<string, StdioClientTransport>

export interface ClientSendMessageEvent {
  payload: {
    message: string
  }
}

export interface ServerSendMessageEvent {
  payload: {
    message: string
    audioArrayBuffer: ArrayBuffer
  }
}

export interface ServerToolUseEvent<T = Record<string, unknown>> {
  payload: {
    name: string
    input: T
  }
}

export interface ServerToolResultEvent<T = Record<string, unknown>> {
  payload: {
    result: T
  }
}

interface ListCardItem {
  title: string
  description?: string
  imageUrl?: string
}

export interface ServerShowListCardEvent {
  payload: {
    title: string
    items: ListCardItem[]
  }
}

export interface ServerShowDetailCardEvent {
  payload: {
    title: string
    description: string
    imageUrl?: string
  }
}

export interface SocketEvents {
  c_send_message: (event: ClientSendMessageEvent) => void
  s_send_message: (event: ServerSendMessageEvent) => void
  s_tool_use: (event: ServerToolUseEvent) => void
  s_tool_result: (event: ServerToolResultEvent) => void
  s_show_list_card: (event: ServerShowListCardEvent) => void
  s_show_detail_card: (event: ServerShowDetailCardEvent) => void
  s_conversation_timeout: () => void
  s_error: (event: { message: string }) => void
}

export interface AnthropicClientEventTypes {
  recive_assistant_message: {
    message: string
    audioArrayBuffer: ArrayBuffer
  }
  end_turn: void
  conversation_timeout: void
  tool_use: {
    input: Record<string, unknown>
    name: string
  }
  receive_tool_result: {
    tool_use_id: string
    content: string
  }
  show_list_card: {
    items: ListCardItem[]
  }
  show_detail_card: {
    title: string
    description: string
    imageUrl?: string
  }
  error: { message: string }
}
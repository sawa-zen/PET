export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

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

export interface ListCardItem {
  title: string
  description?: string
  imageUrl?: string
}

export interface ListCardData {
  title: string
  items: ListCardItem[]
}
export interface ServerShowListCardEvent {
  payload: ListCardData
}

export interface DetailCardData {
  title: string
  description: string
  imageUrl?: string
}
export interface ServerShowDetailCardEvent {
  payload: DetailCardData
}

export interface SocketEvents {
  c_send_message: (event: ClientSendMessageEvent) => void
  s_send_message: (event: ServerSendMessageEvent) => void
  s_tool_use: (event: ServerToolUseEvent) => void
  s_tool_result: (event: ServerToolResultEvent) => void
  s_show_list_card: (event: ServerShowListCardEvent) => void
  s_show_detail_card: (event: ServerShowDetailCardEvent) => void
  s_conversation_timeout: () => void
}

export type AvatarMotion = 'idle' | 'thinking' | 'search'

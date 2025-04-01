import Anthropic from '@anthropic-ai/sdk'
import { EventEmitter } from 'eventemitter3'
import type { TextBlock, ToolUseBlock } from '@anthropic-ai/sdk/resources.js'
import type { ChatMessage, MCPServers } from './types.js'
import { MCPClient } from './MCPClient.js'
import { convertMCPToolToAnthropicTool } from './utils.js'

interface Props {
  apiKey: string
  mcpServers?: MCPServers
}

interface EventTypes {
  recive_assistant_message: {
    message: string
  }
  end_turn: void
}

export class AnthropicClient extends EventEmitter<EventTypes> {
  private _anthropic: Anthropic
  private _mcpClient: MCPClient
  private _messages: ChatMessage[] = []
  private _model: string = 'claude-3-5-haiku-latest'
  private _maxTokens: number = 1000

  constructor({ apiKey }: Props) {
    super()
    this._anthropic = new Anthropic({ apiKey })
    this._mcpClient = new MCPClient()
  }

  setupTools = async (mcpServers: MCPServers) => {
    await this._mcpClient.startMcpServers(mcpServers)
  }

  /**
   * 会話履歴にメッセージを追加する
   */
  pushMessages = (message: ChatMessage) => {
    this._messages.push(message)
  }

  /**
   * Claudeにメッセージを送信する
   */
  sendMessages = async () => {
    const response = await this._anthropic.messages.create({
      model: this._model,
      max_tokens: this._maxTokens,
      messages: this._messages,
      tools: this._mcpClient.tools.map(convertMCPToolToAnthropicTool),
    })

    const contents = response.content || []
    contents.forEach((content) => {
      switch (content.type) {
        case 'text': this._textBlock(content); break
        case 'tool_use': this._toolUseBlock(content); break
      }
    })

    // Claudeの応答が完了であればイベントを発火
    if (response.stop_reason === 'end_turn') {
      this.emit('end_turn')
    }
  }

  /**
   * Claudeのテキストメッセージを受信したときの処理
   */
  private _textBlock = (content: TextBlock) => {
    const message = content.text
    this._messages.push({ role: 'assistant', content: message })
    this.emit('recive_assistant_message', { message })
  }

  /**
   * ツールの使用を受信したときの処理
   */
  private _toolUseBlock = async (content: ToolUseBlock) => {
    // ツールの使用を宣言
    const message = `ツールを使用します: ${content.name}\n入力: ${JSON.stringify(content.input)}`
    this._messages.push({ role: 'assistant', content: message })
    this.emit('recive_assistant_message', { message })

    // ツールを実行
    const response = await this._mcpClient.useTool(content.name, content.input as Record<string, unknown> || {})
    const toolResponse = `ツールの結果: ${JSON.stringify(response)}`
    this._messages.push({ role: 'assistant', content: toolResponse })

    // ツールの結果をClaudeに送信
    this.sendMessages()
  }

  /**
   * 破棄処理
   */
  dispose = async () => {
    await this._mcpClient.dispose()
    this._messages = []
  }
}

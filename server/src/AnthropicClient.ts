import Anthropic from '@anthropic-ai/sdk'
import { EventEmitter } from 'eventemitter3'
import type { MessageParam, Model, TextBlock, ToolUseBlock } from '@anthropic-ai/sdk/resources.js'
import type { AnthropicClientEventTypes, MCPServers } from './types.js'
import { MCPClient } from './MCPClient.js'
import { convertMCPToolToAnthropicTool } from './utils.js'
import { petTools } from './tools.js'
import { VoiceboxClient } from './VoiceboxClient.js'

interface Props {
  apiKey: string
  systemPrompt?: string
  voiceboxEndpoint?: string
}

export class AnthropicClient extends EventEmitter<AnthropicClientEventTypes> {
  private _anthropic: Anthropic
  private _mcpClient: MCPClient = new MCPClient()
  private _voiceboxClient: VoiceboxClient
  private _messageParams: MessageParam[] = []
  private _model: Model = 'claude-3-5-sonnet-latest'
  private _systemPropmt?: string
  private _maxTokens: number = 1000
  private _timeout: number = 1000 * 60 * 3 // 3分
  private _lastMessageTime: number | null = null

  constructor({ apiKey, systemPrompt, voiceboxEndpoint }: Props) {
    super()
    this._systemPropmt = systemPrompt
    this._anthropic = new Anthropic({ apiKey })
    this._voiceboxClient = new VoiceboxClient(voiceboxEndpoint)
  }

  setupTools = async (mcpServers: MCPServers) => {
    await this._mcpClient.startMcpServers(mcpServers)
  }

  /**
   * ユーザーからのメッセージを送信する
   */
  submitUserMessage = (message: string) => {
    if (message === '') return
    this._messageParams.push({ role: 'user', content: message })
    this._submit()
  }

  /**
   * Claudeにメッセージを送信する
   */
  private _submit = async () => {
    // メッセージ送信時に最後のメッセージ時間を更新
    this._lastMessageTime = Date.now()
    this._checkTimeout()

    try {
      const response = await this._anthropic.messages.create({
        model: this._model,
        max_tokens: this._maxTokens,
        messages: this._messageParams,
        tools: [
          ...this._mcpClient.tools.map(convertMCPToolToAnthropicTool),
          ...petTools
        ],
        system: this._systemPropmt,
      })

      // response.content に text があれば先に音声を作成して処理する
      const content = response.content
      const textBlock = content.find((c) => c.type === 'text') as TextBlock
      if (textBlock) {
        console.info('Claude response:', textBlock.text)
        const audioQuery = await this._voiceboxClient.audioQuery(textBlock.text)
        const audioArrayBuffer = await this._voiceboxClient.synthesis(audioQuery)
        this._messageParams.push({ role: 'assistant', content: textBlock.text })
        this.emit('recive_assistant_message', {
          message: textBlock.text,
          audioArrayBuffer: audioArrayBuffer
        })
        content.filter((c) => c.type !== 'text')
      }

      response.content?.forEach((content) => {
        switch (content.type) {
          case 'tool_use': this._toolUseBlock(content); break
        }
      })
    } catch (error) {
      console.error('Error in submitUserMessage:', error)
      this.emit('error', error)
    }
  }

  /**
   * 会話履歴をリセットする
   */
  resetMessages = () => { this._messageParams = [] }


  /**
   * ツールの使用を受信したときの処理
   */
  private _toolUseBlock = async (content: ToolUseBlock) => {
    // ツールの使用を宣言
    this._messageParams.push({
      role: 'assistant',
      content: [{
        type: 'tool_use',
        id: content.id,
        input: content.input,
        name: content.name,
      }]
    })

    // ツールを実行
    if (this._mcpClient.hasTool(content.name)) {
      this.emit('tool_use', { input: content.input, name: content.name })

      const response = await this._mcpClient.useTool(content.name, content.input as Record<string, unknown> || {})
      const toolResponse = JSON.stringify(response)
      console.info('Tool response:', JSON.stringify(response, null, '    '))
      this._messageParams.push({
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: content.id,
          content: toolResponse,
        }]
      })
      this.emit('receive_tool_result', { tool_use_id: content.id, content: toolResponse })
    } else if (content.name === 'pet_show_list_card' || content.name === 'pet_show_detail_card') {
      this._messageParams.push({
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: content.id,
          content: 'ユーザーにリストを表示しました。',
        }]
      })
      switch (content.name) {
        case 'pet_show_list_card': this.emit('show_list_card', content.input); break
        case 'pet_show_detail_card': this.emit('show_detail_card', content.input); break
      }
    } else if (content.name === 'pet_reset_conversation') {
      this.resetMessages()
      this.emit('conversation_timeout')
      return
    }
    this._submit()
  }


  /**
   * タイムアウトをチェックする
   */
  private _timeoutInterval: NodeJS.Timeout | null = null
  private _timeoutIntervalTime: number = 1000 // 1秒ごとにチェック
  private _checkTimeout = () => {
    if (!this._lastMessageTime) return

    // 既存のインターバルをクリア
    if (this._timeoutInterval) {
      clearInterval(this._timeoutInterval)
    }

    this._timeoutInterval = setInterval(() => {
      const currentTime = Date.now()
      const elapsedTime = currentTime - this._lastMessageTime!

      if (elapsedTime >= this._timeout && this._timeoutInterval) {
        this.resetMessages()
        this.emit('conversation_timeout')
        clearInterval(this._timeoutInterval)
        this._timeoutInterval = null
        this._lastMessageTime = null
      }
    }, this._timeoutIntervalTime)
  }

  /**
   * 破棄処理
   */
  dispose = async () => {
    if (this._timeoutInterval) {
      clearInterval(this._timeoutInterval)
      this._timeoutInterval = null
    }
    await this._mcpClient.dispose()
    this._messageParams = []
  }
}

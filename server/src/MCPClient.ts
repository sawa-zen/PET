import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import type { MCPServer, MCPServers, Transports } from './types.js'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'

export class MCPClient {
  private _client: Client
  private _clientName: string = 'mcp-client-study'
  private _version: string = '0.1.0'
  private _transports: Transports = {}
  private _tools: Tool[] = []
  get tools() { return this._tools }

  constructor() {
    this._client = new Client({
      name: this._clientName,
      version: this._version
    }, {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {}
      }
    })
  }

  /**
   * MCPサーバーをすべて起動する
   */
  startMcpServers = async (mcpServers: MCPServers) => {
    await Promise.all(Object.entries(mcpServers).map(this._startMcpServer))
  }

  /**
   * 一つのMCPサーバーを起動して接続する
   */
  private _startMcpServer = async ([mcpServerName, mcpServerConfig]: [string, MCPServer]) => {
    // MCPサーバーを起動して接続
    const transport = new StdioClientTransport(mcpServerConfig)
    this._transports[mcpServerName] = transport
    await this._client.connect(transport)

    // MCPサーバーからツールを取得してセット
    const listToolsResponse = await this._client.listTools()
    const newTools = listToolsResponse.tools
    this._tools.push(...newTools)
  }

  /**
   * 指定したツールを使用する
   */
  useTool = async (toolName: string, inputs: Record<string, unknown>) => {
    const toolUseResponse = await this._client.callTool({ name: toolName, arguments: inputs })
    if (toolUseResponse.error) {
      throw new Error(`ツールの呼び出しに失敗しました: ${toolName} ${JSON.stringify(toolUseResponse.error)}`)
    }
    return toolUseResponse
  }

  /**
   * 破棄処理
   */
  dispose = async () => {
    await Promise.all(Object.values(this._transports).map(transport => transport.close()))
    await this._client.close()
  }
}

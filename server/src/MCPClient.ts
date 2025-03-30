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
    // MCPサーバーを一つずつ順番に起動して接続
    const mcpServerEntries = Object.entries(mcpServers)
    for (const mcpServerEntry of mcpServerEntries) {
      const mcpServerName = mcpServerEntry[0]
      const mcpServerConfig = mcpServerEntry[1]
      await this._startMcpServer([mcpServerName, mcpServerConfig])
    }
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
    console.info(`MCPサーバーから取得したツール: ${JSON.stringify(listToolsResponse)}`)
    const newTools = listToolsResponse.tools
    this._tools = this._tools.concat(newTools)
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
   * ツールが存在するか確認する
   */
  hasTool = (toolName: string) => {
    return this._tools.some(tool => tool.name === toolName)
  }

  /**
   * 破棄処理
   */
  dispose = async () => {
    await Promise.all(Object.values(this._transports).map(transport => transport.close()))
    await this._client.close()
  }
}

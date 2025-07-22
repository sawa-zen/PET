# PET - AI バーチャルペットアプリケーション

カスタマイズ可能な 3D アバターと音声で対話できる AI パワード バーチャルペットアプリケーションです。

## 特徴

- **音声認識**: ブラウザの音声認識機能を使用してリアルタイムで音声入力
- **音声合成**: VOICEVOX サーバーを使用して AI の応答を音声で出力
- **3D アバター**: VRM 形式の 3D キャラクターによる表現豊かなアニメーション
- **AI 統合**: Anthropic Claude API による自然言語処理
- **リアルタイム通信**: Socket.io による即座のレスポンス
- **PWA 対応**: モバイルデバイスでもネイティブアプリのような体験

## 技術スタック

### フロントエンド
- **React 18** + TypeScript
- **Three.js** + React Three Fiber + Drei （3D レンダリング）
- **VRM サポート**: @pixiv/three-vrm （3D アバターモデル）
- **音声処理**: react-speech-recognition + Tone.js
- **ビルドツール**: Vite 6 with HMR

### バックエンド
- **Node.js** + Express 5
- **Socket.io** （リアルタイム通信）
- **Anthropic Claude API** （AI 統合）
- **MCP プロトコル** （プラグイン可能なツール系統）

## セットアップ

### 前提条件
- Node.js 18+
- npm または yarn
- VOICEVOX エンジン（音声合成用）

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd pet
```

2. 依存関係をインストール
```bash
# クライアント
cd client
npm install

# サーバー
cd ../server
npm install
```

3. VOICEVOX エンジンをセットアップ
```bash
# VOICEVOX エンジンをダウンロード・起動（ポート 50021）
# 公式サイト: https://voicevox.hiroshiba.jp/
# または Docker で起動する場合:
docker run --rm -it -p 50021:50021 voicevox/voicevox_engine:cpu-ubuntu20.04-latest
```

4. 設定ファイルをセットアップ

**クライアント設定**
```bash
cd client
cp .env.example .env
# .env を編集（通常は変更不要）
```

**サーバー設定**
```bash
cd server
cp config.example.json config.json
# config.json を編集して API キーなどを設定
```

### 開発サーバーの起動

**重要**: 以下の順序で起動してください

1. VOICEVOX エンジンの起動
```bash
# VOICEVOX アプリケーションを起動するか、Docker で起動
docker run --rm -it -p 50021:50021 voicevox/voicevox_engine:cpu-ubuntu20.04-latest
```

2. サーバーとクライアントの起動

ルートディレクトリで以下のコマンドを実行すると、サーバーとクライアントを同時起動できます：

```bash
npm run dev
```

または、個別に起動：

```bash
# サーバー（ポート 3000）
cd server
npm run dev

# 別ターミナルでクライアント（ポート 8080）
cd client
npm run dev
```

### プロダクションビルド

```bash
cd client
npm run build
npm run preview
```

## プロジェクト構造

```
pet/
├── client/                 # React フロントエンド
│   ├── src/
│   │   ├── App/            # メインアプリケーション
│   │   │   ├── components/ # UI コンポーネント
│   │   │   └── hooks/      # カスタムフック
│   │   └── components/     # 共通コンポーネント
│   └── public/             # 静的ファイル（VRM モデル等）
├── server/                 # Node.js バックエンド
│   └── src/
│       ├── AnthropicClient.ts  # Claude API クライアント
│       ├── MCPClient.ts        # MCP プロトコル統合
│       └── VoiceboxClient.ts   # 音声処理
└── CLAUDE.md              # Claude Code 用ガイド
```

## 使い方

1. アプリケーションを起動後、ブラウザで `http://localhost:8080` にアクセス
2. マイクのアクセス許可を与える
3. 3D アバターが表示されたら、音声で話しかけてみましょう
4. AI が応答し、アバターがアニメーションと音声で反応します

## 設定詳細

### クライアント環境変数（client/.env）

```bash
# バックエンドサーバーのエンドポイント
VITE_BACKEND_ENDPOINT=http://localhost:3000
```

### サーバー設定（server/config.json）

```json
{
  "claudeApiKey": "your-anthropic-api-key",
  "systemPrompt": "You are a helpful assistant.",
  "voiceboxEndpoint": "http://127.0.0.1:50021",
  "mcpServers": {
    "sample-mcp": {
      "command": "npx",
      "args": ["sample-mcp"],
      "env": {
        "API_KEY": "your-mcp-api-key"
      }
    }
  }
}
```

**設定項目の説明**:
- `claudeApiKey`: Anthropic Claude API のAPIキー
- `systemPrompt`: AI アシスタントのシステムプロンプト
- `voiceboxEndpoint`: VOICEVOX エンジンのエンドポイント（デフォルト: http://127.0.0.1:50021）
- `mcpServers`: MCP サーバーの設定（外部ツール統合用）

## 開発情報

### 主要なコマンド

```bash
# ESLint による静的解析
cd client && npm run lint

# TypeScript 型チェック
cd client && npm run build

# 開発サーバーの起動（ホットリロード付き）
npm run dev
```

### MCP 統合

このアプリケーションは MCP（Model Context Protocol）をサポートしており、`server/mcp-config.json` で外部ツールとの統合を設定できます。

### アバターアニメーション

- `idle`: 待機状態
- `thinking`: 考え中
- `search`: 検索中
- `sitting`: 座った状態

アニメーションファイルは `client/public/` に VRMA 形式で配置されています。

## セキュリティ

- API キーは環境変数で管理してください
- 本番環境では HTTPS を使用してください
- CORS 設定を適切に構成してください

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## コントリビューション

プルリクエストや issue の報告を歓迎します。新機能の追加や改善の提案がありましたら、お気軽にお声かけください。

---

**AI アバターと楽しい時間をお過ごしください！**
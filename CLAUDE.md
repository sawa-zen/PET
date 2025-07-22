# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**PET（Virtual Pet Application）** は、3D アバター（VRM 形式のずんだもん）との音声対話を可能にする AI パワードバーチャルペットアプリケーションです。React + Three.js によるリッチな 3D UI と、Anthropic Claude API を活用したインテリジェントな対話機能を提供します。

## アーキテクチャ

### 全体構成
- **クライアント**: React 18 + TypeScript + Vite による SPA（PWA 対応）
- **サーバー**: Node.js + Express + Socket.io による WebSocket ベースサーバー
- **通信**: Socket.io を使用したリアルタイム双方向通信
- **AI 統合**: Anthropic Claude API + MCP（Model Context Protocol）

### 技術スタック

#### フロントエンド
- **3D レンダリング**: Three.js + React Three Fiber + Drei
- **VRM サポート**: @pixiv/three-vrm（3D アバターモデル）
- **音声処理**: react-speech-recognition + Tone.js
- **リアルタイム通信**: Socket.io-client

#### バックエンド
- **フレームワーク**: Express 5 + Socket.io
- **AI 統合**: @anthropic-ai/sdk + @modelcontextprotocol/sdk
- **イベント駆動**: EventEmitter ベースの疎結合設計

## 開発コマンド

### クライアント（client/）
```bash
npm run dev      # 開発サーバー起動（ポート 8080）
npm run build    # プロダクションビルド
npm run preview  # ビルド結果をプレビュー
npm run lint     # ESLint 実行
```

### サーバー（server/）
```bash
npm run dev      # tsx watch による開発モード（ポート 3000）
```

### 両方を同時起動
```bash
npm run dev      # 並行して両方の開発サーバーを起動
```

## 主要なアーキテクチャパターン

### React コンポーネント設計
- **カスタムフック中心**: `useApp`, `useAudio`, `useSpeechRecognizer` でロジック分離
- **主要コンポーネント**:
  - `Avatar`: 3D VRM モデルの描画と制御
  - `HeadView`: UI コントロールとステータス表示
  - `PreviewContainer`: カード形式の情報表示

### サーバーサイド設計
- **イベント駆動アーキテクチャ**: EventEmitter による疎結合
- **MCP プロトコル統合**: プラグイン形式でのツール拡張
- **WebSocket 通信**: リアルタイム双方向データフロー
- **AI クライアント**: `AnthropicClient` でClaude API統合

### 重要なコード規則
- **TypeScript 厳格モード**: strict、noUnusedLocals、noUnusedParameters 有効
- **ESLint 設定**: @topotal/eslint-config-typescript + React ルール
- **パスエイリアス**: `~` で src ディレクトリを参照
- **Import 整理**: simple-import-sort による自動ソート

## バーチャルペット機能

### 音声インタラクション
- ブラウザ音声認識によるユーザー音声入力
- AI 応答の音声合成による出力
- リアルタイム音声処理とフィードバック

### 3D アバター制御
- VRM 形式のずんだもんキャラクター
- 感情・状態に応じたアニメーション（idle、thinking、search など）
- Three.js による高性能 3D レンダリング

### AI 統合
- Anthropic Claude API による自然言語処理
- MCP プロトコルによるカスタムツール統合
- `show_list_card`, `show_detail_card` などの専用ツール

## 設定と環境

### PWA 設定
- 自動アップデート機能
- オフライン対応
- モバイル最適化

### 開発環境設定
- **Vite**: 高速ビルドとHMR
- **tsx**: TypeScript 直接実行（サーバー）
- **ngrok 対応**: 外部からのアクセス可能な開発環境

## MCP 設定

MCP サーバーは `server/mcp-config.json` で設定されており、外部ツールとの統合が可能です。新しいツールを追加する場合は、この設定ファイルを更新してください。

## パフォーマンス考慮事項

- VRM/VRMA ファイルのキャッシュ戦略最適化
- Three.js レンダリングループの効率化
- Socket.io 通信の最小化とバッファリング
- React コンポーネントの適切なメモ化
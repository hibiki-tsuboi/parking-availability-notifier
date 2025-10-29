## 概要
- 駐車場予約サイトのカレンダーの指定した日が空車かどうかをslackに通知してくれるツール

## アーキテクチャ
- TypeScript / Node.js

## 目的別コンポーネント
- scraper
  - 予約サイトをヘッドレスで開き、指定日の DOM から「空き」or「満車」を判定（Playwright）
- notifier
  - Slack Incoming Webhook で通知
- scheduler
  - 定期実行（GitHub Actions の cron）
- state
  - 直近通知済み状態を保存（JSON）。同じ内容の連投防止
- config
  - 対象URL、CSSセレクタ、駐車場ID、監視日などを .env + config/*.json で管理

## 技術選定
- 実行基盤: まずは GitHub Actions （Secretsにトークン格納し、毎朝/毎時のcron）
- ヘッドレス: Playwright（動的カレンダー対策・安定、公式の依存解決が楽）
- 言語/ツール: TypeScript / ts-node / esbuild or tsup（単一バイナリ出力も可）
- 品質: ESLint + Prettier、pino（ロガー）
- 設定: dotenv + zod（設定バリデーション）

## Slack 通知の選択肢
- Incoming Webhook（簡単）: URL1本でPOST。

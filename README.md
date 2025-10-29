# parking-availability-notifier

このリポジトリは、駐車場予約サイトのカレンダーで指定日の空き状況を監視し、Slackに通知するツールです。

## ドキュメント
- アーキテクチャ概要: `docs/architecture.md`

## 使い方（ローカル）
- 依存インストール: `npm ci`
- 設定: `cp configs/env/.env.example .env` を作成し、`SLACK_WEBHOOK_URL` を設定
- ターゲット: `config/targets.json` を `config/targets.example.json` から作成・編集
- 実行: `node --loader ts-node/esm src/index.ts`

### タイトル通知の動作確認（今回のサイト）
- 事前準備: `npx playwright install chromium`
- `.env` の `TITLE_URL` をデフォルトのまま（`https://hnd-rsv.aeif.or.jp/airport2/app/toppage`）か任意URLに設定
- 実行: `npm run notify:title`（または `node --loader ts-node/esm src/title_notify.ts https://hnd-rsv.aeif.or.jp/airport2/app/toppage`）
- 期待動作: 指定ページへアクセスし、タイトル文字列を Slack に送信

## GitHub Actions（スケジュール実行）
- リポジトリ Secrets に `SLACK_WEBHOOK_URL` を登録
- ワークフロー: `.github/workflows/notify.yml`（毎時）
- 状態ファイル `data/state.json` はキャッシュで永続化（簡易）

プロジェクト構成やコーディング/テスト方針は `AGENTS.md` を参照してください。

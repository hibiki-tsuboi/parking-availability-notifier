# parking-availability-notifier

このリポジトリは、駐車場予約サイトのカレンダーで指定日の空き状況を監視し、Slackに通知するツールです。

## ドキュメント
- アーキテクチャ概要: `docs/architecture.md`

## 使い方（ローカル）
- 依存インストール: `npm ci`
- 設定: `cp configs/env/.env.example .env` を作成し、`SLACK_WEBHOOK_URL` を設定（必要なら `PLAYWRIGHT_HEADLESS=false`）
- メンション設定: `SLACK_MENTION_ID` に `<@UXXXX>` または `UXXXX` を指定可
- ターゲット: `config/targets.json` を `config/targets.example.json` から作成・編集
- 実行: `node --loader ts-node/esm src/index.ts`

### タイトル通知の動作確認（今回のサイト）
- 事前準備: `npx playwright install chromium`
- `.env` の `TITLE_URL` をデフォルトのまま（`https://hnd-rsv.aeif.or.jp/airport2/app/toppage`）か任意URLに設定
- 実行: `npm run notify:title`（または `node --loader ts-node/esm src/title_notify.ts https://hnd-rsv.aeif.or.jp/airport2/app/toppage`）
- 期待動作: 指定ページへアクセスし、タイトル文字列を Slack に送信

### 指定ID要素の class を通知
- `.env` の `CALENDAR_CELL_ID` を設定（例: `0-0-2025/11/01`）
- 実行: `npm run notify:class`
  - もしくはIDとURLを引数指定: `node --loader ts-node/esm src/class_notify.ts 0-0-2025/11/01 https://hnd-rsv.aeif.or.jp/airport2/app/toppage`
- 期待動作: 指定IDの要素をDOMから取得し、class属性（とテキスト）をSlackに送信

### 本実装（例: HND サイト）
- `config/targets.json` 例（`config/targets.example.json` をコピーして編集）
  - `url`: `https://hnd-rsv.aeif.or.jp/airport2/app/toppage`
  - `date`: `YYYY-MM-DD` 形式
  - `elementIdTemplate`: `0-0-{{date}}`
  - `elementIdDateStyle`: `slash`（`YYYY/MM/DD` へ変換して埋め込み）
  - `classHints`: クラス名に含まれる語で available/full を判定
- 実行: `node --loader ts-node/esm src/index.ts`
- 動作: 要素IDの class を解析し、満車/空車いずれも「初回＋変化時」に Slack 通知（同一ステータスは重複抑止）

## GitHub Actions（スケジュール実行）
- リポジトリ Secrets に `SLACK_WEBHOOK_URL` を登録
- ワークフロー: `.github/workflows/notify.yml`（毎時）
- 状態ファイル `data/state.json` はキャッシュで永続化（簡易）

プロジェクト構成やコーディング/テスト方針は `AGENTS.md` を参照してください。

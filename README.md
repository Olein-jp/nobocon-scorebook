# Nobocon Scorebook（MVP・ローカル保存版）

## 1. 概要
- 目的
  - のぼコン（ボルダリングコンペ）中に、参加者が「課題ごとのトライ/完登状況」と「のぼコンボード」をスマホで素早く記録し、現在スコア（合計ポイント・ランク・指標）を即時に確認できるようにする。
  - ログインなしでブラウザのローカル保存により、同一端末・同一ブラウザ内で入力内容を保持する。
- 成功条件（MVPの合格基準）
  - スマホUI最優先で、以下が一通り動作する。
    1) コンペ（1大会）を作成し、課題を追加して「難易度・トライ回数・完登」を記録できる
    2) のぼコンボード（完登/未完登、トライ数、全て完登/未完登）を入力できる
    3) スコア表示で「合計ポイント」「ランク」「合計トライ数」「1トライあたりポイント」「完登課題一覧（or 集計）」を確認できる
    4) 入力は自動保存され、ページ再訪時に復元される（localStorage）
    5) スコアを画像（PNG）としてエクスポートできる（SNS共有用）
    6) PCでもUIが破綻しない（レスポンシブ対応）

## 2. 対象ユーザーと利用環境
- 想定ユーザー
  - のぼコン参加者（スマホ操作が中心）
- 対応デバイス/ブラウザ
  - Must: スマホ（iOS Safari / Android Chrome 最新2メジャー）
  - Should: タブレット（iPadOS Safari / Android Chrome）
  - Could: PC（Chrome / Edge / Safari）
- UI方針
  - モバイルファースト。タップ領域は最小44px目安。
  - 片手操作を優先し、主要操作（課題追加・±・完登トグル・タブ切替）を画面下寄りに配置。
  - PCでは2カラムなどに再配置し、見切れ・重なり・横スクロールを発生させない。

## 3. スコープ
- MVPでやること
  - コンペ作成（ローカル）
  - 課題（問題）追加・編集・削除（ローカル）
  - のぼコンボード入力（全て完登/未完登ボタン含む）
  - スコア計算・表示（合計ポイント/ランク/指標）
  - 自動保存/復元（localStorage）
  - PNGエクスポート（スコアカード）
  - データ入出力（任意だが推奨）
    - JSONエクスポート/インポート（端末移行やバックアップ用）
- MVPではやらないこと（非スコープ）
  - ログイン/ユーザー登録/パスワード再発行
  - マイページ/過去コンペ一覧/クラウド保存
  - 課金
  - 共有URL/ランキング公開
  - 複数端末同期

## 4. 機能要件

### 4.1 機能一覧（優先度 Must/Should/Could）
- Must
  - コンペ
    - 新規作成（大会名・日付）
    - 編集（大会名・日付）
    - 削除（確認ダイアログ必須）
    - 一覧表示（ローカルに存在する大会）
  - 課題（課題ごとの記録）
    - 追加（label、grade、triesTotal、topped）
    - 編集（編集モードのみ）
    - 削除（確認ダイアログ必須）
  - のぼコンボード
    - 8Q(91)〜2Q(98) の完登/未完登
    - 各ボードのトライ数（±）
    - 全て完登/未完登ボタン
  - スコア表示
    - 合計ポイント（級・段＋ボード）
    - ランク
    - 合計トライ数
    - 1トライあたりポイント
    - 完登課題一覧（課題label/grade/獲得ポイントを表示）または grade別完登数集計
    - のぼコンボード合計（ポイント/トライ数）
  - 自動保存/復元
    - 編集のたびにlocalStorageへ保存
    - 初期表示で復元
  - 画像エクスポート
    - スコアカードをPNGとして生成し共有できる
- Should
  - 入力UX
    - triesTotal の±ボタン（長押し連打対応はPhase2）
    - topped のトグル
  - バックアップ
    - JSONエクスポート/インポート（UIボタン）
- Could
  - PWA（ホーム画面追加、簡易オフラインキャッシュ）
  - スコアカードのテンプレ切替

### 4.2 入力/出力/例外（エラー時の挙動）
  - 課題入力
    - 入力:
    - label: 空文字不可（数値入力を想定）
    - grade: enum（2D,1D,1Q,2Q,3Q,4Q,5Q,6Q,7Q,8Q）
    - triesTotal: 0以上の整数
    - topped: boolean（完登時は triesTotal が0なら1に補正）
    - triesToTop: topped=true のときのみ 1以上 triesTotal 以下（内部保持。UI入力なし）
  - 例外:
    - triesTotal < 0: 保存不可、フィールド下にエラー表示
    - topped=true で triesToTop未入力: 保存不可、エラー表示（内部補正）
    - triesToTop > triesTotal: 保存不可、エラー表示
- スコア
  - totalTries=0 の場合、1トライあたりポイントは0表示（0除算禁止）
  - totalTries は「課題トライ + のぼコンボードトライ（完登のみ）」の合算
- ローカル保存
  - localStorageが利用不可（プライベートモード等）: 画面上部に警告バナーを表示し、保存が保証できない旨を明示

## 5. 画面設計

### 5.1 画面一覧（ルーティング）
- /（コンペ一覧）
- /competitions/new（コンペ作成）
- /competitions/:id（コンペ詳細：タブUI）
  - タブ1: 課題一覧（追加/編集/削除）
  - タブ2: スコア（集計、ボード、PNG出力、JSON出力/取込）

### 5.2 画面ごとの要素・操作・遷移
- コンペ一覧
  - 要素: コンペカード（名称・日付・合計ポイント・ランク）、＋新規作成
  - 操作: カードタップで詳細へ
  - 操作: スワイプ削除はMVPでは無し（誤操作防止）。削除は詳細画面から。
- コンペ作成
  - 要素: 大会名（必須）、開催日（任意/デフォルト当日）、保存
  - 遷移: 保存後 /competitions/:id
- コンペ詳細（タブUI）
  - 共通ヘッダー: 大会名、戻る、編集ボタン（閲覧→編集切替）
  - タブ1 課題一覧
    - 要素: 課題リスト（label、grade、triesTotal、topped）
    - のぼコンボード入力（完登/未完登、トライ数、全て完登/未完登）
    - 追加: 「＋課題追加」（下部シート/モーダル）
    - 編集モード:
      - 各行に編集/削除
      - 追加フォームでバリデーションを通過した場合のみ保存
  - タブ2 スコア
    - 要素:
      - 合計ポイント、ランク
      - 合計トライ数
      - 1トライあたりポイント（小数第2位まで）
      - 完登課題一覧（topped=trueのみ表示）または grade別完登数テーブル
      - のぼコンボード合計（ポイント/トライ数）
      - 「画像として保存」ボタン（PNG）
      - （Should）「JSON書き出し」「JSON読み込み」ボタン

### 5.3 主要なユーザーフロー（番号付き手順）
1) 当日の入力
  1. / で「＋新規作成」
  2. 大会名を入力して保存
  3. タブ1で課題を追加し、トライ/完登を入力
  4. タブ2でスコアを確認する（ボードはタブ1で入力）
  5. 「画像として保存」でPNG生成
2) 端末内で再訪
  1. / で作成済み大会が一覧表示される
  2. 該当大会を開いて続きから入力

## 6. データ設計

### 6.1 エンティティ一覧（ローカルJSONとして保持）
- AppState
  - version: number（マイグレーション用）
  - competitions: Competition[]
  - updatedAt: ISO string
- Competition
  - id: string（uuid）
  - title: string
  - eventDate: YYYY-MM-DD string
  - problems: ProblemAttempt[]
  - boardStates: BoardStates
  - boardTries: BoardTries
  - createdAt, updatedAt: ISO string
- ProblemAttempt
  - id: string（uuid）
  - label: string
  - grade: enum
  - triesTotal: number
  - topped: boolean
  - triesToTop: number|null
  - createdAt, updatedAt: ISO string
- BoardStates
  - "8Q-91": boolean
  - "7Q-92": boolean
  - "6Q-93": boolean
  - "5Q-94": boolean
  - "4Q-95": boolean
  - "3Q-96": boolean
  - "3Q-97": boolean
  - "2Q-98": boolean
- BoardTries
  - "8Q-91": number
  - "7Q-92": number
  - "6Q-93": number
  - "5Q-94": number
  - "4Q-95": number
  - "3Q-96": number
  - "3Q-97": number
  - "2Q-98": number

### 6.2 JSON例
```json
{
  "version": 1,
  "updatedAt": "2026-02-14T06:10:00Z",
  "competitions": [
    {
      "id": "cmp_9b7b0a6c",
      "title": "のぼコン 2026-02",
      "eventDate": "2026-02-14",
      "createdAt": "2026-02-14T06:00:00Z",
      "updatedAt": "2026-02-14T06:10:00Z",
      "problems": [
        {
          "id": "prb_01",
          "label": "P1",
          "grade": "3Q",
          "triesTotal": 3,
          "topped": true,
          "triesToTop": 2,
          "createdAt": "2026-02-14T06:02:00Z",
          "updatedAt": "2026-02-14T06:02:00Z"
        },
        {
          "id": "prb_02",
          "label": "P2",
          "grade": "1Q",
          "triesTotal": 4,
          "topped": false,
          "triesToTop": null,
          "createdAt": "2026-02-14T06:05:00Z",
          "updatedAt": "2026-02-14T06:05:00Z"
        }
      ],
      "boardStates": {
        "8Q-91": true,
        "7Q-92": false,
        "6Q-93": true,
        "5Q-94": false,
        "4Q-95": false,
        "3Q-96": true,
        "3Q-97": false,
        "2Q-98": false
      },
      "boardTries": {
        "8Q-91": 1,
        "7Q-92": 0,
        "6Q-93": 2,
        "5Q-94": 0,
        "4Q-95": 0,
        "3Q-96": 1,
        "3Q-97": 0,
        "2Q-98": 0
      }
    }
  ]
}
```

### 6.3 バリデーション方針
- Competition.title: 1文字以上必須
- ProblemAttempt.label: 1文字以上必須
- triesTotal: 0以上の整数
- topped=true の場合 triesToTop 必須、1以上 triesTotal 以下（内部補正で保持）
- grade: 定義済み enum のみ
- 破損データ復旧
  - JSON読み込み時にスキーマ検証し、不正なら読み込み拒否＆理由表示

### 6.4 永続化方針（どこに・どう保存）
- primary: localStorage
  - key: `nobocon_scorebook_v1`
  - 保存タイミング: 状態更新のたびに即時保存（debounce 300ms）
- export/import（Should）
  - JSONファイルとしてダウンロード
  - JSONファイルを選択して読み込み（上書き or マージ選択はMVPでは上書きのみ）

## 7. 非機能要件
- パフォーマンス
  - スコア計算はフロントで同期計算（状態更新ごとに再計算）
  - コンペ一覧は最大50件程度を想定し、重い場合はページング（Phase2）
- セキュリティ/プライバシー
  - データは端末内のみ。サーバ送信は行わない。
  - analytics/広告タグはMVPでは導入しない。
- アクセシビリティ
  - タブUIはbuttonで実装し、aria-selected/aria-controlsを付与
  - トグルはbutton+aria-pressedで実装
  - エラーはaria-liveで通知
- 互換性
  - localStorageが無効な環境では警告し、保存は保証しない

## 8. 技術構成
- フロントエンド
  - React + TypeScript + Vite
  - ルーティング: React Router
  - スタイル: Tailwind CSS（モバイルUI組みやすさ優先）
- 使用ライブラリ
  - DOM→PNG: html-to-image（または同等）
  - uuid生成: uuid
- 選定理由（短く、決定打だけ）
  - サーバ不要・ローカル保存前提のSPAとして実装が最短。
  - レンタルサーバ配布（静的ファイル）と相性が良い。

## 9. ディレクトリ構成（ツリー）
```
/
  README.md
  package.json
  vite.config.ts
  .github/
    workflows/
      deploy.yml
  /src
    main.tsx
    app.tsx
    /routes
      home.tsx
      competition-new.tsx
      competition-detail.tsx
    /components
      Tabs.tsx
      ProblemEditorSheet.tsx
      BoardToggleGroup.tsx
      ScoreSummary.tsx
      ScoreCard.tsx
    /lib
      storage.ts
      scoring.ts
      exportPng.ts
      validators.ts
      types.ts
```

## 10. デプロイ/公開手順
- 公開先: レンタルサーバ（静的ファイル配置）
- デプロイ方式: GitHub Actions からビルド→SFTP/FTPSでアップロード
  1) リポジトリにViteプロジェクト配置
  2) Actionsで `npm ci` → `npm run build` を実行し `dist/` を生成
  3) SFTPで `dist/` をレンタルサーバの公開ディレクトリへ同期アップロード
  4) ルーティングがSPAの場合、サーバ側で `index.html` へフォールバック設定（.htaccess等）を行う
- 環境変数（GitHub Secrets）
  - SFTP_HOST
  - SFTP_PORT
  - SFTP_USER
  - SFTP_PASSWORD（またはSSH鍵）
  - SFTP_REMOTE_PATH（例: `/public_html/nobocon/`）

## 11. 実装フェーズ分解
- Phase 0: セットアップ
  - Vite + React + TS
  - ルーティング雛形
  - Tailwind導入
  - GitHub Actionsのdeploy.yml雛形
- Phase 1: MVP（最短で動く）
  - AppState設計、localStorage保存/復元
  - コンペCRUD（一覧/新規/詳細/削除）
  - 課題CRUD（追加/編集/削除）＋バリデーション
  - ボードトグル＋全選択
  - スコア計算・表示
  - PNGエクスポート
  - SPAフォールバック（レンタルサーバ設定）
- Phase 2: 改善
  - JSONエクスポート/インポートUI
  - 入力UX（±ボタン連打、並び替え等）
  - PWA（任意）
- Phase 3: 拡張
  - ログイン/クラウド保存（別仕様として追加設計）
  - 課金（別仕様として追加設計）

---

## スコア仕様（固定ロジック）

### A) 級・段スコア（完登数×点数）
- 点数表
  - 8Q:100, 7Q:200, 6Q:300, 5Q:400, 4Q:500, 3Q:650, 2Q:1050, 1Q:1400, 1D:2500, 2D:4000
- 完登数の算出
  - problems のうち topped=true の件数を grade別に集計して完登数とする
- 級・段合計
  - Σ(gradePoints[grade] * toppedCount[grade])

### B) のぼコンボード（完登なら加点）
- 点数表
  - 8Q(91):100, 7Q(92):200, 6Q(93):300, 5Q(94):400, 4Q(95):500, 3Q(96):650, 3Q(97):650, 2Q(98):1050
- ボード合計
  - 完登の項目のみ点数を加算

### C) 合計点
- totalPoints = gradeTotalPoints + boardTotalPoints

### D) ランク判定
- 0〜2999: ノービス
- 3000〜3999: I
- 4000〜4999: H
- 5000〜5999: G
- 6000〜6999: F
- 7000〜7999: E
- 8000〜8999: D
- 9000〜10999: C
- 11000〜13999: B
- 14000〜17499: A
- 17500〜26999: S
- 27000〜39999: エキスパート
- 40000〜: アルティメット

### E) 合計トライ数
- totalTries = Σ(triesTotal) + Σ(boardTries[完登のみ])

### F) 1トライあたりポイント
- pointsPerTry = (totalTries === 0) ? 0 : totalPoints / totalTries
- 表示は小数第2位まで（四捨五入）

---

## デフォルト採用した前提と影響範囲
- 前提1：ログインなし・ローカル保存のみ
  - 影響：端末/ブラウザを跨いだ同期不可。機種変更やブラウザデータ削除で消えるため、JSONエクスポート/インポートが実質的なバックアップ手段になる。
- 前提2：SPAとして実装（React Router）
  - 影響：レンタルサーバ側で「index.htmlフォールバック」設定が必要。設定できない場合はハッシュルーティングに変更が必要（影響範囲：ルーティングとURL設計）。
- 前提3：公開はGitHub Actions→SFTP転送
  - 影響：Secrets管理が必須。SFTP不可のレンタルサーバの場合は別手段（rsync/FTPS等）に変更が必要。

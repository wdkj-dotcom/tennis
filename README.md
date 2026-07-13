# テニスサークル 日程・参加者管理

Next.js (App Router) + Supabase + Vercel で作られた、テニスサークルの日程調整・参加者管理アプリです。

- 幹事（管理者）: 日程の作成・編集・削除
- 参加者: 日程一覧の閲覧、参加/不参加の回答

## セットアップ手順

### 1. Supabase プロジェクトを作る

1. https://supabase.com で無料アカウントを作成し、新規プロジェクトを作成
2. プロジェクトの `SQL Editor` を開き、[supabase/schema.sql](supabase/schema.sql) の中身を全部貼り付けて実行
3. `Project Settings > API` から `Project URL` と `anon public key` を控える

### 2. 環境変数を設定

`.env.local` を編集し、控えた値を設定します（`.env.local.example` が雛形です）。

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxx
```

### 3. ローカルで起動

```
npm run dev
```

http://localhost:3000 を開き、「新規登録」から幹事アカウントを1つ作成してください（役割で「幹事」を選択）。他のメンバーは「参加者」で登録します。

### 4. 無料でWeb公開する（Vercel）

1. このプロジェクトをGitHubリポジトリにpush
2. https://vercel.com でアカウント作成し、GitHubリポジトリをImport
3. 環境変数 `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` をVercelのプロジェクト設定に追加
4. Deploy

デプロイ後に発行されるURLをスマホなどから開けば、そのままアクセスできます。

## 主な機能

- メール/パスワードでのログイン・新規登録（登録時に幹事/参加者を選択）
- `/events` 日程一覧（参加人数・自分の回答状況を表示）
- `/events/[id]` 日程詳細・参加/不参加ボタン・参加者一覧
- `/admin/events/new`, `/admin/events/[id]/edit` 幹事のみ日程の作成・編集・削除

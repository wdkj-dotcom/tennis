# テニスサークル 日程・参加者管理

Next.js (App Router) + Supabase + Vercel で作られた、テニスサークルの日程調整・参加者管理アプリです。

- 幹事（管理者）: 日程の作成・編集・削除、メンバー管理
- 参加者: 日程一覧の閲覧、参加/不参加の回答

ログインは名前を入力するだけです（メール・パスワード不要）。**一番最初に名前を入力した人が自動的に幹事になります。** 2人目以降は参加者として登録され、幹事が「メンバー管理」画面から後で幹事に変更できます。

## セットアップ手順

### 1. Supabase プロジェクトを作る

1. https://supabase.com で無料アカウントを作成し、新規プロジェクトを作成
2. プロジェクトの `SQL Editor` を開き、[supabase/schema.sql](supabase/schema.sql) の中身を全部貼り付けて実行
3. `Project Settings > API` から `Project URL` と `service_role secret key` を控える（`service_role` キーは強い権限を持つため、絶対に公開しない）

### 2. 環境変数を設定

`.env.local` を編集し、控えた値を設定します（`.env.local.example` が雛形です）。

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxxxx
```

### 3. ローカルで起動

```
npm run dev
```

http://localhost:3000 を開き、自分の名前を入力してください。最初の1人は自動的に幹事になります。

### 4. 無料でWeb公開する（Vercel）

1. このプロジェクトをGitHubリポジトリにpush
2. https://vercel.com でアカウント作成し、GitHubリポジトリをImport
3. 環境変数 `NEXT_PUBLIC_SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` をVercelのプロジェクト設定に追加
4. Deploy

デプロイ後に発行されるURLをスマホなどから開けば、そのままアクセスできます。

## 主な機能

- 名前だけの簡易ログイン（初回入力で自動登録、以後は同名でログイン）
- `/events` 日程一覧（参加人数・自分の回答状況を表示）
- `/events/[id]` 日程詳細・参加/不参加ボタン・参加者一覧
- `/admin/events/new`, `/admin/events/[id]/edit` 幹事のみ日程の作成・編集・削除
- `/admin/members` 幹事のみメンバーの事前登録・幹事権限の付与/解除

## 注意事項

このアプリは認証を簡易化しているため、名前が分かれば誰でもそのメンバーとしてログインできてしまいます（パスワードによる本人確認はありません）。身内のサークル利用など、ある程度信頼できるメンバー間での利用を想定しています。

import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const { error, mode } = await searchParams;
  const isSignUp = mode === "signup";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-center mb-1">テニスサークル</h1>
        <p className="text-center text-sm text-slate-500 mb-6">
          {isSignUp ? "新規登録" : "ログイン"}
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
            {error}
          </p>
        )}

        <form action={isSignUp ? signUp : signIn} className="space-y-3">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm mb-1">お名前</label>
                <input
                  name="name"
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="山田 太郎"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">役割</label>
                <select
                  name="role"
                  className="w-full border rounded px-3 py-2 text-sm"
                  defaultValue="member"
                >
                  <option value="member">参加者</option>
                  <option value="admin">幹事</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm mb-1">メールアドレス</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">パスワード</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="6文字以上"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white rounded py-2 text-sm font-medium hover:bg-emerald-700"
          >
            {isSignUp ? "登録する" : "ログイン"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          {isSignUp ? (
            <a href="/login" className="text-emerald-600 hover:underline">
              ログインはこちら
            </a>
          ) : (
            <a href="/login?mode=signup" className="text-emerald-600 hover:underline">
              新規登録はこちら
            </a>
          )}
        </p>
      </div>
    </div>
  );
}

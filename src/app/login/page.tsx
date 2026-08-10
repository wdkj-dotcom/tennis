import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/session";
import SubmitButton from "@/components/SubmitButton";
import { nameLogin } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile) redirect("/events");

  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold text-center mb-1">テニスサークル</h1>
        <p className="text-center text-sm text-slate-500 mb-6">
          お名前を入力してください
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
            {error}
          </p>
        )}

        <form action={nameLogin} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">お名前</label>
            <input
              name="name"
              required
              autoFocus
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="山田 太郎"
            />
          </div>
          <SubmitButton
            className="w-full bg-emerald-600 text-white rounded py-2 text-sm font-medium hover:bg-emerald-700"
          >
            入る
          </SubmitButton>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          初めての方は名前を入力するだけで登録されます
        </p>
      </div>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function MonthFilter({ months }: { months: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("month") ?? "all";

  return (
    <select
      value={months.includes(current) ? current : "all"}
      onChange={(e) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (value === "all") {
          params.delete("month");
        } else {
          params.set("month", value);
        }
        const query = params.toString();
        router.push(query ? `/events?${query}` : "/events");
      }}
      className="border rounded px-2 py-1 text-sm bg-white"
    >
      <option value="all">今後の予定</option>
      {months.map((m) => {
        const [y, mo] = m.split("-");
        return (
          <option key={m} value={m}>
            {y}年{Number(mo)}月
          </option>
        );
      })}
    </select>
  );
}

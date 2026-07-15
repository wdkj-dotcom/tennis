"use client";

import { useRouter } from "next/navigation";

export default function MonthFilter({
  months,
  current,
}: {
  months: string[];
  current: string;
}) {
  const router = useRouter();

  return (
    <select
      value={current}
      onChange={(e) => {
        const value = e.target.value;
        router.push(value === "all" ? "/events" : `/events?month=${value}`);
      }}
      className="border rounded px-3 py-2 text-sm bg-white"
    >
      <option value="all">すべて</option>
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

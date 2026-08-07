"use client";

import { useSearchParams } from "next/navigation";
import NavLink from "@/components/NavLink";

export default function MonthFilter({
  months,
  currentMonth,
}: {
  months: string[];
  currentMonth: string;
}) {
  const searchParams = useSearchParams();
  const active = searchParams.get("month") ?? currentMonth;

  const hrefFor = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", value);
    return `/events?${params.toString()}`;
  };

  const tabClass = (isActive: boolean) =>
    `px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
      isActive
        ? "bg-emerald-600 text-white"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`;

  return (
    <div className="flex items-center gap-1 overflow-x-auto max-w-[50vw] sm:max-w-none">
      {months.map((m) => {
        const [y, mo] = m.split("-");
        return (
          <NavLink key={m} href={hrefFor(m)} className={tabClass(active === m)}>
            {y}年{Number(mo)}月
          </NavLink>
        );
      })}
    </div>
  );
}

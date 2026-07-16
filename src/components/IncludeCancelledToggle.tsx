"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function IncludeCancelledToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checked = searchParams.get("includeCancelled") === "1";

  return (
    <label className="flex items-center gap-1.5 text-sm text-slate-600 whitespace-nowrap">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.checked) {
            params.set("includeCancelled", "1");
          } else {
            params.delete("includeCancelled");
          }
          const query = params.toString();
          router.push(query ? `/events?${query}` : "/events");
        }}
      />
      中止を含む
    </label>
  );
}

import { redirect } from "next/navigation";
import EventForm from "@/components/EventForm";
import { getCurrentProfile } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Event } from "@/types/database";
import { createEvent } from "../actions";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; copy?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/events");

  const { error, copy } = await searchParams;

  let defaultValues: Partial<Event> | undefined;
  if (copy) {
    const supabase = createAdminClient();
    const { data: source } = await supabase
      .from("events")
      .select("*")
      .eq("id", copy)
      .single<Event>();
    if (source) {
      defaultValues = { ...source, event_date: "" };
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">
        {copy ? "日程を複製して作成" : "日程を作成"}
      </h1>
      <EventForm
        action={createEvent}
        defaultValues={defaultValues}
        error={error}
        submitLabel="作成する"
      />
    </div>
  );
}

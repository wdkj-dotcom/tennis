import { redirect } from "next/navigation";
import EventForm from "@/components/EventForm";
import { getCurrentProfile } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Event, Profile } from "@/types/database";
import { createEvent } from "../actions";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; copy?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/events");

  const { error, copy } = await searchParams;

  const supabase = createAdminClient();

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })
    .returns<Profile[]>();

  let defaultValues: Partial<Event> | undefined;
  let visibleMemberIds: string[] | undefined;
  if (copy) {
    const { data: source } = await supabase
      .from("events")
      .select("*")
      .eq("id", copy)
      .single<Event>();
    if (source) {
      defaultValues = { ...source, event_date: "" };
    }

    const { data: visibility } = await supabase
      .from("event_visibility")
      .select("profile_id")
      .eq("event_id", copy);
    visibleMemberIds = (visibility ?? []).map((v) => v.profile_id);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">
        {copy ? "日程を複製して作成" : "日程を作成"}
      </h1>
      <EventForm
        action={createEvent}
        defaultValues={defaultValues}
        members={members ?? []}
        visibleMemberIds={visibleMemberIds}
        error={error}
        submitLabel="作成する"
      />
    </div>
  );
}

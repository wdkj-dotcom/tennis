import { notFound, redirect } from "next/navigation";
import EventForm from "@/components/EventForm";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/session";
import type { Event } from "@/types/database";
import { updateEvent } from "../../actions";

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/events");

  const { id } = await params;
  const { error } = await searchParams;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single<Event>();

  if (!event) notFound();

  const action = updateEvent.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">日程を編集</h1>
      <EventForm
        action={action}
        defaultValues={event}
        error={error}
        submitLabel="更新する"
      />
    </div>
  );
}

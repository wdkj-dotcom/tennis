import { redirect } from "next/navigation";
import EventForm from "@/components/EventForm";
import { getCurrentProfile } from "@/lib/session";
import { createEvent } from "../actions";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/events");

  const { error } = await searchParams;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">日程を作成</h1>
      <EventForm action={createEvent} error={error} submitLabel="作成する" />
    </div>
  );
}

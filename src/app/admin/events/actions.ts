"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function parseEventForm(formData: FormData) {
  return {
    title: String(formData.get("title")),
    event_date: String(formData.get("event_date")),
    start_time: (formData.get("start_time") as string) || null,
    end_time: (formData.get("end_time") as string) || null,
    location: (formData.get("location") as string) || null,
    capacity: formData.get("capacity")
      ? Number(formData.get("capacity"))
      : null,
    note: (formData.get("note") as string) || null,
  };
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const values = parseEventForm(formData);
  const { data, error } = await supabase
    .from("events")
    .insert({ ...values, created_by: user.id })
    .select("id")
    .single();

  if (error) {
    redirect(`/admin/events/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/events");
  redirect(`/events/${data!.id}`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = await createClient();
  const values = parseEventForm(formData);

  const { error } = await supabase.from("events").update(values).eq("id", eventId);

  if (error) {
    redirect(
      `/admin/events/${eventId}/edit?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}

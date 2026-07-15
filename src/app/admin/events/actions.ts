"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/session";
import type { EventStatus } from "@/types/database";

function parseEventForm(formData: FormData) {
  const status = String(formData.get("status") ?? "tentative");
  return {
    subtitle: (formData.get("subtitle") as string) || null,
    event_date: String(formData.get("event_date")),
    start_time: (formData.get("start_time") as string) || null,
    end_time: (formData.get("end_time") as string) || null,
    location: (formData.get("location") as string) || null,
    capacity: formData.get("capacity")
      ? Number(formData.get("capacity"))
      : null,
    note: (formData.get("note") as string) || null,
    status: (["tentative", "confirmed", "cancelled"].includes(status)
      ? status
      : "tentative") as EventStatus,
  };
}

async function syncVisibility(eventId: string, formData: FormData) {
  const supabase = createAdminClient();
  const memberIds = formData.getAll("visibleMemberIds").map(String).filter(Boolean);

  await supabase.from("event_visibility").delete().eq("event_id", eventId);

  if (memberIds.length > 0) {
    await supabase
      .from("event_visibility")
      .insert(memberIds.map((profile_id) => ({ event_id: eventId, profile_id })));
  }
}

export async function createEvent(formData: FormData) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/events");

  const supabase = createAdminClient();
  const values = parseEventForm(formData);
  const { data, error } = await supabase
    .from("events")
    .insert({ ...values, created_by: profile.id })
    .select("id")
    .single();

  if (error) {
    redirect(`/admin/events/new?error=${encodeURIComponent(error.message)}`);
  }

  await syncVisibility(data!.id, formData);

  revalidatePath("/events");
  redirect(`/events/${data!.id}`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/events");

  const supabase = createAdminClient();
  const values = parseEventForm(formData);

  const { error } = await supabase.from("events").update(values).eq("id", eventId);

  if (error) {
    redirect(
      `/admin/events/${eventId}/edit?error=${encodeURIComponent(error.message)}`
    );
  }

  await syncVisibility(eventId, formData);

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}

export async function setEventStatus(eventId: string, status: EventStatus) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/events");

  const supabase = createAdminClient();
  await supabase.from("events").update({ status }).eq("id", eventId);

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}

export async function bulkDeleteEvents(formData: FormData) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/events");

  const ids = formData.getAll("eventIds").map(String).filter(Boolean);
  if (ids.length === 0) {
    redirect(
      `/admin/events/bulk-delete?error=${encodeURIComponent("削除する日程を選択してください")}`
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("events").delete().in("id", ids);

  if (error) {
    redirect(`/admin/events/bulk-delete?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/events");
  redirect("/events");
}

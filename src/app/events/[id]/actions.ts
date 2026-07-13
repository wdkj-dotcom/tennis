"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/session";
import type { RsvpStatus } from "@/types/database";

export async function setRsvp(eventId: string, status: RsvpStatus) {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const supabase = createAdminClient();
  await supabase
    .from("rsvps")
    .upsert(
      { event_id: eventId, user_id: profile.id, status, updated_at: new Date().toISOString() },
      { onConflict: "event_id,user_id" }
    );

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
}

export async function deleteEvent(eventId: string) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/events");

  const supabase = createAdminClient();
  await supabase.from("events").delete().eq("id", eventId);
  revalidatePath("/events");
  redirect("/events");
}

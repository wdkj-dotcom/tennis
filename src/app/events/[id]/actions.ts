"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RsvpStatus } from "@/types/database";

export async function setRsvp(eventId: string, status: RsvpStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("rsvps")
    .upsert(
      { event_id: eventId, user_id: user.id, status, updated_at: new Date().toISOString() },
      { onConflict: "event_id,user_id" }
    );

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", eventId);
  revalidatePath("/events");
}

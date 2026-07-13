export type Role = "admin" | "member";
export type RsvpStatus = "attending" | "not_attending";

export interface Profile {
  id: string;
  name: string;
  role: Role;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  capacity: number | null;
  note: string | null;
  created_by: string;
  created_at: string;
}

export interface Rsvp {
  event_id: string;
  user_id: string;
  status: RsvpStatus;
  updated_at: string;
}

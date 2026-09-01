import { apiRequest } from "./api-client";

export type Profile = { id: number; user_id: number; display_name?: string | null; bio?: string | null; location_name?: string | null; latitude?: number | null; longitude?: number | null; preferred_distance_km?: number | null; age_preference_min?: number | null; age_preference_max?: number | null; preferred_group_size?: number | null; social_preferences?: string | null };
export type User = { id: number; email: string; username: string; is_active: boolean; profile?: Profile | null };
export type Activity = { id: number; name: string; description?: string | null };
export type UserActivity = { id: number; user_id: number; activity_id: number; skill_level: string; activity: Activity };
export type Availability = { id: number; user_id: number; day_of_week: string; start_time: string; end_time: string; notes?: string | null };
export type Match = { id: number; matched_user_id: number; activity_id?: number | null; score: number; explanation?: string | null; matched_user?: User | null };
export type Connection = { id: number; requester_id: number; recipient_id: number; status: string; created_at: string; updated_at: string };
export type Message = { id: number; connection_id: number; sender_id: number; content: string; created_at: string };
export type ParsedProfile = { activities: { name: string; skill_level?: string | null; intensity?: string | null }[]; availability?: { days: string[]; start_time?: string | null; end_time?: string | null } | null; intensity?: string | null; max_distance_km?: number | null; social_preferences: string[] };

const json = (method: string, body?: unknown) => ({ method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
export const api = {
  me: () => apiRequest<User>("/api/users/me"),
  updateUser: (body: { username?: string }) => apiRequest<User>("/api/users/me", json("PUT", body)),
  profile: () => apiRequest<Profile>("/api/users/me/profile"),
  updateProfile: (body: Partial<Profile>) => apiRequest<Profile>("/api/users/me/profile", json("PUT", body)),
  activities: () => apiRequest<Activity[]>("/api/activities"),
  myActivities: () => apiRequest<UserActivity[]>("/api/users/me/activities"),
  addActivity: (body: { activity_id: number; skill_level: string }) => apiRequest<UserActivity>("/api/users/me/activities", json("POST", body)),
  removeActivity: (id: number) => apiRequest<void>(`/api/users/me/activities/${id}`, { method: "DELETE" }),
  availability: () => apiRequest<Availability[]>("/api/users/me/availability"),
  updateAvailability: (body: unknown[]) => apiRequest<Availability[]>("/api/users/me/availability", json("PUT", body)),
  matches: () => apiRequest<Match[]>("/api/matches"),
  match: (id: number) => apiRequest<Match>(`/api/matches/${id}`),
  connections: () => apiRequest<Connection[]>("/api/connections"),
  connect: (recipient_id: number) => apiRequest<Connection>("/api/connections", json("POST", { recipient_id })),
  accept: (id: number) => apiRequest<Connection>(`/api/connections/${id}/accept`, { method: "POST" }),
  reject: (id: number) => apiRequest<Connection>(`/api/connections/${id}/reject`, { method: "POST" }),
  messages: (id: number) => apiRequest<Message[]>(`/api/connections/${id}/messages`),
  sendMessage: (id: number, content: string) => apiRequest<Message>(`/api/connections/${id}/messages`, json("POST", { content })),
  parseProfile: (description: string) => apiRequest<ParsedProfile>("/api/ai/parse-profile", json("POST", { description })),
};

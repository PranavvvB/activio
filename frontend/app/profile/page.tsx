"use client";

import { useEffect, useState } from "react";
import { AccountShell } from "../../components/account-shell";
import {
  api,
  Activity,
  Profile,
  UserActivity,
  Availability,
  ParsedProfile,
} from "../../lib/api-service";
import { ApiError } from "../../lib/api-client";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const levels = ["beginner", "intermediate", "advanced", "expert"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({} as Profile);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [catalogue, setCatalogue] = useState<Activity[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bio, setBio] = useState("");
  const [parsed, setParsed] = useState<ParsedProfile>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [day, setDay] = useState("monday");
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("20:00");
  const [newLevel, setNewLevel] = useState("beginner");

  useEffect(() => {
    Promise.all([
      api.profile().catch((e) => {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }),
      api.myActivities(),
      api.activities(),
      api.availability(),
    ])
      .then(([p, a, all, slots]) => {
        if (p) {
          setProfile(p);
          setBio(p.bio || "");
        }
        setActivities(a);
        setCatalogue(all);
        setAvailability(slots);
      })
      .catch((e) =>
        setError(
          e instanceof ApiError ? e.message : "Unable to load your profile.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof Profile, value: string) =>
    setProfile((current) => ({
      ...current,
      [field]: value === "" ? null : value,
    }));
  const saveProfile = async () => {
    setError("");
    setMessage("");
    if (
      profile.age_preference_min != null &&
      profile.age_preference_max != null &&
      Number(profile.age_preference_min) > Number(profile.age_preference_max)
    ) {
      setError("Minimum preferred age cannot be greater than the maximum.");
      return;
    }
    setBusy(true);
    try {
      await api.updateProfile({ ...profile, bio });
      setMessage("Profile preferences saved.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  };
  const addActivity = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    e.target.value = "0";
    if (!id) return;
    try {
      const next = await api.addActivity({
        activity_id: id,
        skill_level: newLevel,
      });
      setActivities((current) => [...current, next]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not add activity.");
    }
  };
  const removeActivity = async (id: number) => {
    try {
      await api.removeActivity(id);
      setActivities((current) => current.filter((a) => a.activity_id !== id));
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Could not remove activity.",
      );
    }
  };
  const parse = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      setParsed(await api.parseProfile(bio));
      setMessage(
        "Suggestions are ready for review. Nothing has been saved yet.",
      );
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "AI parsing is unavailable.",
      );
    } finally {
      setBusy(false);
    }
  };
  const saveAvailability = async () => {
    if (start >= end) {
      setError("End time must be after start time.");
      return;
    }
    try {
      const next = [
        ...availability.filter((v) => v.day_of_week !== day),
        { day_of_week: day, start_time: start, end_time: end },
      ];
      setAvailability(await api.updateAvailability(next));
      setMessage("Availability saved.");
      setError("");
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Could not save availability.",
      );
    }
  };

  return (
    <AccountShell title="Your profile">
      <div className="mt-8">
        {loading && (
          <p role="status" className="rounded-xl bg-white p-4 text-ink/55">
            Loading your profile…
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl bg-red-50 p-3 text-red-700"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="mb-5 rounded-xl bg-indigo-50 p-3 text-indigo-700"
          >
            {message}
          </p>
        )}
        {!loading && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-extrabold">About you</h2>
              <p className="mt-1 text-sm text-ink/55">
                These preferences help us find people who fit your pace.
              </p>
              <Field label="Display name">
                <input
                  value={profile.display_name || ""}
                  onChange={(e) => update("display_name", e.target.value)}
                  maxLength={120}
                />
              </Field>
              <Field label="Location">
                <input
                  value={profile.location_name || ""}
                  onChange={(e) => update("location_name", e.target.value)}
                  placeholder="City or neighbourhood"
                  maxLength={255}
                />
              </Field>
              <Field label="Tell us about yourself">
                <textarea
                  className="min-h-32 w-full rounded-2xl border border-ink/15 bg-[#fffdfa] p-4"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={1000}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Preferred distance (km)">
                  <input
                    type="number"
                    min="0"
                    value={profile.preferred_distance_km ?? ""}
                    onChange={(e) =>
                      update("preferred_distance_km", e.target.value)
                    }
                  />
                </Field>
                <Field label="Preferred group size">
                  <input
                    type="number"
                    min="1"
                    value={profile.preferred_group_size ?? ""}
                    onChange={(e) =>
                      update("preferred_group_size", e.target.value)
                    }
                  />
                </Field>
                <Field label="Age preference — minimum">
                  <input
                    type="number"
                    min="0"
                    value={profile.age_preference_min ?? ""}
                    onChange={(e) =>
                      update("age_preference_min", e.target.value)
                    }
                  />
                </Field>
                <Field label="Age preference — maximum">
                  <input
                    type="number"
                    min="0"
                    value={profile.age_preference_max ?? ""}
                    onChange={(e) =>
                      update("age_preference_max", e.target.value)
                    }
                  />
                </Field>
              </div>
              <Field label="Social preferences">
                <input
                  value={profile.social_preferences || ""}
                  onChange={(e) => update("social_preferences", e.target.value)}
                  placeholder="friendly, competitive, relaxed"
                  maxLength={255}
                />
                <span className="mt-1 block text-xs text-ink/45">
                  Separate preferences with commas.
                </span>
              </Field>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={parse}
                  disabled={busy || !bio.trim()}
                  className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600"
                >
                  ✨ {busy ? "Working…" : "Suggest from description"}
                </button>
                <button
                  onClick={saveProfile}
                  disabled={busy}
                  className="rounded-full bg-coral-500 px-5 py-2 font-bold text-white disabled:opacity-60"
                >
                  {busy ? "Saving…" : "Save profile"}
                </button>
              </div>
              {parsed && (
                <div className="mt-5 rounded-2xl bg-[#fff8f3] p-4 text-sm">
                  <b>Suggestions to review</b>
                  <p className="mt-2">
                    {parsed.activities
                      .map((a) => `${a.name} (${a.skill_level || "any level"})`)
                      .join(", ") || "No activities detected."}
                  </p>
                  <p>{parsed.intensity && `Intensity: ${parsed.intensity}`}</p>
                  <p>
                    {parsed.availability?.days.join(", ") ||
                      "No availability detected."}
                  </p>
                  <p>
                    {parsed.max_distance_km &&
                      `Distance: ${parsed.max_distance_km} km`}
                  </p>
                  <p>{parsed.social_preferences.join(", ")}</p>
                </div>
              )}
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="font-display text-xl font-extrabold">
                Activities
              </h2>
              <div className="mt-4 flex gap-2">
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  aria-label="Skill level"
                  className="rounded-xl border border-ink/15 bg-[#fffdfa] p-3"
                >
                  {levels.map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
                <select
                  defaultValue="0"
                  onChange={addActivity}
                  className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-[#fffdfa] p-3"
                >
                  <option value="0">Add an activity…</option>
                  {catalogue
                    .filter(
                      (a) => !activities.some((x) => x.activity_id === a.id),
                    )
                    .map((a) => (
                      <option value={a.id} key={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mt-4 space-y-3">
                {activities.map((a) => (
                  <div
                    className="flex items-center justify-between rounded-2xl bg-[#fff8f3] p-3"
                    key={a.id}
                  >
                    <span>
                      <b>{a.activity.name}</b>
                      <small className="ml-2 text-ink/50">
                        {a.skill_level}
                      </small>
                    </span>
                    <button
                      onClick={() => removeActivity(a.activity_id)}
                      className="text-sm font-bold text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <h2 className="mt-8 font-display text-xl font-extrabold">
                Availability
              </h2>
              <p className="mt-1 text-sm text-ink/55">
                Choose a regular time window for each day.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="rounded-xl border p-2"
                >
                  {days.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
              <button
                onClick={saveAvailability}
                className="mt-3 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600"
              >
                Save availability
              </button>
              <div className="mt-4 space-y-2 text-sm text-ink/60">
                {availability.length ? (
                  availability.map((v) => (
                    <p key={v.id || v.day_of_week}>
                      <b className="capitalize">{v.day_of_week}</b> ·{" "}
                      {v.start_time}–{v.end_time}
                    </p>
                  ))
                ) : (
                  <p>No availability added yet.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </AccountShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-4 block text-sm font-bold">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

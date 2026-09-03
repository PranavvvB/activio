"use client";

import { useEffect, useMemo, useState } from "react";
import { AccountShell } from "../../components/account-shell";
import { ApiError } from "../../lib/api-client";
import {
  Activity,
  api,
  Availability,
  ParsedProfile,
  Profile,
  UserActivity,
} from "../../lib/api-service";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const SKILLS = ["beginner", "intermediate", "advanced", "expert"];
const STEPS = [
  "About you",
  "Activities",
  "Availability",
  "Location",
  "Smart suggestions",
  "Review",
];

type SelectedActivity = {
  activity_id: number;
  name: string;
  skill_level: string;
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<SelectedActivity[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [aiText, setAiText] = useState("");
  const [parsed, setParsed] = useState<ParsedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      api
        .profile()
        .catch((error) =>
          error instanceof ApiError && error.status === 404
            ? null
            : Promise.reject(error),
        ),
      api.activities(),
      api.myActivities(),
      api.availability(),
    ])
      .then(([saved, all, mine, times]) => {
        if (saved) setProfile(saved);
        setActivities(all);
        setSelected(
          (mine as UserActivity[]).map((item) => ({
            activity_id: item.activity_id,
            name: item.activity.name,
            skill_level: item.skill_level,
          })),
        );
        setAvailability(times);
      })
      .catch((error) =>
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to load onboarding.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const updateProfile = (patch: Partial<Profile>) =>
    setProfile((current) => ({ ...current, ...patch }));
  const addActivity = (activity: Activity) =>
    setSelected((current) => [
      ...current,
      {
        activity_id: activity.id,
        name: activity.name,
        skill_level: "beginner",
      },
    ]);
  const availableActivities = useMemo(
    () =>
      activities.filter(
        (activity) =>
          !selected.some((item) => item.activity_id === activity.id),
      ),
    [activities, selected],
  );

  const parseWithAi = async () => {
    if (!aiText.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await api.parseProfile(aiText);
      setParsed(result);
      const suggestions = result.activities
        .map((item) => {
          const match = activities.find(
            (activity) =>
              activity.name.toLowerCase() === item.name.toLowerCase(),
          );
          return match &&
            !selected.some((current) => current.activity_id === match.id)
            ? {
                activity_id: match.id,
                name: match.name,
                skill_level: item.skill_level || "beginner",
              }
            : null;
        })
        .filter((item): item is SelectedActivity => item !== null);
      if (suggestions.length)
        setSelected((current) => [...current, ...suggestions]);
      if (result.max_distance_km != null)
        updateProfile({
          preferred_distance_km: Math.round(result.max_distance_km),
        });
      if (result.intensity)
        updateProfile({ social_preferences: result.intensity });
      if (result.availability)
        setAvailability(
          result.availability.days.map(
            (day) =>
              ({
                day_of_week: day,
                start_time: result.availability?.start_time || "18:00",
                end_time: result.availability?.end_time || "20:00",
              }) as Availability,
          ),
        );
      setMessage(
        "Suggestions applied. Review and edit them before continuing.",
      );
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "AI parsing is unavailable right now.",
      );
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setMessage("");
    try {
      await api.updateProfile(profile);
      const current = await api.myActivities();
      await Promise.all(
        current.map((item) => api.removeActivity(item.activity_id)),
      );
      await Promise.all(
        selected.map((item) =>
          api.addActivity({
            activity_id: item.activity_id,
            skill_level: item.skill_level,
          }),
        ),
      );
      await api.updateAvailability(
        availability.map((item) => ({
          day_of_week: item.day_of_week,
          start_time: item.start_time,
          end_time: item.end_time,
          ...(item.notes ? { notes: item.notes } : {}),
        })),
      );
      setMessage("Your profile is ready. You can keep editing it any time.");
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Could not save your profile.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <AccountShell title="Set up your profile">
        <p className="mt-8 text-ink/55">Loading your details…</p>
      </AccountShell>
    );

  return (
    <AccountShell title="Set up your profile">
      <section className="mx-auto mt-8 max-w-3xl">
        <div
          className="mb-8"
          aria-label={`Step ${step + 1} of ${STEPS.length}`}
        >
          <div className="flex justify-between text-xs font-bold text-ink/50">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-ink/10">
            <div
              className="h-2 rounded-full bg-coral-500 transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
        {message && (
          <p
            role="status"
            className="mb-5 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-700"
          >
            {message}
          </p>
        )}
        <div className="rounded-[2rem] bg-white p-6 shadow-soft sm:p-10">
          {step === 0 && (
            <Step
              title="Tell us about yourself"
              text="A few details help us find people who feel like a good fit."
            >
              <Field label="Display name">
                <input
                  value={profile.display_name || ""}
                  onChange={(e) =>
                    updateProfile({ display_name: e.target.value })
                  }
                  placeholder="What should we call you?"
                />
              </Field>
              <Field label="About you">
                <textarea
                  className="min-h-32 w-full rounded-2xl border border-ink/15 bg-[#fffdfa] p-4"
                  value={profile.bio || ""}
                  onChange={(e) => updateProfile({ bio: e.target.value })}
                  placeholder="What do you enjoy, and what are you looking for?"
                />
              </Field>
            </Step>
          )}
          {step === 1 && (
            <Step
              title="Choose your activities"
              text="Add an activity and set the level that feels right today."
            >
              <div className="flex flex-wrap gap-2">
                {selected.map((item) => (
                  <div
                    key={item.activity_id}
                    className="flex items-center gap-2 rounded-2xl bg-[#fff8f3] p-3"
                  >
                    <b>{item.name}</b>
                    <select
                      aria-label={`${item.name} skill level`}
                      value={item.skill_level}
                      onChange={(e) =>
                        setSelected((current) =>
                          current.map((x) =>
                            x.activity_id === item.activity_id
                              ? { ...x, skill_level: e.target.value }
                              : x,
                          ),
                        )
                      }
                      className="rounded-lg border border-ink/15 bg-white p-1 text-sm"
                    >
                      {SKILLS.map((skill) => (
                        <option key={skill}>{skill}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setSelected((current) =>
                          current.filter(
                            (x) => x.activity_id !== item.activity_id,
                          ),
                        )
                      }
                      className="text-sm font-bold text-red-500"
                      aria-label={`Remove ${item.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <select
                value=""
                onChange={(e) => {
                  const activity = activities.find(
                    (item) => item.id === Number(e.target.value),
                  );
                  if (activity) addActivity(activity);
                }}
                className="mt-5 w-full rounded-xl border border-ink/15 bg-[#fffdfa] p-3"
              >
                <option value="">Add an activity…</option>
                {availableActivities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </Step>
          )}
          {step === 2 && (
            <Step
              title="When do you like to play?"
              text="Add as many recurring time slots as you like."
            >
              <AvailabilityEditor
                availability={availability}
                setAvailability={setAvailability}
              />
            </Step>
          )}
          {step === 3 && (
            <Step
              title="Where do you play?"
              text="Use an approximate location—we never need your exact address."
            >
              <Field label="City or neighbourhood">
                <input
                  value={profile.location_name || ""}
                  onChange={(e) =>
                    updateProfile({ location_name: e.target.value })
                  }
                  placeholder="e.g. Bristol, Clifton"
                />
              </Field>
              <Field label="Maximum distance (km)">
                <input
                  type="number"
                  min="0"
                  value={profile.preferred_distance_km ?? 10}
                  onChange={(e) =>
                    updateProfile({
                      preferred_distance_km: Number(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Social preferences (optional)">
                <input
                  value={profile.social_preferences || ""}
                  onChange={(e) =>
                    updateProfile({ social_preferences: e.target.value })
                  }
                  placeholder="friendly, competitive, relaxed"
                />
              </Field>
            </Step>
          )}
          {step === 4 && (
            <Step
              title="Let Activio do the first draft"
              text="Optional: describe your ideal session in your own words. You’ll be able to edit every suggestion."
            >
              <textarea
                className="min-h-40 w-full rounded-2xl border border-ink/15 bg-[#fffdfa] p-4"
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="I'm an intermediate tennis player and usually play after 6pm on weekdays…"
              />
              <button
                type="button"
                onClick={parseWithAi}
                disabled={busy || !aiText.trim()}
                className="mt-4 rounded-full bg-indigo-50 px-5 py-3 font-bold text-indigo-700 disabled:opacity-50"
              >
                {busy ? "Thinking…" : "✨ Suggest structured preferences"}
              </button>
              {parsed && (
                <p className="mt-4 text-sm text-ink/60">
                  Suggestions are now in your activities, availability and
                  distance. Edit them on this screen or go back before
                  reviewing.
                </p>
              )}
            </Step>
          )}
          {step === 5 && (
            <Step
              title="Review before saving"
              text="Nothing is saved until you confirm. You can go back and edit any detail."
            >
              <div className="space-y-4 text-sm">
                <Summary
                  label="Name"
                  value={profile.display_name || "Not set"}
                />
                <Summary label="About" value={profile.bio || "Not set"} />
                <Summary
                  label="Activities"
                  value={
                    selected
                      .map((item) => `${item.name} (${item.skill_level})`)
                      .join(", ") || "None selected"
                  }
                />
                <Summary
                  label="Availability"
                  value={
                    availability
                      .map(
                        (item) =>
                          `${item.day_of_week} ${item.start_time}–${item.end_time}`,
                      )
                      .join(", ") || "Not set"
                  }
                />
                <Summary
                  label="Location"
                  value={`${profile.location_name || "Not set"} · within ${profile.preferred_distance_km ?? 10} km`}
                />
              </div>
              <button
                type="button"
                onClick={save}
                disabled={busy}
                className="mt-8 w-full rounded-full bg-coral-500 px-5 py-3.5 font-bold text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Confirm and save profile"}
              </button>
            </Step>
          )}
          <div className="mt-10 flex justify-between">
            <button
              type="button"
              disabled={step === 0 || busy}
              onClick={() => setStep((current) => current - 1)}
              className="rounded-full px-5 py-3 font-bold text-ink/60 disabled:invisible"
            >
              Back
            </button>
            {step < STEPS.length - 1 && (
              <button
                type="button"
                onClick={() => setStep((current) => current + 1)}
                className="rounded-full bg-ink px-6 py-3 font-bold text-white"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </section>
    </AccountShell>
  );
}

function Step({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      <p className="mt-2 text-ink/60">{text}</p>
      <div className="mt-7 space-y-5">{children}</div>
    </div>
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
    <label className="block text-sm font-bold">
      {label}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#fff8f3] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
        {label}
      </p>
      <p className="mt-1">{value}</p>
    </div>
  );
}
function AvailabilityEditor({
  availability,
  setAvailability,
}: {
  availability: Availability[];
  setAvailability: (value: Availability[]) => void;
}) {
  const [day, setDay] = useState("monday");
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("20:00");
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="rounded-xl border border-ink/15 p-3"
        >
          {DAYS.map((item) => (
            <option key={item}>{item}</option>
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
        <button
          type="button"
          onClick={() =>
            setAvailability([
              ...availability.filter((item) => item.day_of_week !== day),
              {
                day_of_week: day,
                start_time: start,
                end_time: end,
              } as Availability,
            ])
          }
          className="rounded-full bg-indigo-50 px-4 py-2 font-bold text-indigo-700"
        >
          Add
        </button>
      </div>
      <div className="space-y-2">
        {availability.map((item) => (
          <div
            key={`${item.day_of_week}-${item.start_time}`}
            className="flex justify-between rounded-xl bg-[#fff8f3] p-3 text-sm"
          >
            <span>
              {item.day_of_week} · {item.start_time}–{item.end_time}
            </span>
            <button
              type="button"
              onClick={() =>
                setAvailability(availability.filter((entry) => entry !== item))
              }
              className="font-bold text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AccountShell } from "../../components/account-shell";
import { api, Activity, UserActivity } from "../../lib/api-service";
import { ApiError } from "../../lib/api-client";

const skillLevels = ["beginner", "intermediate", "advanced"];
const activityEmojis: Record<string, string> = {
  tennis: "🎾",
  running: "🏃",
  cycling: "🚴",
  swimming: "🏊",
  football: "⚽",
  soccer: "⚽",
  basketball: "🏀",
  yoga: "🧘",
  hiking: "🥾",
  climbing: "🧗",
};
const cardColors = ["bg-coral-100", "bg-indigo-100", "bg-[#e4f2e6]", "bg-[#fff0c9]"];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profileActivities, setProfileActivities] = useState<UserActivity[]>([]);
  const [query, setQuery] = useState("");
  const [skills, setSkills] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [catalog, mine] = await Promise.all([api.activities(), api.myActivities()]);
      setActivities(catalog);
      setProfileActivities(mine);
      setSkills(Object.fromEntries(mine.map((item) => [item.activity_id, item.skill_level])));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "We couldn't load activities right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addedIds = useMemo(() => new Set(profileActivities.map((item) => item.activity_id)), [profileActivities]);
  const visibleActivities = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return activities;
    return activities.filter((activity) =>
      `${activity.name} ${activity.description ?? ""}`.toLowerCase().includes(normalized),
    );
  }, [activities, query]);

  const updateSkill = (activityId: number, skillLevel: string) => {
    setSkills((current) => ({ ...current, [activityId]: skillLevel }));
  };

  const add = async (activityId: number) => {
    setUpdating(activityId);
    setNotice("");
    try {
      const item = await api.addActivity({
        activity_id: activityId,
        skill_level: skills[activityId] || "beginner",
      });
      setProfileActivities((current) => [...current, item]);
      setNotice("Activity added to your profile.");
    } catch (cause) {
      setNotice(cause instanceof ApiError ? cause.message : "Couldn't add that activity. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const remove = async (activityId: number) => {
    setUpdating(activityId);
    setNotice("");
    try {
      await api.removeActivity(activityId);
      setProfileActivities((current) => current.filter((item) => item.activity_id !== activityId));
      setNotice("Activity removed from your profile.");
    } catch (cause) {
      setNotice(cause instanceof ApiError ? cause.message : "Couldn't remove that activity. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <AccountShell title="Explore activities" action={<span className="text-sm font-semibold text-ink/55">{activities.length} activities</span>}>
      <div className="mt-8">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-extrabold">Find your kind of play</h2>
            <p className="mt-1 text-sm text-ink/55">Add interests to help us find people who match your pace.</p>
          </div>
          <label className="w-full sm:max-w-xs">
            <span className="sr-only">Search activities</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search activities…"
              className="rounded-full"
            />
          </label>
        </div>

        {notice && <p role="status" className="mt-4 rounded-2xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-700">{notice}</p>}
        {error && (
          <div role="alert" className="mt-6 rounded-3xl bg-red-50 p-6 text-red-700">
            <p className="font-bold">Activities are taking a quick break.</p>
            <p className="mt-1 text-sm">{error}</p>
            <button onClick={() => void load()} className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">Try again</button>
          </div>
        )}

        {loading ? (
          <div aria-label="Loading activities" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-52 animate-pulse rounded-3xl bg-ink/5" />)}
          </div>
        ) : !error && visibleActivities.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-3xl">🔎</p>
            <h2 className="mt-3 font-display text-xl font-extrabold">No activities found</h2>
            <p className="mt-2 text-sm text-ink/55">{query ? "Try a different search." : "There aren't any activities in the catalog yet."}</p>
          </div>
        ) : !error ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleActivities.map((activity, index) => {
              const isAdded = addedIds.has(activity.id);
              const emoji = activityEmojis[activity.name.toLowerCase()] || "✨";
              return (
                <article key={activity.id} className={`${cardColors[index % cardColors.length]} flex min-h-52 flex-col rounded-3xl p-5 transition hover:-translate-y-1 hover:shadow-soft`}>
                  <div className="flex items-start justify-between gap-3">
                    <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-2xl bg-white/70 text-3xl">{emoji}</span>
                    {isAdded && <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-indigo-700">On your profile</span>}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-extrabold">{activity.name}</h3>
                  <p className="mt-1 min-h-10 text-sm leading-5 text-ink/60">{activity.description || `Find your people and enjoy ${activity.name.toLowerCase()} together.`}</p>
                  <div className="mt-auto flex items-end gap-2 pt-5">
                    {isAdded ? (
                      <button onClick={() => void remove(activity.id)} disabled={updating === activity.id} className="w-full rounded-full bg-white/80 px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-white disabled:cursor-wait disabled:opacity-60">
                        {updating === activity.id ? "Removing…" : "Remove"}
                      </button>
                    ) : (
                      <>
                        <label className="min-w-0 flex-1">
                          <span className="sr-only">Skill level for {activity.name}</span>
                          <select value={skills[activity.id] || "beginner"} onChange={(event) => updateSkill(activity.id, event.target.value)} className="w-full rounded-full border-0 bg-white/80 px-3 py-2.5 text-sm font-semibold text-ink focus:ring-2 focus:ring-coral-500">
                            {skillLevels.map((level) => <option key={level} value={level}>{level[0].toUpperCase() + level.slice(1)}</option>)}
                          </select>
                        </label>
                        <button onClick={() => void add(activity.id)} disabled={updating === activity.id} className="rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600 disabled:cursor-wait disabled:opacity-60">
                          {updating === activity.id ? "Adding…" : "Add"}
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </AccountShell>
  );
}

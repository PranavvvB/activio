"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AccountShell } from "../../components/account-shell";
import { api, Match } from "../../lib/api-service";
import { ApiError } from "../../lib/api-client";

type SortOrder = "score-desc" | "score-asc" | "name";

function displayName(match: Match) {
  return match.matched_user?.profile?.display_name || match.matched_user?.username || `Member #${match.matched_user_id}`;
}

export default function Matches() {
  const [items, setItems] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [minimumScore, setMinimumScore] = useState("0");
  const [sortOrder, setSortOrder] = useState<SortOrder>("score-desc");

  useEffect(() => {
    api.matches()
      .then(setItems)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Unable to load matches."))
      .finally(() => setLoading(false));
  }, []);

  const visibleMatches = useMemo(() => {
    const query = search.trim().toLowerCase();
    const minimum = Number(minimumScore);
    return items
      .filter((match) => {
        const name = displayName(match).toLowerCase();
        const username = match.matched_user?.username?.toLowerCase() || "";
        return (query === "" || name.includes(query) || username.includes(query)) &&
          Number.isFinite(match.score) && match.score >= minimum;
      })
      .sort((a, b) => sortOrder === "name"
        ? displayName(a).localeCompare(displayName(b))
        : sortOrder === "score-asc" ? a.score - b.score : b.score - a.score);
  }, [items, minimumScore, search, sortOrder]);

  return (
    <AccountShell title="Find your people">
      <div className="mt-8">
        {loading ? <p className="text-ink/50" role="status">Finding compatible people…</p> : error ? (
          <p role="alert" className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>
        ) : items.length === 0 ? (
          <p className="rounded-3xl bg-white p-8 text-ink/60">No matches yet. Complete your profile and check back soon.</p>
        ) : (
          <>
            <section aria-label="Filter matches" className="grid gap-4 rounded-3xl border border-ink/8 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <div>
                <label htmlFor="match-search" className="text-sm font-bold">Search people</label>
                <input id="match-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or username" className="mt-2 w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label htmlFor="minimum-score" className="text-sm font-bold">Minimum match</label>
                <select id="minimum-score" value={minimumScore} onChange={(e) => setMinimumScore(e.target.value)} className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                  <option value="0">Any score</option><option value="70">70%+</option><option value="80">80%+</option><option value="90">90%+</option>
                </select>
              </div>
              <div>
                <label htmlFor="match-sort" className="text-sm font-bold">Sort by</label>
                <select id="match-sort" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)} className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                  <option value="score-desc">Best match</option><option value="score-asc">Lowest match</option><option value="name">Name</option>
                </select>
              </div>
            </section>
            {visibleMatches.length === 0 ? (
              <p className="mt-5 rounded-3xl bg-white p-8 text-ink/60">No matches fit those filters.</p>
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleMatches.map((match) => (
                  <Link href={`/matches/${match.id}`} key={match.id} className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <div className="flex justify-between gap-4"><h2 className="font-display text-xl font-extrabold">{displayName(match)}</h2><b className="shrink-0 text-coral-500">{Math.round(match.score)}%</b></div>
                    <p className="mt-3 text-sm text-ink/60">{match.explanation || "A promising activity match."}</p>
                    <span className="mt-5 inline-block text-sm font-bold text-indigo-600">View details <span aria-hidden="true">→</span></span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AccountShell>
  );
}

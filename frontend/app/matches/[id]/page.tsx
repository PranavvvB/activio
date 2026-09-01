"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AccountShell } from "../../../components/account-shell";
import { api, Match } from "../../../lib/api-service";
import { ApiError } from "../../../lib/api-client";

function displayName(match: Match) {
  return match.matched_user?.profile?.display_name || match.matched_user?.username || `Member #${match.matched_user_id}`;
}

export default function MatchDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [match, setMatch] = useState<Match>();
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.match(Number(id)).then(setMatch).catch((e) => setError(e instanceof ApiError ? e.message : "Match unavailable."));
  }, [id]);

  return (
    <AccountShell title="Match details">
      <div className="mt-8 max-w-2xl rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        {error ? <p role="alert" className="text-red-700">{error}</p> : !match ? (
          <p role="status" className="text-ink/50">Loading match…</p>
        ) : (
          <>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-sm text-ink/50">You could play with</p><h2 className="mt-1 font-display text-3xl font-extrabold">{displayName(match)}</h2></div>
              <div aria-label={`${Math.round(match.score)} percent compatibility`} className="shrink-0 rounded-full bg-coral-100 px-4 py-2 text-center font-extrabold text-coral-600">{Math.round(match.score)}% match</div>
            </div>
            <div className="mt-6" aria-label="Compatibility score">
              <div className="h-3 overflow-hidden rounded-full bg-coral-100"><div className="h-full rounded-full bg-coral-500" style={{ width: `${Math.max(0, Math.min(100, match.score))}%` }} /></div>
            </div>
            <section aria-labelledby="why-match" className="mt-8 rounded-2xl bg-[#fff8f3] p-5">
              <h3 id="why-match" className="font-display text-lg font-extrabold">Why this could work</h3>
              <p className="mt-2 text-ink/70">{match.explanation || "This match was selected from your shared profile preferences."}</p>
            </section>
            {(match.matched_user?.profile?.bio || match.matched_user?.profile?.location_name || match.matched_user?.profile?.social_preferences) && (
              <section aria-labelledby="profile-heading" className="mt-8">
                <h3 id="profile-heading" className="font-display text-lg font-extrabold">About {displayName(match)}</h3>
                {match.matched_user.profile.location_name && <p className="mt-3 text-sm text-ink/60">Based in {match.matched_user.profile.location_name}</p>}
                {match.matched_user.profile.bio && <p className="mt-3 text-ink/70">{match.matched_user.profile.bio}</p>}
                {match.matched_user.profile.social_preferences && <p className="mt-3 text-sm text-ink/60">{match.matched_user.profile.social_preferences}</p>}
              </section>
            )}
            {sent ? <p role="status" className="mt-7 text-green-700">Connection request sent.</p> : (
              <button onClick={() => api.connect(match.matched_user_id).then(() => setSent(true)).catch((e) => setError(e instanceof ApiError ? e.message : "Could not connect."))} className="mt-7 rounded-full bg-coral-500 px-6 py-3 font-bold text-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2">Connect with them</button>
            )}
            <button onClick={() => router.push("/matches")} className="ml-3 mt-7 rounded-full bg-indigo-50 px-6 py-3 font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">Back</button>
          </>
        )}
      </div>
    </AccountShell>
  );
}

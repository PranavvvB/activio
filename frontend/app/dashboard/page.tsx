"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "../../components/account-shell";
import { api, Match, User } from "../../lib/api-service";
import { ApiError } from "../../lib/api-client";
export default function Dashboard() {
  const [user, setUser] = useState<User>(); const [matches, setMatches] = useState<Match[]>([]); const [error, setError] = useState("");
  useEffect(() => { Promise.all([api.me(), api.matches()]).then(([u,m]) => { setUser(u); setMatches(m.slice(0,3)); }).catch(e => setError(e instanceof ApiError ? e.message : "Unable to load your dashboard.")); }, []);
  return <AccountShell title={`Welcome${user ? `, ${user.profile?.display_name || user.username}` : ""}`}><div className="mt-8">{error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}<div className="grid gap-5 md:grid-cols-3"><DashLink href="/matches" label="Find matches" text="People nearby who share your pace."/><DashLink href="/profile" label="Complete your profile" text="Add activities and availability."/><DashLink href="/connections" label="Your connections" text="Keep the conversation going." /></div><section className="mt-10"><h2 className="font-display text-2xl font-extrabold">Top matches</h2>{matches.length ? <div className="mt-4 grid gap-4 md:grid-cols-3">{matches.map(m => <Link href={`/matches/${m.id}`} key={m.id} className="rounded-3xl bg-white p-5 shadow-sm"><b>{m.matched_user?.profile?.display_name || m.matched_user?.username || `Member #${m.matched_user_id}`}</b><p className="mt-2 text-coral-500 font-bold">{Math.round(m.score)}% match</p><p className="mt-2 text-sm text-ink/60">{m.explanation}</p></Link>)}</div> : <p className="mt-4 rounded-2xl bg-white p-6 text-ink/55">No matches yet. Add your activities to get discovered.</p>}</section></div></AccountShell>;
}
function DashLink({href,label,text}:{href:string;label:string;text:string}) { return <Link href={href} className="rounded-3xl bg-ink p-6 text-white transition hover:-translate-y-1"><h2 className="font-display text-xl font-extrabold">{label}</h2><p className="mt-2 text-sm text-white/60">{text}</p></Link>; }

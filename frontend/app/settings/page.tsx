"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountShell } from "../../components/account-shell";
import { api, User } from "../../lib/api-service";
import { ApiError } from "../../lib/api-client";
import { authStorage } from "../../lib/auth-storage";

export default function SettingsPage() {
  const [user, setUser] = useState<User>();
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  useEffect(() => { api.me().then(u => { setUser(u); setUsername(u.username); }).catch(e => setError(e instanceof ApiError ? e.message : "Unable to load account settings.")).finally(() => setLoading(false)); }, []);
  const save = async () => {
    if (username.trim().length < 2) { setError("Username must be at least 2 characters."); return; }
    setSaving(true); setError(""); setStatus("");
    try { const updated = await api.updateUser({ username: username.trim() }); setUser(updated); setUsername(updated.username); setStatus("Account settings saved."); }
    catch (e) { setError(e instanceof ApiError ? e.message : "Could not save account settings."); }
    finally { setSaving(false); }
  };
  return <AccountShell title="Settings"><div className="mt-8 grid max-w-3xl gap-6 md:grid-cols-2">
    {loading ? <p role="status" className="rounded-3xl bg-white p-6 text-ink/55">Loading settings…</p> : <section className="rounded-3xl bg-white p-6 shadow-sm md:col-span-2"><h2 className="font-display text-xl font-extrabold">Account</h2><p className="mt-2 text-sm text-ink/55">Signed in as <b>{user?.email}</b></p><label className="mt-5 block text-sm font-bold">Username<input value={username} onChange={e => setUsername(e.target.value)} minLength={2} maxLength={80} autoComplete="username" /></label><button onClick={save} disabled={saving} className="mt-5 rounded-full bg-coral-500 px-5 py-3 font-bold text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button></section>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700 md:col-span-2">{error}</p>}{status && <p role="status" className="rounded-xl bg-green-50 p-3 text-green-700 md:col-span-2">{status}</p>}
    <section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="font-display text-xl font-extrabold">Privacy</h2><p className="mt-2 text-sm leading-6 text-ink/60">Your email and exact location are never shown to other members. Matches use your approximate location and the preferences you choose on your profile.</p><p className="mt-4 text-sm text-ink/55">To change what you share, update your profile preferences.</p></section>
    <section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="font-display text-xl font-extrabold">Session</h2><p className="mt-2 text-sm text-ink/60">Sign out on shared devices to remove this browser’s access token.</p><button onClick={() => { authStorage.clearToken(); router.push("/login"); }} className="mt-5 rounded-full bg-indigo-50 px-5 py-3 font-bold text-indigo-600">Sign out</button></section>
  </div></AccountShell>;
}

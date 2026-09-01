"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "./icon";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="relative z-10 border-b border-ink/5 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="font-display text-2xl font-extrabold tracking-tight text-ink">activio<span className="text-coral-500">.</span></Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-ink/60 md:flex">
          <Link href="/#how-it-works" className="transition hover:text-ink">How it works</Link>
          <Link href="/#activities" className="transition hover:text-ink">Explore activities</Link>
          <Link href="/discover" className="transition hover:text-ink">Community</Link>
          <Link href="/matches" className="transition hover:text-ink">Matches</Link>
          <Link href="/connections" className="transition hover:text-ink">Connections</Link>
          <Link href="/profile" className="transition hover:text-ink">Profile</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/discover" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5 sm:block">Explore</Link>
          <Link href="/register" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600">Join Activio</Link>
          <button onClick={() => setOpen(!open)} className="rounded-full p-2 text-ink md:hidden" aria-label={open ? "Close menu" : "Open menu"}><Icon name="users" size={19} /></button>
        </div>
      </div>
      {open && <nav className="border-t border-ink/5 bg-cream px-6 py-4 md:hidden"><div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-semibold text-ink/70"><Link onClick={() => setOpen(false)} href="/matches">Matches</Link><Link onClick={() => setOpen(false)} href="/connections">Connections</Link><Link onClick={() => setOpen(false)} href="/profile">Profile</Link><Link onClick={() => setOpen(false)} href="/settings">Settings</Link></div></nav>}
    </header>
  );
}

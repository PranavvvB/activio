"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authStorage } from "../lib/auth-storage";
import { useSession } from "../lib/use-session";
import { Icon } from "./icon";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const router = useRouter();
  const session = useSession();
  const isAuthenticated = Boolean(session?.authenticated);
  const userLabel =
    session?.user?.username ||
    session?.user?.profile?.display_name ||
    session?.user?.email ||
    "Account";

  const handleLogout = () => {
    authStorage.clearToken();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="relative z-10 border-b border-ink/5 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link
          href="/"
          className="font-display text-2xl font-extrabold tracking-tight text-ink"
        >
          activio<span className="text-coral-500">.</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-ink/60 md:flex">
          <Link href="/#how-it-works" className="transition hover:text-ink">
            How it works
          </Link>
          <Link href="/#activities" className="transition hover:text-ink">
            Explore activities
          </Link>
          <Link href="/discover" className="transition hover:text-ink">
            Community
          </Link>
          <Link href="/matches" className="transition hover:text-ink">
            Matches
          </Link>
          <Link href="/connections" className="transition hover:text-ink">
            Connections
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setAccountOpen((current) => !current)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-2 text-sm font-semibold text-ink transition hover:border-ink/20 hover:bg-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                  <Icon name="users" size={16} />
                </span>
                <span className="max-w-32 truncate">{userLabel}</span>
                <Icon name="chevron" size={15} />
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 min-w-44 rounded-2xl border border-ink/10 bg-white p-2 shadow-lg"
                >
                  <Link
                    onClick={() => setAccountOpen(false)}
                    href="/profile"
                    role="menuitem"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/discover"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5 sm:block"
              >
                Explore
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
              >
                Join Activio
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-full p-2 text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <Icon name="users" size={19} />
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-ink/5 bg-cream px-6 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-semibold text-ink/70">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                  <Icon name="users" size={17} /> <span>{userLabel}</span>
                </div>
                <Link onClick={() => setOpen(false)} href="/matches">
                  Matches
                </Link>
                <Link onClick={() => setOpen(false)} href="/connections">
                  Connections
                </Link>
                <Link onClick={() => setOpen(false)} href="/profile">
                  Profile
                </Link>
                <Link onClick={() => setOpen(false)} href="/settings">
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="text-left font-bold text-red-600"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link onClick={() => setOpen(false)} href="/login">
                  Log in
                </Link>
                <Link onClick={() => setOpen(false)} href="/register">
                  Create account
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

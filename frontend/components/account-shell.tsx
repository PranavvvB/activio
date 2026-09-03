"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "../lib/use-session";

export function AccountShell({
  children,
  title,
  action,
}: {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!session) return;
    if (!session.authenticated)
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (!session.profileComplete && pathname !== "/profile") {
      router.replace(`/profile?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, session]);
  if (
    !session ||
    !session.authenticated ||
    (!session.profileComplete && pathname !== "/profile")
  ) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-ink/50">Loading…</main>
    );
  }
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-coral-500">Your Activio</p>
          <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight">
            {title}
            <span className="text-coral-500">.</span>
          </h1>
        </div>
        {action}
      </div>
      {children}
    </main>
  );
}

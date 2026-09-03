import Link from "next/link";
import { Icon } from "../../components/icon";

const people = [
  ["Maya R.", "Tennis", "Intermediate", "2.4 km", "M", "bg-[#f5c7aa]", "92%"],
  ["Luca P.", "Running", "Easy pace", "3.1 km", "L", "bg-[#c9d8f4]", "88%"],
  ["Sam K.", "Climbing", "Beginner", "4.8 km", "S", "bg-[#d5e7c8]", "84%"],
  ["Priya D.", "Yoga", "All levels", "5.2 km", "P", "bg-[#f0d0e2]", "81%"],
];

export default function Discover() {
  return (
    <main className="min-h-[calc(100vh-77px)]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold text-coral-500">
              Community preview
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
              People you might click with
              <span className="text-coral-500">.</span>
            </h1>
            <p className="mt-3 text-ink/55">
              A peek at the kind of matches Activio helps you find.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink/60">
            <Icon name="location" size={16} /> London, UK{" "}
            <Icon name="chevron" size={15} />
          </div>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {people.map(
            ([name, activity, level, distance, initial, color, score]) => (
              <article
                key={name}
                className="rounded-3xl border border-ink/8 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl ${color} font-display text-xl font-bold`}
                  >
                    {initial}
                  </span>
                  <span className="rounded-full bg-coral-100 px-3 py-1 text-xs font-extrabold text-coral-600">
                    {score} match
                  </span>
                </div>
                <h2 className="mt-5 font-display text-xl font-extrabold">
                  {name}
                </h2>
                <p className="mt-1 text-sm text-ink/55">
                  {activity} · {level}
                </p>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-ink/45">
                  <Icon name="location" size={14} /> {distance} away
                </div>
                <button className="mt-5 w-full rounded-2xl bg-indigo-50 py-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-100">
                  View profile
                </button>
              </article>
            ),
          )}
        </div>
        <div className="mt-12 rounded-[28px] bg-ink p-7 text-white sm:p-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-2xl font-extrabold">
                Ready to find your people?
              </p>
              <p className="mt-2 text-white/60">
                Activio is launching soon in more communities.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-coral-500 px-5 py-3 font-bold transition hover:bg-coral-600"
            >
              Back to home <Icon name="arrow" size={17} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

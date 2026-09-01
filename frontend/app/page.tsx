import Link from "next/link";
import { ActivityCard } from "../components/activity-card";
import { Icon } from "../components/icon";

const activities = [
  { name: "Tennis", people: "128", emoji: "🎾" }, { name: "Running", people: "246", emoji: "🏃" },
  { name: "Climbing", people: "84", emoji: "🧗" }, { name: "Yoga", people: "190", emoji: "🧘" }
];

export default function Home() {
  return <main>
    <section className="relative overflow-hidden">
      <div className="grid-dots pointer-events-none absolute -right-24 -top-12 h-80 w-80 rounded-full opacity-60" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-32 lg:pt-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-coral-100 px-4 py-2 text-sm font-bold text-coral-600"><span className="h-2 w-2 rounded-full bg-coral-500" /> Made for finding your kind of people</div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.06] tracking-[-.04em] text-ink sm:text-6xl lg:text-[76px]">Find your people.<br /><span className="text-coral-500">Find your play.</span></h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-ink/60">Activio makes it easy to meet nearby people who are into the same activities, at the same pace, and just as ready to get out there.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/discover" className="inline-flex items-center gap-3 rounded-full bg-coral-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-coral-500/20 transition hover:bg-coral-600">Find your community <Icon name="arrow" size={18} /></Link>
            <Link href="#how-it-works" className="rounded-full px-4 py-3.5 font-bold text-ink transition hover:bg-ink/5">See how it works</Link>
          </div>
          <div className="mt-11 flex items-center gap-3 text-sm text-ink/55"><div className="flex -space-x-2"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-cream bg-[#f5c7aa]">🧑🏽</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-cream bg-[#b9c8ed]">👩🏻</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-cream bg-[#d3e5bd]">👨🏾</span></div><span><strong className="text-ink">2,400+</strong> people already playing</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[500px]">
          <div className="absolute -inset-5 rounded-[40px] bg-coral-100/70 rotate-3" /><div className="relative rounded-[36px] bg-indigo-500 p-5 shadow-soft">
            <div className="rounded-[26px] bg-[#f8f7ff] p-5">
              <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Your people</p><h2 className="mt-1 font-display text-2xl font-extrabold text-ink">Around you</h2></div><span className="rounded-full bg-indigo-100 p-2.5 text-indigo-600"><Icon name="location" size={19} /></span></div>
              <div className="mt-6 space-y-3"><Person name="Maya" detail="Tennis · Intermediate" distance="2.4 km" initials="M" color="bg-[#f5c7aa]" /><Person name="Luca" detail="Running · Easy pace" distance="3.1 km" initials="L" color="bg-[#c9d8f4]" /><Person name="Sam" detail="Climbing · Beginner" distance="4.8 km" initials="S" color="bg-[#d5e7c8]" /></div>
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 py-3 text-sm font-bold text-ink transition hover:bg-white">See all nearby <Icon name="arrow" size={16} /></button>
            </div>
          </div>
          <div className="absolute -bottom-7 -left-9 rounded-2xl bg-white px-4 py-3 shadow-soft"><p className="text-xs text-ink/45">Your match score</p><p className="font-display text-2xl font-extrabold text-coral-500">92% <span className="text-sm text-ink/50">great fit</span></p></div>
        </div>
      </div>
    </section>
    <section id="activities" className="border-y border-ink/5 bg-white/50 py-10"><div className="mx-auto max-w-7xl px-6 lg:px-10"><div className="mb-5 flex items-end justify-between"><div><p className="text-sm font-bold text-coral-500">Start with what you love</p><h2 className="mt-1 font-display text-2xl font-extrabold">Popular around you</h2></div><Link href="/discover" className="hidden text-sm font-bold text-indigo-600 sm:block">Explore all <span aria-hidden>→</span></Link></div><div className="flex gap-4 overflow-x-auto pb-2">{activities.map((a, i) => <ActivityCard key={a.name} {...a} index={i} />)}</div></div></section>
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 lg:px-10"><div className="max-w-xl"><p className="text-sm font-bold text-coral-500">Less scrolling, more doing</p><h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight">The right fit feels easy.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3"><Step number="01" title="Tell us your thing" text="Share the activities you love, your level, and when you like to get moving." icon="sparkle" /><Step number="02" title="Meet your matches" text="We find people nearby who fit your pace, preferences, and energy." icon="users" /><Step number="03" title="Make it happen" text="Say hello, pick a time, and turn a good match into a great habit." icon="calendar" /></div></section>
  </main>;
}
function Person({ name, detail, distance, initials, color }: { name: string; detail: string; distance: string; initials: string; color: string }) { return <div className="flex items-center gap-3 rounded-2xl bg-white p-3"><span className={`grid h-11 w-11 place-items-center rounded-full ${color} font-display font-bold`}>{initials}</span><div className="min-w-0 flex-1"><p className="font-bold text-ink">{name}</p><p className="truncate text-xs text-ink/50">{detail}</p></div><span className="text-xs font-semibold text-ink/45">{distance}</span></div>; }
function Step({ number, title, text, icon }: { number: string; title: string; text: string; icon: "sparkle" | "users" | "calendar" }) { return <div className="rounded-3xl border border-ink/8 bg-white p-6"><div className="flex items-center justify-between"><span className="font-display text-sm font-extrabold text-coral-500">{number}</span><span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Icon name={icon} /></span></div><h3 className="mt-8 font-display text-xl font-extrabold">{title}</h3><p className="mt-3 leading-7 text-ink/55">{text}</p></div>; }

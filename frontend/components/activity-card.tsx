import { Icon } from "./icon";
const colors = ["bg-coral-100", "bg-indigo-100", "bg-[#e4f2e6]", "bg-[#fff0c9]"];
export function ActivityCard({ name, people, emoji, index }: { name: string; people: string; emoji: string; index: number }) {
  return <div className={`${colors[index % colors.length]} group flex min-w-[190px] items-center gap-4 rounded-3xl p-4 transition hover:-translate-y-1 hover:shadow-soft`}>
    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/70 text-2xl">{emoji}</span>
    <div><p className="font-display font-bold text-ink">{name}</p><p className="mt-1 text-xs text-ink/55">{people} people nearby</p></div>
    <Icon name="arrow" size={17} />
  </div>;
}

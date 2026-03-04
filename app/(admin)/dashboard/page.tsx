import { getAdminStats, getMerchants } from "@/lib/actions/merchants.actions";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { LuUsers, LuClock, LuTrendingUp } from "react-icons/lu";
import { RxCheckCircled } from "react-icons/rx";

export default async function DashboardPage() {
  const [stats, merchants] = await Promise.all([
    getAdminStats(),
    getMerchants(),
  ]);

  const recentMerchants = merchants.slice(0, 5);

  const cards = [
    {
      label: "Total Merchants",
      value: stats.total,
      Icon: LuUsers,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Active Accounts",
      value: stats.active,
      Icon: RxCheckCircled,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Fully Onboarded",
      value: stats.onboarded,
      Icon: LuTrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Pending Onboarding",
      value: stats.pending,
      Icon: LuClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of all Mechanico merchant accounts.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {cards.map(({ label, value, Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{label}</p>
              <div
                className={`flex size-9 items-center justify-center rounded-lg ${bg}`}
              >
                <Icon size={18} className={color} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent merchants */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-700">
            Recently Created
          </h2>
          <a
            href="/merchants"
            className="text-xs font-medium text-admin-accent hover:underline"
          >
            View all →
          </a>
        </div>
        <div className="divide-y divide-slate-50">
          {recentMerchants.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-400">
              No merchants yet.
            </p>
          ) : (
            recentMerchants.map((m) => (
              <a
                key={m.id}
                href={`/merchants/${m.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
              >
                <div>
                  {/* <p className="text-sm font-medium text-slate-800">
                    {m.workshop?.name ?? `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || m.email}
                  </p> */}
                  <p className="text-xs text-slate-400">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.is_onboarded ? "onboarded" : "pending"}>
                    {m.is_onboarded ? "Onboarded" : "Pending"}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {formatDate(m.created_at)}
                  </span>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

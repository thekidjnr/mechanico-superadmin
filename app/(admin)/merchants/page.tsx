import { getMerchants } from "@/lib/actions/merchants.actions";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { LuUserPlus } from "react-icons/lu";

export default async function MerchantsPage() {
  const merchants = await getMerchants();

  const planVariant = (plan: string | null) => {
    if (plan === "professional") return "pro";
    if (plan === "enterprise") return "enterprise";
    return "free";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Merchants</h1>
          <p className="mt-1 text-sm text-slate-500">
            {merchants.length} total account{merchants.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/create">
            <LuUserPlus size={16} />
            Create Merchant
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Merchant</TableHead>
              <TableHead>Workshop</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Onboarded</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {merchants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                  No merchants yet. Create the first one.
                </TableCell>
              </TableRow>
            ) : (
              merchants.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-800">
                        {`${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "—"}
                      </p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {m.workshop?.name ? (
                      <span className="text-slate-700">{m.workshop.name}</span>
                    ) : (
                      <span className="text-slate-300">Not set up</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={planVariant(m.subscription_type)}>
                      {m.subscription_type ?? "Free"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.is_active ? "active" : "inactive"}>
                      {m.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.is_onboarded ? "onboarded" : "pending"}>
                      {m.is_onboarded ? "Yes" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {formatDate(m.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/merchants/${m.id}`}>View →</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

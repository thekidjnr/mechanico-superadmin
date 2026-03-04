import { getMerchant, toggleMerchantStatus, updateMerchantSubscription } from "@/lib/actions/merchants.actions";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { LuArrowLeft, LuBuilding2, LuMail, LuPhone, LuCalendar } from "react-icons/lu";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value ?? "—"}</span>
    </div>
  );
}

export default async function MerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const merchant = await getMerchant(id);
  if (!merchant) notFound();

  const fullName =
    `${merchant.first_name ?? ""} ${merchant.last_name ?? ""}`.trim() || "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/merchants">
              <LuArrowLeft size={15} />
              Back
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {merchant.workshop?.name ?? fullName}
            </h1>
            <p className="text-sm text-slate-400">{merchant.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={merchant.is_active ? "active" : "inactive"}>
            {merchant.is_active ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={merchant.is_onboarded ? "onboarded" : "pending"}>
            {merchant.is_onboarded ? "Onboarded" : "Pending"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Account details */}
        <div className="col-span-2 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-slate-700">
              Account Details
            </h2>
            <Separator className="mb-3" />
            <div className="divide-y divide-slate-50">
              <InfoRow label="Full Name" value={fullName} />
              <InfoRow label="Email" value={merchant.email} />
              <InfoRow
                label="Subscription"
                value={
                  <Badge
                    variant={
                      merchant.subscription_type === "professional"
                        ? "pro"
                        : merchant.subscription_type === "enterprise"
                        ? "enterprise"
                        : "free"
                    }
                  >
                    {merchant.subscription_type ?? "Free"}
                  </Badge>
                }
              />
              <InfoRow
                label="Sub. Expires"
                value={formatDate(merchant.subscription_end_date)}
              />
              <InfoRow label="Created" value={formatDate(merchant.created_at)} />
            </div>
          </div>

          {/* Workshop details */}
          {merchant.workshop && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-1 text-sm font-semibold text-slate-700">
                Workshop
              </h2>
              <Separator className="mb-3" />
              <div className="divide-y divide-slate-50">
                <InfoRow
                  label="Name"
                  value={
                    <span className="flex items-center gap-1.5">
                      <LuBuilding2 size={13} />
                      {merchant.workshop.name}
                    </span>
                  }
                />
                <InfoRow label="Location" value={merchant.workshop.location} />
                <InfoRow
                  label="Email"
                  value={
                    merchant.workshop.email_address ? (
                      <span className="flex items-center gap-1.5">
                        <LuMail size={13} />
                        {merchant.workshop.email_address}
                      </span>
                    ) : null
                  }
                />
                <InfoRow
                  label="Phone"
                  value={
                    merchant.workshop.phone_number ? (
                      <span className="flex items-center gap-1.5">
                        <LuPhone size={13} />
                        {merchant.workshop.phone_number}
                      </span>
                    ) : null
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions panel */}
        <div className="space-y-4">
          {/* Status toggle */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              Account Actions
            </h2>
            <div className="space-y-2">
              <form
                action={async () => {
                  "use server";
                  await toggleMerchantStatus(id, merchant.is_active);
                }}
              >
                <Button
                  type="submit"
                  variant={merchant.is_active ? "destructive" : "success"}
                  className="w-full"
                  size="sm"
                >
                  {merchant.is_active ? "Deactivate Account" : "Reactivate Account"}
                </Button>
              </form>
            </div>
          </div>

          {/* Subscription management */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              Change Plan
            </h2>
            <div className="space-y-2">
              {["starter", "professional", "enterprise"].map((plan) => (
                <form
                  key={plan}
                  action={async () => {
                    "use server";
                    await updateMerchantSubscription(id, plan);
                  }}
                >
                  <Button
                    type="submit"
                    variant={
                      merchant.subscription_type === plan ? "default" : "outline"
                    }
                    size="sm"
                    className="w-full capitalize"
                    disabled={merchant.subscription_type === plan}
                  >
                    {plan}
                    {merchant.subscription_type === plan && " (current)"}
                  </Button>
                </form>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <LuCalendar size={12} />
              Account created {formatDate(merchant.created_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

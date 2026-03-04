"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createMerchant } from "@/lib/actions/merchants.actions";
import { toast } from "sonner";
import { LuUserPlus, LuRefreshCw, LuCopy, LuCheck } from "react-icons/lu";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: 12 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export default function CreateMerchantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: generatePassword(),
  });

  const setField = (key: keyof typeof form, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleCopy = () => {
    navigator.clipboard.writeText(form.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createMerchant(form);
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Account created for ${form.email}`);
      router.push("/merchants");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Merchant</h1>
        <p className="mt-1 text-sm text-slate-500">
          Set up a new merchant account. They&apos;ll log in with these credentials
          and be prompted to change their password on first sign-in.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input
                    placeholder="John"
                    value={form.first_name}
                    onChange={(e) => setField("first_name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input
                    placeholder="Smith"
                    value={form.last_name}
                    onChange={(e) => setField("last_name", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="merchant@workshop.com"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  required
                />
              </div>

              <Separator />

              {/* Temp password */}
              <div className="space-y-1.5">
                <Label>Temporary Password</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    className="font-mono text-sm"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setField("password", generatePassword())}
                    title="Regenerate"
                  >
                    <LuRefreshCw size={15} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    title="Copy password"
                  >
                    {copied ? (
                      <LuCheck size={15} className="text-green-600" />
                    ) : (
                      <LuCopy size={15} />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-400">
                  Share this with the merchant securely. They&apos;ll be asked to
                  change it on first login.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  disabled={loading}
                  className="gap-2"
                >
                  <LuUserPlus size={16} />
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              What happens next?
            </h3>
            <ol className="space-y-3">
              {[
                "Account is created in Supabase with the temp password.",
                "Merchant logs in at the main app URL.",
                "They are prompted to set a new password.",
                "They complete the workshop onboarding flow.",
                "Their dashboard becomes active.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-xs text-slate-500">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-medium text-amber-700">
              Share credentials securely
            </p>
            <p className="mt-1 text-xs text-amber-600/80">
              Never send the password over email in plain text. Use a secure
              channel like a password manager share link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

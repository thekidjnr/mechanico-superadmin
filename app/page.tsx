"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { LuShield } from "react-icons/lu";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn(form);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-darker">
      {/* Subtle grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          {/* Icon */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-admin-accent/20">
              <LuShield size={24} className="text-admin-accent" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-white">Mechanico Admin</h1>
              <p className="mt-0.5 text-xs text-white/40">
                Restricted access — authorised personnel only
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/60">Email</Label>
              <Input
                type="email"
                placeholder="admin@mechanico.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
                className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:border-admin-accent focus-visible:ring-admin-accent/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/60">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:border-admin-accent focus-visible:ring-admin-accent/30"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="accent"
              className="mt-2 w-full"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-white/20">
          Mechanico Super Admin · Internal use only
        </p>
      </div>
    </div>
  );
}

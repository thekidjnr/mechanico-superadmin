"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard, LuUsers, LuUserPlus, LuLogOut, LuBookOpen } from "react-icons/lu";
import { signOut } from "@/lib/actions/auth.actions";
import { AdminUser } from "@/types";
import { getInitials } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", Icon: LuLayoutDashboard },
  { label: "Merchants", href: "/merchants", Icon: LuUsers },
  { label: "Create Merchant", href: "/create", Icon: LuUserPlus },
  { label: "Catalog", href: "/catalog", Icon: LuBookOpen },
];

export const AdminSidebar = ({ user }: { user: AdminUser | null }) => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-56 flex-col bg-admin-dark text-white">
      {/* Logo */}
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Mechanico
        </p>
        <p className="mt-0.5 text-base font-bold text-white">Super Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ label, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-admin-accent text-xs font-bold text-white">
            {getInitials(user?.first_name ?? null, user?.last_name ?? null)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white">
              {user?.first_name ?? "Admin"}
            </p>
            <p className="truncate text-[10px] text-white/40">{user?.email}</p>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
          >
            <LuLogOut size={14} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
};

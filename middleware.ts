import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/";
  const isAdminRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/merchants") ||
    pathname.startsWith("/create");

  if (!user) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return supabaseResponse;
  }

  // Authenticated — verify superadmin role
  const role = user.user_metadata?.role;

  if (role !== "superadmin") {
    // Not a superadmin — sign them out and redirect to login
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");
    return response;
  }

  // Superadmin trying to access login page — redirect to dashboard
  if (isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

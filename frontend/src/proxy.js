import { NextResponse } from "next/server";

const PUBLIC_PAGES = new Set(["/login", "/register"]);
const PROVIDER_ONLY_PREFIXES = ["/add-food"];
const RECEIVER_ONLY_PREFIXES = ["/cart", "/claim"];
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getAuthCheckUrl() {
  return `${API_BASE_URL.replace(/\/$/, "")}/auth/get-me`;
}

function matchesPrefix(pathname, prefixes) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

async function verifyUserFromBackend(request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return { isAuthenticated: false, role: null };
  }

  try {
    const response = await fetch(getAuthCheckUrl(), {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { isAuthenticated: false, role: null };
    }

    const data = await response.json().catch(() => ({}));
    const role = data?.user?.role || null;
    return { isAuthenticated: true, role };
  } catch {
    return { isAuthenticated: false, role: null };
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isPublicPage = PUBLIC_PAGES.has(pathname);

  // In production, frontend and backend are on different domains, so backend auth
  // cookies are not visible on frontend requests. Do not enforce private-route
  // redirects from proxy; pages handle auth on the client with getMe().
  if (!isPublicPage) {
    return NextResponse.next();
  }

  const { isAuthenticated } = await verifyUserFromBackend(request);

  if (isPublicPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/all-foods", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

import { NextResponse } from "next/server";

const PUBLIC_PAGES = new Set(["/login", "/register"]);
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getAuthCheckUrl() {
  return `${API_BASE_URL.replace(/\/$/, "")}/auth/get-me`;
}

async function verifyUserFromBackend(request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return false;
  }

  try {
    const response = await fetch(getAuthCheckUrl(), {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const isPublicPage = PUBLIC_PAGES.has(pathname);
  const isAuthenticated = await verifyUserFromBackend(request);

  if (!isPublicPage && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/all-foods", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

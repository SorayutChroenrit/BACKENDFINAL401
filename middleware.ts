import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

// Define the shape of the decoded JWT payload
interface DecodedToken {
  role: string;
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    // Redirect to the home page if no token is present
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const user = jwtDecode<DecodedToken>(token);
    const url = req.nextUrl.pathname;

    // Define role-based access matching the sidebar routes
    const roleAccess: Record<string, string[]> = {
      admin: ["/home", "/courses", "/coursemanagement", "/users", "/approve"],
      user: ["/home", "/courses"],
    };

    // Combine admin and user paths for a flexible check
    const allowedPaths = roleAccess[user.role] || [];
    if (
      !allowedPaths.some((path) =>
        new RegExp(`^${path.replace("*", ".*")}$`).test(url)
      )
    ) {
      // Redirect to a 403 Forbidden page if access is denied
      return NextResponse.redirect(new URL("/403", req.url));
    }

    // Proceed to the requested route if access is allowed
    return NextResponse.next();
  } catch (error) {
    // Redirect to the home page if JWT decoding fails
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/home", "/courses", "/coursemanagement", "/users"],
};

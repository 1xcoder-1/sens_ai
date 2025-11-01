import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
  "/_next(.*)",
  "/favicon.ico",
  "/logo.png",
  "/banner.jpeg",
  "/robots.txt",
  "/sitemap.xml",
]);

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/((?!sign-in|sign-up|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Allow access to public routes for everyone
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For all other routes, require authentication
  if (!userId) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run middleware on all routes
    "/(.*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

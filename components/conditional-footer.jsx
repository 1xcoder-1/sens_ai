"use client";

import { usePathname } from "next/navigation";

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on chat page
  if (pathname === "/chat") {
    return null;
  }
  
  // List of known routes in the application
  const knownRoutes = [
    '/',
    '/chat',
    '/dashboard',
    '/resume',
    '/ai-cover-letter',
    '/ai-cover-letter/new',
    '/interview',
    '/interview/mock',
    '/onboarding'
  ];
  
  // Check if it's a dynamic route pattern
  const isCoverLetterRoute = /^\/ai-cover-letter\/[a-zA-Z0-9_-]+$/.test(pathname);
  const isInterviewMockRoute = /^\/interview\/mock\/[a-zA-Z0-9_-]+$/.test(pathname);
  const isSignInRoute = pathname.startsWith('/sign-in');
  const isSignUpRoute = pathname.startsWith('/sign-up');
  
  // Show footer only on known routes or specific dynamic routes
  const shouldShowFooter = knownRoutes.includes(pathname) || 
    isCoverLetterRoute || 
    isInterviewMockRoute ||
    isSignInRoute ||
    isSignUpRoute;
  
  if (!shouldShowFooter) {
    return null;
  }
  
  return (
    <footer className="py-8 border-t border-gray-800">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} AI Career Coach. All rights reserved.
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Empowering professionals with AI-driven career guidance
        </p>
      </div>
    </footer>
  );
}
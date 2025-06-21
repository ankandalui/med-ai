"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Shield } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

function AuthRequired() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Authentication Required
          </h1>
          <p className="text-muted-foreground">
            You need to be logged in to access this page. Please sign in or
            create an account to continue.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/login" className="block">
            <Button className="w-full" size="lg">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>

          <Link href="/signup" className="block">
            <Button variant="outline" className="w-full" size="lg">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function AuthGuard({
  children,
  requireAuth = true,
  fallback,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !isAuthenticated) {
    return fallback || <AuthRequired />;
  }

  return <>{children}</>;
}

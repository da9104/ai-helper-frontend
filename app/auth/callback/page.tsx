"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

/**
 * Supabase redirects here after Google OAuth.
 * The URL contains a code that must be exchanged for a session.
 */
export default function AuthCallbackPage() {
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.href).then(() => {
      router.push("/");
    });
  }, [router, supabase.auth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 text-sm">로그인 처리 중...</p>
    </div>
  );
}

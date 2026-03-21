"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push("/");
    });
  }, [router, supabase.auth]);

  async function signInWithGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div
      style={{
        background: "#07090f",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Hero image — editorial blog post header ──────────────────────── */}
      <div
        style={{
          position: "relative",
          height: "62vh",
          minHeight: "300px",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Image
          src="/images/background.png"
          alt="A solitary figure working at a laptop amid a surreal garden under a cosmic rainbow sky"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="hero-zoom"
          style={{ objectFit: "cover", objectPosition: "center 28%" }}
        />

        {/* Subtle darkening overlay — preserves image detail */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(4, 6, 15, 0.18)",
          }}
        />

        {/* Bottom fade — bleeds the image into the dark content panel */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "130px",
            background: "linear-gradient(to bottom, transparent 0%, rgba(7,9,15,0.75) 75%, #07090f 100%)",
          }}
        />
      </div>

      {/* ── Editorial content panel ──────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          padding: "0 clamp(22px, 7vw, 88px)",
          paddingBottom: "clamp(24px, 4vh, 48px)",
          maxWidth: "720px",
          width: "100%",
        }}
      >

        {/* Blog-style article metadata line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "14px",
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: "20px",
              height: "20px",
              background: "rgba(245,166,35,0.86)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "7px",
              fontWeight: "700",
              color: "#06080e",
              fontFamily: "var(--font-mono, monospace)",
              letterSpacing: "-0.02em",
              flexShrink: 0,
            }}
          >
            AI
          </div>

          <span
            style={{
              fontFamily: "var(--font-serif, Georgia, serif)",
              fontStyle: "italic",
              fontSize: "13px",
              fontWeight: "400",
              color: "rgba(195, 200, 220, 0.75)",
            }}
          >
            Helper
          </span>

          <span
            style={{
              width: "1px",
              height: "11px",
              background: "rgba(90, 98, 130, 0.35)",
              flexShrink: 0,
            }}
          />

          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "9px",
              letterSpacing: "0.08em",
              color: "rgba(100, 108, 140, 0.55)",
            }}
          >
            NOTION · SLACK AUTOMATION
          </span>
        </div>

        {/* Horizontal rule — editorial section break */}
        <div
          style={{
            height: "1px",
            background: "rgba(70, 80, 115, 0.22)",
            marginBottom: "18px",
          }}
        />

        {/* Large editorial headline — the centrepiece */}
        <h1
          className='font-instrument'
          style={{
            fontStyle: "italic",
            fontWeight: "100",
            fontSize: "clamp(30px, 5.2vw, 54px)",
            color: "rgba(212, 218, 238, 0.93)",
            lineHeight: "1.2",
            letterSpacing: "-0.03em",
            marginBottom: "0",
          }}
        >
          Wherever,
        </h1>
        <h1
          className='font-instrument'
          style={{
            fontStyle: "italic",
            fontWeight: "100",
            fontSize: "clamp(30px, 5.2vw, 54px)",
            color: "rgba(212, 218, 238, 0.93)",
            lineHeight: "0.9",
            letterSpacing: "-0.09em",
            marginBottom: "30px",
          }}
        >
          Organize your work.
        </h1>

        {/* Horizontal rule — before CTA */}
        <div
          style={{
            height: "1px",
            background: "rgba(70, 80, 115, 0.22)",
            marginBottom: "18px",
          }}
        />

        {/* Google CTA — clean, editorial-weight */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "11px",
            padding: "13px 20px",
            background: "rgba(9, 11, 24, 0.82)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(140, 148, 185, 0.18)",
            color: loading
              ? "rgba(110, 118, 150, 0.65)"
              : "rgba(210, 215, 235, 0.88)",
            fontSize: "11px",
            fontFamily: "var(--font-mono, monospace)",
            letterSpacing: "0.03em",
            cursor: loading ? "default" : "pointer",
            transition: "border-color 0.16s, color 0.16s, background 0.16s",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            if (loading) return;
            e.currentTarget.style.borderColor = "rgba(245,166,35,0.38)";
            e.currentTarget.style.color = "rgba(245, 218, 168, 0.96)";
            e.currentTarget.style.background = "rgba(9, 11, 24, 0.96)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(140, 148, 185, 0.18)";
            e.currentTarget.style.color = loading
              ? "rgba(110, 118, 150, 0.65)"
              : "rgba(210, 215, 235, 0.88)";
            e.currentTarget.style.background = "rgba(9, 11, 24, 0.82)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18L12.048 13.56c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>

          {loading ? "Redirecting…" : "Continue with Google"}

          {!loading && (
            <svg
              width="11"
              height="11"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              style={{ opacity: 0.38, marginLeft: "2px" }}
            >
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Footer note */}
        <p
          style={{
            marginTop: "18px",
            fontSize: "9px",
            color: "rgba(80, 88, 118, 0.45)",
            letterSpacing: "0.08em",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          SECURE AUTH VIA SUPABASE
        </p>
      </div>
    </div>
  );
}

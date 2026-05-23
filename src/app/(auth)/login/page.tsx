"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🎯</span>
          <h1 className="text-white text-[24px] font-bold mt-3">Studento Education</h1>
          <p className="text-text-muted text-[14px] mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-gray-dark border border-white/10 rounded-2xl p-8 flex flex-col gap-4">
          {error && (
            <div className="px-4 py-3 bg-error/20 text-error text-[13px] rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@example.com"
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-[14px] outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-[14px] outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg text-[14px] font-semibold hover:bg-primary-hover disabled:opacity-60 transition-colors mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

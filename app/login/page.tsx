"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/");
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (
          signInError.message.toLowerCase().includes("credentials") ||
          signInError.message.toLowerCase().includes("invalid")
        ) {
          setError("Invalid email or password");
        } else {
          setError("Login failed");
        }
        setIsLoading(false);
        return;
      }

      router.push("/employees");
      router.refresh();
    } catch (err) {
      setError("Login failed");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-6">Admin Login</h1>

        {error && (
          <div className="mb-6 rounded-lg bg-red-900/50 border border-red-500/50 p-4 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-200 uppercase tracking-wide mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-200 uppercase tracking-wide mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600/50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full group relative rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-500/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none border border-blue-500/30"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}

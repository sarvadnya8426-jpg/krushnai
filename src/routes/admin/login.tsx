import { getSupabase } from "@/lib/supabase";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";


export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  setLoading(true);
  setError("");

  try {
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.user) {
      setError("Unable to verify your account.");
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id, role, is_active")
      .eq("user_id", data.user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError) {
      console.error("Admin verification error:", adminError);
      await supabase.auth.signOut();
      setError("Unable to verify admin access.");
      return;
    }

    if (!admin) {
      await supabase.auth.signOut();
      setError("You are not authorized to access the admin panel.");
      return;
    }

    window.location.href = "/admin";
  } catch (err) {
    console.error(err);
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Krushnai Traders Administration
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter admin email"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
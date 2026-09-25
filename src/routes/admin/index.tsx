import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = getSupabase();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate({ to: "/admin/login" });
        return;
      }

      const { data: admin } = await supabase
        .from("admins")
        .select("user_id, role, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!admin) {
        await supabase.auth.signOut();
        navigate({ to: "/admin/login" });
        return;
      }

      setEmail(user.email ?? "");
      setChecking(false);
    };

    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">Checking admin access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Krushnai Traders
            </h1>
            <p className="text-sm text-slate-500">
              Admin Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Welcome, Admin
          </h2>

          <p className="mt-2 text-slate-500">
            Logged in as {email}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Products */}
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/products" })}
            className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h3 className="font-semibold text-slate-900">
              Products
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Manage your products
            </p>
          </button>

          {/* Categories */}
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/categories" })}
            className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h3 className="font-semibold text-slate-900">
              Categories
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Manage product categories
            </p>
          </button>

          {/* Brands */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">
              Brands
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Manage brands
            </p>
          </div>

          {/* Gallery */}
<button
  type="button"
  onClick={() => navigate({ to: "/admin/gallery" })}
  className="rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
>
  <h3 className="font-semibold text-slate-900">
    Gallery
  </h3>

  <p className="mt-2 text-sm text-slate-500">
    Manage gallery images
  </p>
</button>
        </div>
      </main>
    </div>
  );
}
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/settings/")({
  component: AdminSettings,
});

type Settings = {
  business_name: string;
  legal_name: string;
  tagline: string;
  subtagline: string;
  description: string;
  email: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  instagram: string;
  facebook: string;
};

const emptySettings: Settings = {
  business_name: "",
  legal_name: "",
  tagline: "",
  subtagline: "",
  description: "",
  email: "",
  phone1: "",
  phone2: "",
  whatsapp: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
  instagram: "",
  facebook: "",
};

function AdminSettings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    checkAdminAndLoadSettings();
  }, []);

  const checkAdminAndLoadSettings = async () => {
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
      .select("user_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!admin) {
      await supabase.auth.signOut();
      navigate({ to: "/admin/login" });
      return;
    }

    await loadSettings();
  };

  const loadSettings = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await getSupabase()
      .from("website_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data) {
      setSettings({
        business_name: data.business_name ?? "",
        legal_name: data.legal_name ?? "",
        tagline: data.tagline ?? "",
        subtagline: data.subtagline ?? "",
        description: data.description ?? "",
        email: data.email ?? "",
        phone1: data.phone1 ?? "",
        phone2: data.phone2 ?? "",
        whatsapp: data.whatsapp ?? "",
        address1: data.address1 ?? "",
        address2: data.address2 ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        pincode: data.pincode ?? "",
        instagram: data.instagram ?? "",
        facebook: data.facebook ?? "",
      });
    }

    setLoading(false);
  };

  const updateField = (field: keyof Settings, value: string) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
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
        .select("user_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!admin) {
        await supabase.auth.signOut();
        navigate({ to: "/admin/login" });
        return;
      }

      const { error: saveError } = await supabase
        .from("website_settings")
        .upsert({
          id: 1,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (saveError) {
        throw saveError;
      }

      setSuccess("Website settings saved successfully.");
    } catch (err) {
      console.error("Settings save failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save website settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">
          Loading website settings...
        </p>
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
              Website Settings
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/admin" })}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Website Settings
          </h2>

          <p className="mt-2 text-slate-500">
            Manage the business information displayed across your website.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Information */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-xl font-semibold text-slate-900">
              Business Information
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Business Name
                </label>

                <input
                  value={settings.business_name}
                  onChange={(e) =>
                    updateField("business_name", e.target.value)
                  }
                  placeholder="Krushnai Traders"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Legal Name
                </label>

                <input
                  value={settings.legal_name}
                  onChange={(e) =>
                    updateField("legal_name", e.target.value)
                  }
                  placeholder="Krushnai Traders"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tagline
                </label>

                <input
                  value={settings.tagline}
                  onChange={(e) =>
                    updateField("tagline", e.target.value)
                  }
                  placeholder="Everything You Need to Build, Furnish & Finish."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Subtagline
                </label>

                <input
                  value={settings.subtagline}
                  onChange={(e) =>
                    updateField("subtagline", e.target.value)
                  }
                  placeholder="From Plywood to Hardware. From Bathrooms to Power Tools."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Business Description
                </label>

                <textarea
                  value={settings.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  rows={4}
                  placeholder="Business description..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-xl font-semibold text-slate-900">
              Contact Information
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    updateField("email", e.target.value)
                  }
                  placeholder="info@example.com"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone 1
                </label>

                <input
                  value={settings.phone1}
                  onChange={(e) =>
                    updateField("phone1", e.target.value)
                  }
                  placeholder="+91 94222 32315"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone 2
                </label>

                <input
                  value={settings.phone2}
                  onChange={(e) =>
                    updateField("phone2", e.target.value)
                  }
                  placeholder="+91 99238 28206"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  WhatsApp Number
                </label>

                <input
                  value={settings.whatsapp}
                  onChange={(e) =>
                    updateField("whatsapp", e.target.value)
                  }
                  placeholder="918767415075"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-xl font-semibold text-slate-900">
              Address
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Address Line 1
                </label>

                <input
                  value={settings.address1}
                  onChange={(e) =>
                    updateField("address1", e.target.value)
                  }
                  placeholder="Krushnai Traders"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Address Line 2
                </label>

                <input
                  value={settings.address2}
                  onChange={(e) =>
                    updateField("address2", e.target.value)
                  }
                  placeholder="Near T Point, Khultabad Road, Phulambri"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  City
                </label>

                <input
                  value={settings.city}
                  onChange={(e) =>
                    updateField("city", e.target.value)
                  }
                  placeholder="Chhatrapati Sambhajinagar"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  State
                </label>

                <input
                  value={settings.state}
                  onChange={(e) =>
                    updateField("state", e.target.value)
                  }
                  placeholder="Maharashtra"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Pincode
                </label>

                <input
                  value={settings.pincode}
                  onChange={(e) =>
                    updateField("pincode", e.target.value)
                  }
                  placeholder="431111"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </section>

          {/* Social Media */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-xl font-semibold text-slate-900">
              Social Media
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Instagram URL
                </label>

                <input
                  value={settings.instagram}
                  onChange={(e) =>
                    updateField("instagram", e.target.value)
                  }
                  placeholder="https://instagram.com/..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Facebook URL
                </label>

                <input
                  value={settings.facebook}
                  onChange={(e) =>
                    updateField("facebook", e.target.value)
                  }
                  placeholder="https://facebook.com/..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 px-8 py-3 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
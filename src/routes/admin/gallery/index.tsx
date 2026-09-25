import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { gallery as existingGallery } from "@/data/content";

export const Route = createFileRoute("/admin/gallery/")({
  component: AdminGallery,
});

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  filter: string;
  created_at: string;
};

type GalleryForm = {
  alt: string;
  filter: string;
};

const emptyForm: GalleryForm = {
  alt: "",
  filter: "Showroom",
};

const galleryCategories = [
  "Showroom",
  "Furniture",
  "Kitchens",
  "Bathrooms",
  "Doors",
  "Tools",
];

function AdminGallery() {
  const navigate = useNavigate();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [form, setForm] = useState<GalleryForm>(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdminAndLoadGallery();
  }, []);

  const checkAdminAndLoadGallery = async () => {
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

    await loadGallery();
  };

  const loadGallery = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await getSupabase()
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setItems((data ?? []) as GalleryItem[]);
    setLoading(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select an image.");
      return;
    }

    setSaving(true);
    setError("");

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

      const fileExtension =
        selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `${crypto.randomUUID()}.${fileExtension}`;

      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      const { error: databaseError } = await supabase
        .from("gallery")
        .insert({
          src: publicUrl,
          alt: form.alt.trim(),
          filter: form.filter,
        });

      if (databaseError) {
        await supabase.storage
          .from("gallery")
          .remove([filePath]);

        throw databaseError;
      }

      setForm(emptyForm);
      setSelectedFile(null);

      const fileInput = document.getElementById(
        "gallery-image"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await loadGallery();
    } catch (err) {
      console.error("Gallery upload failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload gallery image."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this gallery image?"
    );

    if (!confirmed) return;

    setError("");

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

      const url = new URL(item.src);
      const marker = "/storage/v1/object/public/gallery/";

      const markerIndex = url.pathname.indexOf(marker);

      if (markerIndex !== -1) {
        const storagePath = decodeURIComponent(
          url.pathname.substring(
            markerIndex + marker.length
          )
        );

        const { error: storageError } = await supabase.storage
          .from("gallery")
          .remove([storagePath]);

        if (storageError) {
          throw storageError;
        }
      }

      const { error: databaseError } = await supabase
        .from("gallery")
        .delete()
        .eq("id", item.id);

      if (databaseError) {
        throw databaseError;
      }

      await loadGallery();
    } catch (err) {
      console.error("Gallery delete failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete gallery image."
      );
    }
  };

    const handleImportExistingGallery = async () => {
    const confirmed = window.confirm(
      "Import the existing gallery images into Supabase? Existing images will not be deleted."
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");

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

      const { data: currentItems, error: currentError } = await supabase
        .from("gallery")
        .select("src");

      if (currentError) {
        throw currentError;
      }

      const existingSources = new Set(
        (currentItems ?? []).map((item) => item.src)
      );

      const itemsToImport = existingGallery
        .filter((item) => !existingSources.has(item.src))
        .map((item) => ({
          src: item.src,
          alt: item.alt,
          filter: item.filter,
        }));

      if (itemsToImport.length === 0) {
        alert("All existing gallery images are already imported.");
        return;
      }

      const { error: insertError } = await supabase
        .from("gallery")
        .insert(itemsToImport);

      if (insertError) {
        throw insertError;
      }

      alert(
        `Successfully imported ${itemsToImport.length} existing gallery images.`
      );

      await loadGallery();
    } catch (err) {
      console.error("Gallery import failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to import existing gallery."
      );
    } finally {
      setSaving(false);
    }
  };


  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Krushnai Traders
            </h1>

            <p className="text-sm text-slate-500">
              Gallery Management
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate({ to: "/admin" })}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Gallery
          </h2>

          <p className="mt-2 text-slate-500">
            Add and delete images displayed on your website gallery.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-xl font-semibold text-slate-900">
            Add Gallery Image
          </h3>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <label
                htmlFor="gallery-image"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Image *
              </label>

              <input
                id="gallery-image"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setSelectedFile(
                    event.target.files?.[0] ?? null
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="gallery-alt"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Image Title / Description *
              </label>

              <input
                id="gallery-alt"
                value={form.alt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    alt: event.target.value,
                  }))
                }
                placeholder="Example: Modular kitchen showroom"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="gallery-filter"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Category
              </label>

              <select
                id="gallery-filter"
                value={form.filter}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    filter: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
              >
                {galleryCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Uploading..." : "Upload Image"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h3 className="text-xl font-semibold text-slate-900">
        Gallery Images
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Manage all images displayed on your website.
      </p>
    </div>

    <div className="flex items-center gap-3">
      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
        {items.length} images
      </span>

      <button
        type="button"
        onClick={handleImportExistingGallery}
        disabled={saving}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Importing..." : "Import Existing Gallery"}
      </button>
    </div>
  </div>

          {loading ? (
            <p className="py-10 text-center text-slate-500">
              Loading gallery...
            </p>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-slate-500">
              No gallery images have been added yet.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="aspect-[4/3] w-full object-cover"
                  />

                  <div className="p-4">
                    <p className="font-medium text-slate-900">
                      {item.alt}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.filter}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
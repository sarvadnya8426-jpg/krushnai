import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";

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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

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

  const startEditing = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditingName(item.alt);
    setError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveImageName = async (item: GalleryItem) => {
    const newName = editingName.trim();

    if (!newName) {
      setError("Image name cannot be empty.");
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

      const { error: updateError } = await supabase
        .from("gallery")
        .update({
          alt: newName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (updateError) {
        throw updateError;
      }

      setEditingId(null);
      setEditingName("");

      await loadGallery();
    } catch (err) {
      console.error("Gallery name update failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update image name."
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

      let markerIndex = -1;
let storagePath = "";

try {
  const url = new URL(item.src, window.location.origin);
  const marker = "/storage/v1/object/public/gallery/";

  markerIndex = url.pathname.indexOf(marker);

  if (markerIndex !== -1) {
    storagePath = decodeURIComponent(
      url.pathname.substring(markerIndex + marker.length)
    );
  }
} catch (urlError) {
  console.warn(
    "Gallery image URL could not be parsed:",
    item.src,
    urlError
  );
}

      if (storagePath) {
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
            Add and manage images displayed on your website gallery.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add Gallery Image */}
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

        {/* Gallery Images */}
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

            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {items.length} images
            </span>
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
                    {editingId === item.id ? (
                      <>
                        <label
                          htmlFor={`edit-name-${item.id}`}
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Image Name / Description
                        </label>

                        <input
                          id={`edit-name-${item.id}`}
                          type="text"
                          value={editingName}
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                          autoFocus
                        />

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveImageName(item)}
                            disabled={saving}
                            className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={saving}
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-slate-900">
                          {item.alt}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.filter}
                        </p>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                          >
                            Edit Name
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
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
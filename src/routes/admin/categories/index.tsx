import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/categories/")({
  component: AdminCategories,
});

type Category = {
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  items: string[] | null;
};

function AdminCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Category>({
    slug: "",
    name: "",
    description: "",
    image: "",
    items: [],
  });

  const [itemsText, setItemsText] = useState("");

  const checkAdmin = async () => {
    const supabase = getSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate({ to: "/admin/login" });
      return false;
    }

    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError || !admin) {
      await supabase.auth.signOut();
      navigate({ to: "/admin/login" });
      return false;
    }

    return true;
  };

  const loadCategories = async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      setCategories((data ?? []) as Category[]);
    } catch (err) {
      console.error("Failed to load categories:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const allowed = await checkAdmin();

      if (allowed) {
        await loadCategories();
      }
    };

    init();
  }, []);

  const importExistingCategories = async () => {
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

      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        navigate({ to: "/admin/login" });
        return;
      }

      const { categories: existingCategories } = await import(
        "../../../data/categories"
      );

      const categoriesToImport = existingCategories.map((category) => ({
        slug: category.slug,
        name: category.name,
        description: category.description,
        image: category.image,
        items: category.items ?? [],
      }));

      const { error: importError } = await supabase
        .from("categories")
        .upsert(categoriesToImport, {
          onConflict: "slug",
        });

      if (importError) {
        throw importError;
      }

      await loadCategories();

      alert(
        `Successfully imported ${categoriesToImport.length} categories into Supabase.`,
      );
    } catch (err) {
      console.error("Category import failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to import existing categories.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveCategory = async () => {
    if (!form.slug.trim() || !form.name.trim()) {
      setError("Slug and category name are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = getSupabase();

      const categoryToSave = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        description: form.description?.trim() || null,
        image: form.image?.trim() || null,
        items: itemsText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const { error } = await supabase
        .from("categories")
        .upsert(categoryToSave, {
          onConflict: "slug",
        });

      if (error) {
        throw error;
      }

      setForm({
        slug: "",
        name: "",
        description: "",
        image: "",
        items: [],
      });

      setItemsText("");

      await loadCategories();

      alert("Category saved successfully.");
    } catch (err) {
      console.error("Failed to save category:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save category.",
      );
    } finally {
      setSaving(false);
    }
  };

  const editCategory = (category: Category) => {
    setForm(category);

    setItemsText(
      (category.items ?? []).join("\n"),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteCategory = async (slug: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = getSupabase();

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("slug", slug);

      if (error) {
        throw error;
      }

      await loadCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete category.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Categories
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/admin" })}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={importExistingCategories}
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Importing..."
                : "Import Existing Categories"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">
            Add / Edit Category
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">
                Slug
              </label>

              <input
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value,
                  })
                }
                placeholder="example-category"
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Name
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Category name"
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Description
              </label>

              <textarea
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Image Path / URL
              </label>

              <input
                value={form.image ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    image: e.target.value,
                  })
                }
                placeholder="/images/categories/example.jpg"
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Category Items
              </label>

              <p className="mt-1 text-xs text-muted-foreground">
                Enter one item per line.
              </p>

              <textarea
                value={itemsText}
                onChange={(e) =>
                  setItemsText(e.target.value)
                }
                rows={8}
                placeholder={`Commercial Plywood
Waterproof Plywood
Marine Plywood`}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={saveCategory}
              disabled={saving}
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Save Category
            </button>

            <button
              type="button"
              onClick={() => {
                setForm({
                  slug: "",
                  name: "",
                  description: "",
                  image: "",
                  items: [],
                });

                setItemsText("");
                setError("");
              }}
              className="rounded-md border border-border px-5 py-2 text-sm font-medium hover:bg-muted"
            >
              Clear
            </button>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Existing Categories
            </h2>

            <p className="text-sm text-muted-foreground">
              {categories.length} categories in Supabase
            </p>
          </div>

          {loading ? (
            <div className="rounded-md border border-border p-10 text-center">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-10 text-center">
              No categories found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.slug}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  {category.image ? (
                    <div className="mb-4 overflow-hidden rounded-md bg-muted">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <h3 className="font-semibold">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {category.slug}
                  </p>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {category.description}
                  </p>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {category.items?.length ?? 0} items
                  </p>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        editCategory(category)
                      }
                      className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteCategory(category.slug)
                      }
                      disabled={saving}
                      className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
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
  sort_order: number;
};

function AdminCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Stores the newly uploaded image URL so it can be removed
  // if the user clears the form without saving.
  const uploadedImageUrlRef = useRef<string | null>(null);

  const [form, setForm] = useState<Category>({
    slug: "",
    name: "",
    description: "",
    image: "",
    items: [],
    sort_order: 0,
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
        .order("sort_order", { ascending: true })
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

  /*
   * Extracts the storage path from a Supabase category image URL.
   *
   * Example:
   * https://tavqjoaqzotakyknrpzx.supabase.co/storage/v1/object/public/category-images/laminate.png
   *
   * returns:
   * laminate.png
   *
   * Returns null for external URLs or old/local image paths.
   */
  const getCategoryStoragePath = (
    imageUrl: string | null | undefined,
  ): string | null => {
    if (!imageUrl) {
      return null;
    }

    const marker = "/storage/v1/object/public/category-images/";

    try {
      const url = new URL(imageUrl, window.location.origin);

      const markerIndex = url.pathname.indexOf(marker);

      if (markerIndex === -1) {
        return null;
      }

      const storagePath = decodeURIComponent(
        url.pathname.substring(markerIndex + marker.length),
      );

      return storagePath || null;
    } catch {
      return null;
    }
  };

  /*
   * Deletes a category image from Supabase Storage only when
   * the image belongs to our category-images bucket.
   */
  const deleteCategoryImage = async (
    imageUrl: string | null | undefined,
  ) => {
    const storagePath = getCategoryStoragePath(imageUrl);

    if (!storagePath) {
      return;
    }

    const supabase = getSupabase();

    const { error: storageError } = await supabase.storage
      .from("category-images")
      .remove([storagePath]);

    if (storageError) {
      console.warn(
        "Failed to delete category image from storage:",
        storageError,
      );
    }
  };

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const supabase = getSupabase();

      /*
       * If another new image was uploaded but not saved yet,
       * remove that previous temporary image first.
       */
      if (uploadedImageUrlRef.current) {
        await deleteCategoryImage(
          uploadedImageUrlRef.current,
        );

        uploadedImageUrlRef.current = null;
      }

      const fileExtension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .toLowerCase();

      const fileName = `${Date.now()}-${safeName}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("category-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("category-images")
        .getPublicUrl(fileName);

      const newImageUrl = data.publicUrl;

      uploadedImageUrlRef.current = newImageUrl;

      setForm((current) => ({
        ...current,
        image: newImageUrl,
      }));
    } catch (uploadError) {
      console.error(
        "Failed to upload category image:",
        uploadError,
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload category image. Please try again.",
      );
    } finally {
      setUploadingImage(false);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

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

      const categoriesToImport = existingCategories.map(
        (category, index) => ({
          slug: category.slug,
          name: category.name,
          description: category.description,
          image: category.image,
          items: category.items ?? [],
          sort_order: index + 1,
        }),
      );

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

      let sortOrder = form.sort_order;

      const existingCategory = categories.find(
        (category) => category.slug === form.slug.trim(),
      );

      /*
       * Remember the old image before saving.
       * If the new image is different, the old Supabase image
       * will be deleted after the database update succeeds.
       */
      const oldImageUrl = existingCategory?.image ?? null;
      const newImageUrl = form.image?.trim() || null;

      if (!existingCategory) {
        const maxSortOrder = categories.reduce(
          (max, category) =>
            Math.max(max, category.sort_order),
          0,
        );

        sortOrder = maxSortOrder + 1;
      }

      const categoryToSave = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        description: form.description?.trim() || null,
        image: newImageUrl,
        items: itemsText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        sort_order: sortOrder,
      };

      const { error } = await supabase
        .from("categories")
        .upsert(categoryToSave, {
          onConflict: "slug",
        });

      if (error) {
        throw error;
      }

      /*
       * Database save succeeded.
       *
       * If the category previously had a Supabase Storage image
       * and the image was changed, remove the old image.
       */
      if (
        oldImageUrl &&
        oldImageUrl !== newImageUrl
      ) {
        await deleteCategoryImage(oldImageUrl);
      }

      /*
       * The newly uploaded image is now safely saved,
       * so it is no longer a temporary upload.
       */
      if (
        uploadedImageUrlRef.current &&
        uploadedImageUrlRef.current === newImageUrl
      ) {
        uploadedImageUrlRef.current = null;
      }

      setForm({
        slug: "",
        name: "",
        description: "",
        image: "",
        items: [],
        sort_order: 0,
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
    /*
     * If there is an unsaved uploaded image from a previous edit,
     * remove it before switching to another category.
     */
    if (uploadedImageUrlRef.current) {
      void deleteCategoryImage(
        uploadedImageUrlRef.current,
      );

      uploadedImageUrlRef.current = null;
    }

    setForm(category);

    setItemsText((category.items ?? []).join("\n"));

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const clearForm = async () => {
    /*
     * Delete a newly uploaded image if it has not been saved yet.
     */
    if (uploadedImageUrlRef.current) {
      await deleteCategoryImage(
        uploadedImageUrlRef.current,
      );

      uploadedImageUrlRef.current = null;
    }

    setForm({
      slug: "",
      name: "",
      description: "",
      image: "",
      items: [],
      sort_order: 0,
    });

    setItemsText("");
    setError("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const moveCategory = async (
    category: Category,
    direction: "up" | "down",
  ) => {
    const currentIndex = categories.findIndex(
      (item) => item.slug === category.slug,
    );

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= categories.length
    ) {
      return;
    }

    const targetCategory = categories[targetIndex];

    setSaving(true);
    setError("");

    try {
      const supabase = getSupabase();

      const currentOrder = category.sort_order;
      const targetOrder = targetCategory.sort_order;

      const { error: firstError } = await supabase
        .from("categories")
        .update({
          sort_order: targetOrder,
        })
        .eq("slug", category.slug);

      if (firstError) {
        throw firstError;
      }

      const { error: secondError } = await supabase
        .from("categories")
        .update({
          sort_order: currentOrder,
        })
        .eq("slug", targetCategory.slug);

      if (secondError) {
        throw secondError;
      }

      await loadCategories();
    } catch (err) {
      console.error("Failed to reorder categories:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to reorder categories.",
      );
    } finally {
      setSaving(false);
    }
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

      /*
       * Get the category first so we know which image belongs
       * to it before deleting the database record.
       */
      const categoryToDelete = categories.find(
        (category) => category.slug === slug,
      );

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("slug", slug);

      if (error) {
        throw error;
      }

      /*
       * Database deletion succeeded.
       * Now remove the associated Supabase Storage image.
       */
      if (categoryToDelete?.image) {
        await deleteCategoryImage(
          categoryToDelete.image,
        );
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
                Category Image
              </label>

              <div className="mt-2 space-y-3">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="block w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm"
                />

                {uploadingImage ? (
                  <p className="text-sm text-muted-foreground">
                    Uploading image...
                  </p>
                ) : null}

                {form.image ? (
                  <div className="overflow-hidden rounded-md border border-border bg-muted p-3">
                    <img
                      src={form.image}
                      alt="Category preview"
                      className="h-48 w-full rounded-md object-cover"
                    />
                  </div>
                ) : null}

                <input
                  value={form.image ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image: e.target.value,
                    })
                  }
                  placeholder="Or paste an image URL"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />

                <p className="text-xs text-muted-foreground">
                  Select an image from your PC or paste an image URL.
                  Maximum file size: 5 MB.
                </p>
              </div>
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
              disabled={saving || uploadingImage}
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Category"}
            </button>

            <button
              type="button"
              onClick={clearForm}
              disabled={saving || uploadingImage}
              className="rounded-md border border-border px-5 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
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
              {categories.map((category, index) => (
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

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {category.slug}
                      </p>
                    </div>

                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                      #{index + 1}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {category.description}
                  </p>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {category.items?.length ?? 0} items
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        moveCategory(category, "up")
                      }
                      disabled={saving || index === 0}
                      className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↑ Up
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        moveCategory(category, "down")
                      }
                      disabled={
                        saving ||
                        index === categories.length - 1
                      }
                      className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↓ Down
                    </button>
                  </div>

                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        editCategory(category)
                      }
                      className="flex-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteCategory(category.slug)
                      }
                      disabled={saving}
                      className="flex-1 rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
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
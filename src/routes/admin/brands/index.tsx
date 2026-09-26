import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { getSupabase } from "@/lib/supabase";

import pidiliteLogo from "@/assets/brands/pidilite.png";
import godrejLogo from "@/assets/brands/godrej.png";
import fevicolLogo from "@/assets/brands/fevicol.png";
import europaLogo from "@/assets/brands/europa.jpg";
import dongLogo from "@/assets/brands/dong.png";
import decostaLogo from "@/assets/brands/decosta.jpg";
import boschLogo from "@/assets/brands/bosch.jpg";
import astralLogo from "@/assets/brands/astral.jpg";
import hafeleLogo from "@/assets/brands/haffele.png";
import yuriLogo from "@/assets/brands/yuri.webp";

export const Route = createFileRoute("/admin/brands/")({
  component: AdminBrands,
});

type Brand = {
  id: string;
  name: string;
  logo: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

const existingBrands = [
  { name: "Pidilite", image: pidiliteLogo },
  { name: "Godrej", image: godrejLogo },
  { name: "Fevicol", image: fevicolLogo },
  { name: "Europa", image: europaLogo },
  { name: "Dong", image: dongLogo },
  { name: "Decosta", image: decostaLogo },
  { name: "Bosch", image: boschLogo },
  { name: "Astral", image: astralLogo },
  { name: "Hafele", image: hafeleLogo },
  { name: "Yuri", image: yuriLogo },
];

function AdminBrands() {
  const navigate = useNavigate();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const uploadedImageUrlRef = useRef<string | null>(null);

  const [form, setForm] = useState<Brand>({
    id: "",
    name: "",
    logo: "",
    sort_order: 0,
    is_active: true,
  });

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

  const loadBrands = async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      setBrands((data ?? []) as Brand[]);
    } catch (err) {
      console.error("Failed to load brands:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load brands.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const allowed = await checkAdmin();

      if (allowed) {
        await loadBrands();
      }
    };

    init();
  }, []);

  const getBrandStoragePath = (
    imageUrl: string | null | undefined,
  ): string | null => {
    if (!imageUrl) {
      return null;
    }

    const marker = "/storage/v1/object/public/brand-images/";

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

  const deleteBrandImage = async (
    imageUrl: string | null | undefined,
  ) => {
    const storagePath = getBrandStoragePath(imageUrl);

    if (!storagePath) {
      return;
    }

    const supabase = getSupabase();

    const { error: storageError } = await supabase.storage
      .from("brand-images")
      .remove([storagePath]);

    if (storageError) {
      console.warn(
        "Failed to delete brand image from storage:",
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

      if (uploadedImageUrlRef.current) {
        await deleteBrandImage(
          uploadedImageUrlRef.current,
        );

        uploadedImageUrlRef.current = null;
      }

      const fileExtension =
        file.name.split(".").pop()?.toLowerCase() || "png";

      const safeName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .toLowerCase();

      const fileName = `${Date.now()}-${safeName}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("brand-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("brand-images")
        .getPublicUrl(fileName);

      const newImageUrl = data.publicUrl;

      uploadedImageUrlRef.current = newImageUrl;

      setForm((current) => ({
        ...current,
        logo: newImageUrl,
      }));
    } catch (uploadError) {
      console.error(
        "Failed to upload brand image:",
        uploadError,
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload brand image. Please try again.",
      );
    } finally {
      setUploadingImage(false);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  /*
   * Import the original static brands into Supabase.
   */
  const importExistingBrands = async () => {
    if (importing) {
      return;
    }

    const confirmed = window.confirm(
      "Import the existing 10 brands into Supabase?",
    );

    if (!confirmed) {
      return;
    }

    setImporting(true);
    setError("");

    try {
      const supabase = getSupabase();

      /*
       * Get current brands so we do not create duplicates.
       */
      const { data: currentBrands, error: currentError } =
        await supabase
          .from("brands")
          .select("name");

      if (currentError) {
        throw currentError;
      }

      const existingNames = new Set(
        (currentBrands ?? []).map((brand) =>
          brand.name.trim().toLowerCase(),
        ),
      );

      /*
       * Find the current highest order.
       */
      const { data: orderData, error: orderError } =
        await supabase
          .from("brands")
          .select("sort_order")
          .order("sort_order", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (orderError) {
        throw orderError;
      }

      let nextSortOrder =
        (orderData?.sort_order ?? 0) + 1;

      let importedCount = 0;
      let skippedCount = 0;

      for (const brand of existingBrands) {
        /*
         * Skip if this brand already exists.
         */
        if (
          existingNames.has(
            brand.name.trim().toLowerCase(),
          )
        ) {
          skippedCount++;
          continue;
        }

        /*
         * Fetch the original Vite asset.
         */
        const response = await fetch(brand.image);

        if (!response.ok) {
          throw new Error(
            `Failed to load logo for ${brand.name}.`,
          );
        }

        const blob = await response.blob();

        /*
         * Work out the file extension.
         */
        const extension =
          blob.type === "image/jpeg"
            ? "jpg"
            : blob.type === "image/webp"
              ? "webp"
              : "png";

        const safeName = brand.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        const fileName = `imported-${safeName}-${Date.now()}.${extension}`;

        /*
         * Upload logo to Supabase Storage.
         */
        const { error: uploadError } =
          await supabase.storage
            .from("brand-images")
            .upload(fileName, blob, {
              cacheControl: "3600",
              upsert: false,
              contentType: blob.type,
            });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("brand-images")
            .getPublicUrl(fileName);

        /*
         * Insert brand into database.
         */
        const { error: insertError } = await supabase
          .from("brands")
          .insert({
            name: brand.name,
            logo: publicUrlData.publicUrl,
            sort_order: nextSortOrder,
            is_active: true,
          });

        if (insertError) {
          /*
           * If database insertion fails, clean up
           * the uploaded logo.
           */
          await supabase.storage
            .from("brand-images")
            .remove([fileName]);

          throw insertError;
        }

        nextSortOrder++;
        importedCount++;
      }

      await loadBrands();

      alert(
        `Import complete.\n\nImported: ${importedCount}\nAlready existed: ${skippedCount}`,
      );
    } catch (err) {
      console.error(
        "Failed to import existing brands:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to import existing brands.",
      );
    } finally {
      setImporting(false);
    }
  };

  const saveBrand = async () => {
    if (!form.name.trim()) {
      setError("Brand name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = getSupabase();

      const existingBrand = brands.find(
        (brand) => brand.id === form.id,
      );

      const oldLogoUrl = existingBrand?.logo ?? null;
      const newLogoUrl = form.logo?.trim() || null;

      let sortOrder = form.sort_order;

      if (!existingBrand) {
        const maxSortOrder = brands.reduce(
          (max, brand) =>
            Math.max(max, brand.sort_order),
          0,
        );

        sortOrder = maxSortOrder + 1;
      }

      const brandToSave = {
        ...(form.id ? { id: form.id } : {}),
        name: form.name.trim(),
        logo: newLogoUrl,
        sort_order: sortOrder,
        is_active: form.is_active,
      };

      const { data, error } = await supabase
        .from("brands")
        .upsert(brandToSave)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (
        oldLogoUrl &&
        oldLogoUrl !== newLogoUrl
      ) {
        await deleteBrandImage(oldLogoUrl);
      }

      if (
        uploadedImageUrlRef.current &&
        uploadedImageUrlRef.current === newLogoUrl
      ) {
        uploadedImageUrlRef.current = null;
      }

      setForm({
        id: "",
        name: "",
        logo: "",
        sort_order: 0,
        is_active: true,
      });

      await loadBrands();

      console.log("Saved brand:", data);

      alert("Brand saved successfully.");
    } catch (err) {
      console.error("Failed to save brand:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save brand.",
      );
    } finally {
      setSaving(false);
    }
  };

  const editBrand = (brand: Brand) => {
    if (uploadedImageUrlRef.current) {
      void deleteBrandImage(
        uploadedImageUrlRef.current,
      );

      uploadedImageUrlRef.current = null;
    }

    setForm(brand);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const clearForm = async () => {
    if (uploadedImageUrlRef.current) {
      await deleteBrandImage(
        uploadedImageUrlRef.current,
      );

      uploadedImageUrlRef.current = null;
    }

    setForm({
      id: "",
      name: "",
      logo: "",
      sort_order: 0,
      is_active: true,
    });

    setError("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const moveBrand = async (
    brand: Brand,
    direction: "up" | "down",
  ) => {
    const currentIndex = brands.findIndex(
      (item) => item.id === brand.id,
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
      targetIndex >= brands.length
    ) {
      return;
    }

    const targetBrand = brands[targetIndex];

    setSaving(true);
    setError("");

    try {
      const supabase = getSupabase();

      const currentOrder = brand.sort_order;
      const targetOrder = targetBrand.sort_order;

      const { error: firstError } = await supabase
        .from("brands")
        .update({
          sort_order: targetOrder,
        })
        .eq("id", brand.id);

      if (firstError) {
        throw firstError;
      }

      const { error: secondError } = await supabase
        .from("brands")
        .update({
          sort_order: currentOrder,
        })
        .eq("id", targetBrand.id);

      if (secondError) {
        throw secondError;
      }

      await loadBrands();
    } catch (err) {
      console.error("Failed to reorder brands:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to reorder brands.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteBrand = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this brand?",
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = getSupabase();

      const brandToDelete = brands.find(
        (brand) => brand.id === id,
      );

      const { error } = await supabase
        .from("brands")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      if (brandToDelete?.logo) {
        await deleteBrandImage(
          brandToDelete.logo,
        );
      }

      if (form.id === id) {
        setForm({
          id: "",
          name: "",
          logo: "",
          sort_order: 0,
          is_active: true,
        });
      }

      await loadBrands();
    } catch (err) {
      console.error("Failed to delete brand:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete brand.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleBrandStatus = async (brand: Brand) => {
    setSaving(true);
    setError("");

    try {
      const supabase = getSupabase();

      const { error } = await supabase
        .from("brands")
        .update({
          is_active: !brand.is_active,
        })
        .eq("id", brand.id);

      if (error) {
        throw error;
      }

      await loadBrands();
    } catch (err) {
      console.error(
        "Failed to update brand status:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update brand status.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Brands
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/admin" })}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Dashboard
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Import Existing Brands */}
        <section className="mt-8 rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Import Existing Brands
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Import the 10 brands already present in your
                website into Supabase.
              </p>
            </div>

            <button
              type="button"
              onClick={importExistingBrands}
              disabled={importing || saving}
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {importing
                ? "Importing..."
                : "Import Existing Brands"}
            </button>
          </div>
        </section>

        {/* Add / Edit Brand */}
        <section className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">
            Add / Edit Brand
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">
                Brand Name
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Example: Bosch"
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Status
              </label>

              <select
                value={
                  form.is_active
                    ? "active"
                    : "inactive"
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_active:
                      e.target.value ===
                      "active",
                  })
                }
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="active">
                  Active — Show on website
                </option>

                <option value="inactive">
                  Inactive — Hide on website
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Brand Logo
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
                    Uploading logo...
                  </p>
                ) : null}

                {form.logo ? (
                  <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-md border border-border bg-white p-6">
                    <img
                      src={form.logo}
                      alt="Brand logo preview"
                      className="max-h-32 max-w-full object-contain"
                    />
                  </div>
                ) : null}

                <input
                  value={form.logo ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      logo: e.target.value,
                    })
                  }
                  placeholder="Or paste a logo image URL"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />

                <p className="text-xs text-muted-foreground">
                  Select a logo directly from your PC or
                  paste an image URL. Maximum file size:
                  5 MB.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={saveBrand}
              disabled={
                saving || uploadingImage || importing
              }
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Brand"}
            </button>

            <button
              type="button"
              onClick={clearForm}
              disabled={
                saving || uploadingImage || importing
              }
              className="rounded-md border border-border px-5 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </section>

        {/* Existing Brands */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Existing Brands
            </h2>

            <p className="text-sm text-muted-foreground">
              {brands.length} brands in Supabase
            </p>
          </div>

          {loading ? (
            <div className="rounded-md border border-border p-10 text-center">
              Loading brands...
            </div>
          ) : brands.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-10 text-center">
              <p className="text-muted-foreground">
                No brands found.
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Add your first brand using the form above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {brands.map((brand, index) => (
                <div
                  key={brand.id}
                  className={`rounded-lg border bg-card p-5 ${
                    brand.is_active
                      ? "border-border"
                      : "border-dashed border-muted-foreground/40 opacity-70"
                  }`}
                >
                  <div className="mb-4 flex h-40 items-center justify-center overflow-hidden rounded-md border border-border bg-white p-6">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-28 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No logo
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {brand.name}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Order: {brand.sort_order}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        brand.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {brand.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        moveBrand(brand, "up")
                      }
                      disabled={
                        saving || index === 0
                      }
                      className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↑ Up
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        moveBrand(brand, "down")
                      }
                      disabled={
                        saving ||
                        index === brands.length - 1
                      }
                      className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↓ Down
                    </button>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        editBrand(brand)
                      }
                      className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleBrandStatus(
                          brand,
                        )
                      }
                      disabled={saving}
                      className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
                    >
                      {brand.is_active
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      deleteBrand(brand.id)
                    }
                    disabled={saving}
                    className="mt-2 w-full rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
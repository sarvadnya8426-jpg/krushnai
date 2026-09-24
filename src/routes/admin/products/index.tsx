import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/products/")({
  component: AdminProducts,
});

type Product = {
  id: string;
  name: string;
  category: string | null;
  subcategory: string | null;
  type: string | null;
  application: string | null;
  description: string | null;
  specs: string[] | null;
  tags: string[] | null;
  image: string | null;
};

type ProductForm = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  type: string;
  application: string;
  description: string;
  specs: string;
  tags: string;
  image: string;
};

const emptyForm: ProductForm = {
  id: "",
  name: "",
  category: "",
  subcategory: "",
  type: "",
  application: "",
  description: "",
  specs: "",
  tags: "",
  image: "",
};

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdminAndLoadProducts();
  }, []);

  const checkAdminAndLoadProducts = async () => {
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

    await loadProducts();
  };

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await getSupabase()
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setProducts((data ?? []) as Product[]);
    setLoading(false);
  };

    const importExistingProducts = async () => {
    setSaving(true);
    setError("");

    try {
      const supabase = getSupabase();

      // Verify that the current browser session belongs to an active admin.
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

      // Import the existing catalogue from products.ts.
      const { products: existingProducts } = await import(
        "../../../data/products"
      );

      const productsToImport = existingProducts.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand ?? null,
        type: product.type,
        application: product.application,
        description: product.description,
        specs: product.specs ?? null,
        tags: product.tags ?? null,
        image: product.image,
      }));

      const { error: importError } = await supabase
        .from("products")
        .upsert(productsToImport, {
          onConflict: "id",
        });

      if (importError) {
        throw importError;
      }

      await loadProducts();
      alert(
        `Successfully imported ${productsToImport.length} products into Supabase.`
      );
    } catch (err) {
      console.error("Product import failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to import existing products."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    let parsedSpecs: Record<string, string> = {};

    if (form.specs.trim()) {
      try {
        parsedSpecs = JSON.parse(form.specs);
      } catch {
        setError(
          'Specifications must be valid JSON. Example: {"SIZE":"18 x 24","Material":"Plywood"}'
        );
        setSaving(false);
        return;
      }
    }

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const productData = {
      id: form.id.trim(),
      name: form.name.trim(),
      category: form.category.trim() || null,
      subcategory: form.subcategory.trim() || null,
      type: form.type.trim() || null,
      application: form.application.trim() || null,
      description: form.description.trim() || null,
      specs: parsedSpecs,
      tags,
      image: form.image.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (!productData.id || !productData.name) {
      setError("Product ID and Product Name are required.");
      setSaving(false);
      return;
    }

    const supabase = getSupabase();

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert(productData);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }

    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);

    await loadProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);

    setForm({
      id: product.id,
      name: product.name,
      category: product.category ?? "",
      subcategory: product.subcategory ?? "",
      type: product.type ?? "",
      application: product.application ?? "",
      description: product.description ?? "",
      specs: product.specs
        ? JSON.stringify(product.specs, null, 2)
        : "",
      tags: product.tags?.join(", ") ?? "",
      image: product.image ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const { error } = await getSupabase()
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadProducts();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
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
              Product Management
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
            Products
          </h2>

          <p className="mt-2 text-slate-500">
            Add, edit and delete products from your website.
          </p>
           <button
      type="button"
      onClick={importExistingProducts}
      disabled={saving}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {saving ? "Importing..." : "Import Existing Products"}
    </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">
              {editingId ? "Edit Product" : "Add Product"}
            </h3>

            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Product ID *
              </label>

              <input
                value={form.id}
                onChange={(event) =>
                  handleChange("id", event.target.value)
                }
                disabled={!!editingId}
                placeholder="example: mirror-rect-plain"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 disabled:bg-slate-100"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Product Name *
              </label>

              <input
                value={form.name}
                onChange={(event) =>
                  handleChange("name", event.target.value)
                }
                placeholder="Product name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>

              <input
                value={form.category}
                onChange={(event) =>
                  handleChange("category", event.target.value)
                }
                placeholder="example: plain-mirrors"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Subcategory
              </label>

              <input
                value={form.subcategory}
                onChange={(event) =>
                  handleChange("subcategory", event.target.value)
                }
                placeholder="Product subcategory"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Type
              </label>

              <input
                value={form.type}
                onChange={(event) =>
                  handleChange("type", event.target.value)
                }
                placeholder="example: Mirror"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Application
              </label>

              <input
                value={form.application}
                onChange={(event) =>
                  handleChange("application", event.target.value)
                }
                placeholder="example: Bathroom Upgrade"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                placeholder="Product description"
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Specifications (JSON)
              </label>

              <textarea
                value={form.specs}
                onChange={(event) =>
                  handleChange("specs", event.target.value)
                }
                placeholder={`{"SIZE":"18 x 24","Material":"Plywood"}`}
                rows={5}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-slate-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Example: {"{"}"SIZE":"18 x 24","Material":"Plywood"{"}"}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tags
              </label>

              <input
                value={form.tags}
                onChange={(event) =>
                  handleChange("tags", event.target.value)
                }
                placeholder="popular, new, featured"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Separate tags with commas.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Image Path / URL
              </label>

              <input
                value={form.image}
                onChange={(event) =>
                  handleChange("image", event.target.value)
                }
                placeholder="/images/products/product.jpg"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Product"
                    : "Add Product"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">
              Product List
            </h3>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {products.length} products
            </span>
          </div>

          {loading ? (
            <p className="py-10 text-center text-slate-500">
              Loading products...
            </p>
          ) : products.length === 0 ? (
            <p className="py-10 text-center text-slate-500">
              No products have been added yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Product
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Category
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Subcategory
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Type
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-14 w-14 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                              No image
                            </div>
                          )}

                          <div>
                            <p className="font-medium text-slate-900">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {product.category || "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {product.subcategory || "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {product.type || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(product.id)
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
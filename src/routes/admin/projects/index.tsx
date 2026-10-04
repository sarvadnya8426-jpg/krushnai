import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { getSupabase } from "@/lib/supabase";

type Project = {
  id: string;
  title: string;
  description: string | null;
  instagram_url: string;
  thumbnail: string | null;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ProjectForm = {
  title: string;
  description: string;
  instagram_url: string;
  thumbnail: string;
  category: string;
};

export const Route = createFileRoute("/admin/projects/")({
  component: AdminProjectsPage,
});

function AdminProjectsPage() {
  const navigate = useNavigate();
  const supabase = getSupabase();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<ProjectForm>({
    title: "",
    description: "",
    instagram_url: "",
    thumbnail: "",
    category: "",
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate({ to: "/admin/login" });
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError || !admin) {
      await supabase.auth.signOut();
      navigate({ to: "/admin/login" });
      return;
    }

    await loadProjects();
  }

  async function loadProjects() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setProjects((data || []) as Project[]);
    setLoading(false);
  }

  function clearForm() {
    setEditingId(null);

    setForm({
      title: "",
      description: "",
      instagram_url: "",
      thumbnail: "",
      category: "",
    });

    setMessage("");
    setError("");
  }

  function editProject(project: Project) {
    setEditingId(project.id);

    setForm({
      title: project.title,
      description: project.description || "",
      instagram_url: project.instagram_url,
      thumbnail: project.thumbnail || "",
      category: project.category || "",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function isInstagramUrl(url: string) {
    try {
      const parsed = new URL(url);

      return (
        parsed.hostname === "instagram.com" ||
        parsed.hostname === "www.instagram.com"
      );
    } catch {
      return false;
    }
  }

  function normalizeInstagramUrl(url: string) {
    const parsed = new URL(url.trim());

    const path = parsed.pathname.replace(/\/+/g, "/");

    const match = path.match(
      /^\/(reel|reels|p|tv)\/([^/]+)\/?/i
    );

    if (!match) {
      return url.trim();
    }

    return `https://www.instagram.com/${match[1].toLowerCase()}/${match[2]}/`;
  }

  async function saveProject() {
    setMessage("");
    setError("");

    const title = form.title.trim();
    const description = form.description.trim();
    const instagramUrl = form.instagram_url.trim();
    const thumbnail = form.thumbnail.trim();
    const category = form.category.trim();

    if (!title) {
      setError("Please enter a project title.");
      return;
    }

    if (!instagramUrl) {
      setError("Please enter an Instagram Reel URL.");
      return;
    }

    if (!isInstagramUrl(instagramUrl)) {
      setError("Please enter a valid Instagram URL.");
      return;
    }

    let normalizedUrl = instagramUrl;

    try {
      normalizedUrl = normalizeInstagramUrl(instagramUrl);
    } catch {
      setError("Please enter a valid Instagram URL.");
      return;
    }

    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("projects")
        .update({
          title,
          description: description || null,
          instagram_url: normalizedUrl,
          thumbnail: thumbnail || null,
          category: category || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setMessage("Project updated successfully.");
    } else {
      const nextSortOrder =
        projects.length > 0
          ? Math.max(...projects.map((item) => item.sort_order)) + 1
          : 0;

      const { error } = await supabase.from("projects").insert({
        title,
        description: description || null,
        instagram_url: normalizedUrl,
        thumbnail: thumbnail || null,
        category: category || null,
        sort_order: nextSortOrder,
        is_active: true,
      });

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      setMessage("Project added successfully.");
    }

    clearForm();
    await loadProjects();

    setSaving(false);
  }

  async function deleteProject(project: Project) {
    const confirmed = window.confirm(
      `Delete "${project.title}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Project deleted successfully.");

    await loadProjects();
  }

  async function toggleActive(project: Project) {
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("projects")
      .update({
        is_active: !project.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadProjects();
  }

  async function moveProject(
    project: Project,
    direction: "up" | "down"
  ) {
    const currentIndex = projects.findIndex(
      (item) => item.id === project.id
    );

    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= projects.length) {
      return;
    }

    const currentProject = projects[currentIndex];
    const targetProject = projects[targetIndex];

    const currentOrder = currentProject.sort_order;
    const targetOrder = targetProject.sort_order;

    setError("");
    setMessage("");

    const { error: firstError } = await supabase
      .from("projects")
      .update({
        sort_order: targetOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentProject.id);

    if (firstError) {
      setError(firstError.message);
      return;
    }

    const { error: secondError } = await supabase
      .from("projects")
      .update({
        sort_order: currentOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetProject.id);

    if (secondError) {
      setError(secondError.message);
      return;
    }

    await loadProjects();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-muted-foreground">
            Loading projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold tracking-tight">
              Projects
            </h1>

            <p className="mt-1 text-muted-foreground">
              Manage Instagram Reels and completed projects.
            </p>
          </div>

          <button
            type="button"
            onClick={clearForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
            <Check className="h-4 w-4" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Project" : "Add Project"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Add an Instagram Reel to display on the website.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={clearForm}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Project Title *
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                placeholder="Modern Modular Kitchen"
                className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <input
                type="text"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                placeholder="Modular Kitchen"
                className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Instagram URL */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Instagram Reel URL *
              </label>

              <input
                type="url"
                value={form.instagram_url}
                onChange={(e) =>
                  setForm({
                    ...form,
                    instagram_url: e.target.value,
                  })
                }
                placeholder="https://www.instagram.com/reel/XXXXXXXXXXX/"
                className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
              />

              <p className="mt-1.5 text-xs text-muted-foreground">
                Paste the Instagram Reel link from your Krushnai Traders
                Instagram page.
              </p>
            </div>

            {/* Thumbnail */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Thumbnail URL
                <span className="ml-1 text-muted-foreground">
                  (optional)
                </span>
              </label>

              <input
                type="url"
                value={form.thumbnail}
                onChange={(e) =>
                  setForm({
                    ...form,
                    thumbnail: e.target.value,
                  })
                }
                placeholder="https://..."
                className="w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
              />

              <p className="mt-1.5 text-xs text-muted-foreground">
                Optional image URL for the project card.
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                rows={4}
                placeholder="Complete modular kitchen project completed by Krushnai Traders."
                className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={saveProject}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Project"
                  : "Save Project"}
            </button>
          </div>
        </div>

        {/* Projects */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                All Projects
              </h2>

              <p className="text-sm text-muted-foreground">
                {projects.length} project
                {projects.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <p className="font-medium">
                No projects added yet.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add your first Instagram Reel above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="rounded-xl border bg-card p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {project.title}
                        </h3>

                        {project.category && (
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                            {project.category}
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            project.is_active
                              ? "bg-green-500/10 text-green-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {project.is_active
                            ? "Active"
                            : "Hidden"}
                        </span>
                      </div>

                      {project.description && (
                        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      )}

                      <a
                        href={project.instagram_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 block truncate text-sm text-primary hover:underline"
                      >
                        {project.instagram_url}
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          moveProject(project, "up")
                        }
                        disabled={index === 0}
                        title="Move up"
                        className="rounded-lg border p-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          moveProject(project, "down")
                        }
                        disabled={index === projects.length - 1}
                        title="Move down"
                        className="rounded-lg border p-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleActive(project)}
                        title={
                          project.is_active
                            ? "Hide project"
                            : "Show project"
                        }
                        className="rounded-lg border p-2 hover:bg-muted"
                      >
                        {project.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => editProject(project)}
                        title="Edit project"
                        className="rounded-lg border p-2 hover:bg-muted"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteProject(project)}
                        title="Delete project"
                        className="rounded-lg border p-2 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {project.instagram_url && (
                    <div className="mt-5 overflow-hidden rounded-xl border bg-muted">
                      <div className="aspect-[9/16] max-h-[520px] w-full">
                        <iframe
                          src={`${project.instagram_url.replace(/\/$/, "")}/embed`}
                          title={project.title}
                          className="h-full w-full border-0"
                          loading="lazy"
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
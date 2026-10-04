import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Instagram, Play, ExternalLink } from "lucide-react";
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
};

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, title, description, instagram_url, thumbnail, category, sort_order, is_active"
      )
      .eq("is_active", true)
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

  function getEmbedUrl(url: string) {
    return `${url.replace(/\/$/, "")}/embed`;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium">
              <Instagram className="h-4 w-4" />
              Our Projects
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Projects & Work
            </h1>

            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
              Explore our completed furniture, modular kitchen, interior,
              hardware and other projects through our latest Instagram Reels.
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-muted-foreground">
              Loading projects...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
            Unable to load projects.
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="rounded-2xl border border-dashed p-12 text-center">
            <Instagram className="mx-auto h-10 w-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Projects coming soon
            </h2>

            <p className="mt-2 text-muted-foreground">
              We are adding our latest completed projects here.
            </p>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Instagram Reel */}
                <div className="bg-muted">
                  <div className="aspect-[9/16] w-full">
                    <iframe
                      src={getEmbedUrl(project.instagram_url)}
                      title={project.title}
                      className="h-full w-full border-0"
                      loading="lazy"
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Project information */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {project.category && (
                        <span className="mb-2 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium">
                          {project.category}
                        </span>
                      )}

                      <h2 className="text-xl font-semibold">
                        {project.title}
                      </h2>
                    </div>

                    <Instagram className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>

                  {project.description && (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {project.description}
                    </p>
                  )}

                  <a
                    href={project.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    View on Instagram
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
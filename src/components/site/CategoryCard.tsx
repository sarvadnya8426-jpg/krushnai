import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/data/categories";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="group relative overflow-hidden rounded-md border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={category.image}
          alt={`${category.name} at Krushnai Traders`}
          loading="lazy"
          width={900}
          height={700}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg">{category.name}</h3>
        <p className="mt-2  text-sm text-muted-foreground">{category.description}</p>
        <Link
          to="/products"
          search={{ category: category.slug }}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-accent"
        >
          Explore Category
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

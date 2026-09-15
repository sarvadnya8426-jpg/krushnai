export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Tag className="mt-3 text-3xl leading-tight text-balance sm:text-4xl">{title}</Tag>
      {subtitle ? <p className="mt-4 text-base text-muted-foreground">{subtitle}</p> : null}
      <span
        className={`mt-6 block h-px w-16 bg-accent ${align === "center" ? "mx-auto" : ""}`}
        aria-hidden
      />
    </div>
  );
}

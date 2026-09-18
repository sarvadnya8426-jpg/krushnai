import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/site/SectionHeading";
import { site, whatsappLink } from "@/config/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact ${site.name} | Enquiries, Quotes & Showroom Address` },
      {
        name: "description",
        content:
          "Contact Krushnai Traders for plywood, hardware, bathroom accessories, door fittings and power tools. Call, WhatsApp, email or send an enquiry for a quotation.",
      },
      { property: "og:title", content: `Contact ${site.name}` },
      { property: "og:description", content: "Phone, WhatsApp, email and showroom address for enquiries." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email address").max(255).or(z.literal("")),
  requirement: z.string().trim().min(2, "Tell us what you need").max(120),
  message: z.string().trim().max(800).optional(),
});

function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      requirement: String(form.get("requirement") ?? ""),
      message: String(form.get("message") ?? ""),
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
        setErrors({});

    const lines = [
      `New Enquiry from Website`,
      `Name: ${parsed.data.name}`,
      `Phone: ${parsed.data.phone}`,
      parsed.data.email ? `Email: ${parsed.data.email}` : null,
      `Requirement: ${parsed.data.requirement}`,
      parsed.data.message ? `Message: ${parsed.data.message}` : null,
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${site.whatsapp}?text=${text}`, "_blank", "noopener,noreferrer");

    setSent(true);
    event.currentTarget.reset();
  };

  return (
    <>
      <section className="bg-walnut-deep py-16 text-primary-foreground lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">Talk to Our Team</h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/75">
            Visit the showroom, call us, or send your requirement — we will respond with product options and
            pricing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeading align="left" eyebrow="Reach Us" title="Shop  & Contact Details" />
            <ul className="mt-8 space-y-6">
              <Detail icon={MapPin} title="Address">
                {site.address.line1}
                <br />
                {site.address.line2}
                <br />
                {site.address.state} – {site.address.pincode}

              </Detail>
              <Detail icon={Phone} title="Phone">
                {site.phones.map((p) => (
                  <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="block hover:text-accent">
                    {p}
                  </a>
                ))}
              </Detail>
              <Detail icon={MessageCircle} title="WhatsApp">
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  Send a WhatsApp enquiry
                </a>
              </Detail>
              <Detail icon={Mail} title="Email">
                <a href={`mailto:${site.email}`} className="hover:text-accent">
                  {site.email}
                </a>
              </Detail>
              <Detail icon={Clock} title="Business Hours">
                {site.hours.map((h) => (
                  <span key={h.days} className="block">
                    {h.days}: {h.time}
                  </span>
                ))}
              </Detail>
            </ul>

            <div className="mt-10 overflow-hidden rounded-md border border-border">
              {site.mapEmbedUrl ? (
                <iframe
                  src={site.mapEmbedUrl}
                  title={`${site.name} location map`}
                  className="h-72 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="grid h-72 place-items-center bg-secondary/60 px-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    https://maps.app.goo.gl/FjoXnb7ZhrMsjniW7
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-6 shadow-soft sm:p-8">
            {sent ? (
              <div className="py-16 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-accent" aria-hidden />
                <h2 className="mt-4 text-xl">Thank you!</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your enquiry has been received. Our team will contact you shortly.
                </p>
                <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>
                  Send another enquiry
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl">Send an Enquiry</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill in your details and requirement and we will get back to you.
                </p>
                <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="name" label="Name" error={errors["name"]}>
                      <Input id="name" name="name" placeholder="Your full name" />
                    </Field>
                    <Field id="phone" label="Phone" error={errors["phone"]}>
                      <Input id="phone" name="phone" type="tel" placeholder="Mobile number" />
                    </Field>
                  </div>
                  <Field id="email" label="Email (optional)" error={errors["email"]}>
                    <Input id="email" name="email" type="email" placeholder="you@example.com" />
                  </Field>
                  <Field id="requirement" label="Product / Requirement" error={errors["requirement"]}>
                    <Input id="requirement" name="requirement" placeholder="e.g. Kitchen baskets & hinges" />
                  </Field>
                  <Field id="message" label="Message" error={errors["message"]}>
                    <Textarea id="message" name="message" rows={5} placeholder="Sizes, quantity, site location…" />
                  </Field>
                  <Button type="submit" size="lg" className="w-full">
                    Send Enquiry
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Detail({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-accent/15 text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h3 className="text-sm tracking-[0.14em] uppercase">{title}</h3>
        <div className="mt-1.5 text-sm text-muted-foreground">{children}</div>
      </div>
    </li>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

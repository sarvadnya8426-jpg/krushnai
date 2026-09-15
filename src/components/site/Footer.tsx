import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { site, whatsappLink } from "@/config/site";
import { Logo } from "./Logo";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/solutions", label: "Solutions" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

const categoryLinks = [
  "Plywood",
  "Furniture Hardware",
  "Bathroom Accessories",
  "LED Mirrors",
  "Door Hardware",
  "Power Tools",
];

export function Footer() {
  return (
    <footer className="bg-walnut-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Logo className="h-11 w-11" />
            <span className="font-display text-xl font-semibold">{site.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/70">{site.description}</p>
          <div className="mt-5 flex gap-3">
            <SocialLink href={site.social.facebook} label="Facebook">
              <Facebook className="h-4 w-4" />
            </SocialLink>
            <SocialLink href={site.social.instagram} label="Instagram">
              <Instagram className="h-4 w-4" />
            </SocialLink>
            <SocialLink href={site.social.youtube} label="YouTube">
              <Youtube className="h-4 w-4" />
            </SocialLink>
          </div>
        </div>

        <div>
          <h3 className="text-sm tracking-[0.2em] text-accent uppercase">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-primary-foreground/75 transition-colors hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm tracking-[0.2em] text-accent uppercase">Product Categories</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categoryLinks.map((c) => (
              <li key={c}>
                <Link to="/products" className="text-primary-foreground/75 transition-colors hover:text-accent">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm tracking-[0.2em] text-accent uppercase">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                {site.address.line1}, {site.address.line2}
                <br />
                {site.address.state} – {site.address.pincode}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span className="flex flex-col gap-1">
                {site.phones.map((p) => (
                  <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-accent">
                    {p}
                  </a>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                WhatsApp Enquiry
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="h-4 w-4 shrink-0 text-accent" />
              <a href={`mailto:${site.email}`} className="hover:text-accent">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-primary-foreground/60 sm:px-6">
          © 2026 {site.legalName}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-primary-foreground/20 transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </a>
  );
}

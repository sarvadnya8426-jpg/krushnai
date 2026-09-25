import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { site } from "@/config/site";
import { Logo } from "./Logo";
import { useEffect, useState } from "react";
import {
  getWebsiteSettings,
  type WebsiteSettings,
} from "@/lib/siteSettings";

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
  const [websiteSettings, setWebsiteSettings] =
    useState<WebsiteSettings | null>(null);

  useEffect(() => {
    const loadWebsiteSettings = async () => {
      const data = await getWebsiteSettings();
      setWebsiteSettings(data);
    };

    loadWebsiteSettings();
  }, []);

  const businessName =
    websiteSettings?.business_name || site.name;

  const description =
    websiteSettings?.description || site.description;

  const whatsappNumber = (
    websiteSettings?.whatsapp || site.whatsapp
  ).replace(/\D/g, "");

  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  const email =
    websiteSettings?.email || site.email;

  const phoneNumbers = [
    websiteSettings?.phone1 || site.phones[0],
    websiteSettings?.phone2 || site.phones[1],
  ].filter(Boolean);

  const address1 =
    websiteSettings?.address1 || site.address.line1;

  const address2 =
    websiteSettings?.address2 || site.address.line2;

  const city =
    websiteSettings?.city || site.address.city;

  const state =
    websiteSettings?.state || site.address.state;

  const pincode =
    websiteSettings?.pincode || site.address.pincode;

  const facebook =
    websiteSettings?.facebook || site.social.facebook;

  const instagram =
    websiteSettings?.instagram || site.social.instagram;

  return (
    <footer className="bg-walnut-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Logo className="h-11 w-11" />

            <span className="font-display text-xl font-semibold">
              {businessName}
            </span>
          </div>

          <p className="mt-4 max-w-xs text-sm text-primary-foreground/70">
            {description}
          </p>

          <div className="mt-5 flex gap-3">
            <SocialLink
              href={facebook}
              label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </SocialLink>

            <SocialLink
              href={instagram}
              label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </SocialLink>

            <SocialLink
              href={site.social.youtube}
              label="YouTube"
            >
              <Youtube className="h-4 w-4" />
            </SocialLink>
          </div>
        </div>

        <div>
          <h3 className="text-sm tracking-[0.2em] text-accent uppercase">
            Quick Links
          </h3>

          <ul className="mt-4 space-y-2.5 text-sm">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-primary-foreground/75 transition-colors hover:text-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm tracking-[0.2em] text-accent uppercase">
            Product Categories
          </h3>

          <ul className="mt-4 space-y-2.5 text-sm">
            {categoryLinks.map((c) => (
              <li key={c}>
                <Link
                  to="/products"
                  className="text-primary-foreground/75 transition-colors hover:text-accent"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm tracking-[0.2em] text-accent uppercase">
            Contact
          </h3>

          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />

              <span>
                {address1}, {address2}
                <br />
                {city}, {state} – {pincode}
              </span>
            </li>

            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />

              <span className="flex flex-col gap-1">
                {phoneNumbers.map((p) => (
                  <a
                    key={p}
                    href={`tel:${p.replace(/\s/g, "")}`}
                    className="hover:text-accent"
                  >
                    {p}
                  </a>
                ))}
              </span>
            </li>

            <li className="flex gap-3">
              <MessageCircle className="h-4 w-4 shrink-0 text-accent" />

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                WhatsApp Enquiry
              </a>
            </li>

            <li className="flex gap-3">
              <Mail className="h-4 w-4 shrink-0 text-accent" />

              <a
                href={`mailto:${email}`}
                className="hover:text-accent"
              >
                {email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-primary-foreground/60 sm:px-6">
          © 2026{" "}
          {websiteSettings?.legal_name || site.legalName}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
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
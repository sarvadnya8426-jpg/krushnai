import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { useQuote } from "./QuoteProvider";
import { Logo } from "./Logo";
import {
  getWebsiteSettings,
  type WebsiteSettings,
} from "@/lib/siteSettings";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/solutions", label: "Solutions" },
  { to: "/brands", label: "Brands" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [websiteSettings, setWebsiteSettings] =
    useState<WebsiteSettings | null>(null);

  const { openQuote } = useQuote();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const loadWebsiteSettings = async () => {
      const data = await getWebsiteSettings();
      setWebsiteSettings(data);
    };

    loadWebsiteSettings();
  }, []);

  const businessName =
    websiteSettings?.business_name || site.name;

  const phone =
    websiteSettings?.phone1 || site.phone;

  const phoneNumber = phone.replace(/\s/g, "");

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-border bg-background/95 shadow-soft backdrop-blur"
          : "border-transparent bg-background"
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:py-4">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Logo className="h-20 w-20 shrink-0" />

          <span className="min-w-0">
            <span className="block truncate font-display text-lg leading-tight font-semibold sm:text-xl">
              {businessName}
            </span>

            <span className="hidden text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase sm:block">
              Plywood • Hardware • Interiors
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                activeProps={{
                  className: "text-foreground after:w-full",
                }}
                inactiveProps={{
                  className: "text-muted-foreground",
                }}
                className="relative px-3 py-2 text-sm font-medium transition-colors after:absolute after:bottom-1 after:left-3 after:h-px after:w-0 after:bg-accent after:transition-all after:duration-300 hover:text-foreground hover:after:w-[calc(100%-1.5rem)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden sm:inline-flex"
            aria-label="Call us"
          >
            <a href={`tel:${phoneNumber}`}>
              <Phone className="h-4 w-4" />
            </a>
          </Button>

          <Button
            className="ml-1 hidden sm:inline-flex"
            onClick={() => openQuote()}
          >
            Get a Quote
          </Button>

          <button
            type="button"
            className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-md border border-border lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background px-4 pb-5 lg:hidden">
          <ul className="divide-y divide-border">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: link.to === "/" }}
                  activeProps={{ className: "text-accent" }}
                  className="block py-3 text-base font-medium"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Button
            className="mt-4 w-full"
            size="lg"
            onClick={() => {
              setOpen(false);
              openQuote();
            }}
          >
            Get a Quote
          </Button>
        </nav>
      ) : null}
    </header>
  );
}
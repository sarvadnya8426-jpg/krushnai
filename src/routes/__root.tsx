import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { QuoteProvider } from "@/components/site/QuoteProvider";
import { site } from "@/config/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);
  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back
          home.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route =
  createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: `${site.name} | Plywood, Hardware, Bathroom Accessories & Power Tools`,
        },
        {
          name: "description",
          content: site.description,
        },
        {
          name: "author",
          content: site.name,
        },
        {
          name: "keywords",
          content:
            "plywood shop, plywood dealer, furniture hardware, hardware shop, laminates, MDF board, HDHMR board, furniture fittings, modular kitchen accessories, wardrobe fittings, bathroom accessories, LED bathroom mirrors, door hardware, door lock kits, power tools, hand drill, angle grinder, furniture materials",
        },
        {
          property: "og:site_name",
          content: site.name,
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
      ],

      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Karla:wght@400;500;600;700&display=swap",
        },
        {
          rel: "icon",
          href: "/Favicon1.ico",
          type: "image/x-icon",
        },
      ],

      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HardwareStore",
            name: site.name,
            description: site.description,
            telephone: site.phone,
            email: site.email,
            address: {
              "@type": "PostalAddress",
              streetAddress: site.address.line1,
              addressLocality: site.address.line2,
              addressRegion: site.address.state,
              postalCode: site.address.pincode,
              addressCountry: "IN",
            },
          }),
        },
      ],
    }),

    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  });

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />

        {/* Splash screen styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes krushnaiSplashLogo {
                0% {
                  opacity: 0;
                  transform: scale(0.75);
                }

                60% {
                  opacity: 1;
                  transform: scale(1.04);
                }

                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              @keyframes krushnaiSplashText {
                0% {
                  opacity: 0;
                  transform: translateY(18px);
                }

                100% {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              @keyframes krushnaiSplashLine {
                0% {
                  width: 0;
                  opacity: 0;
                }

                100% {
                  width: 64px;
                  opacity: 1;
                }
              }

              @keyframes krushnaiSplashDot {
                0%,
                100% {
                  opacity: 0.25;
                  transform: scale(0.8);
                }

                50% {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              @keyframes krushnaiSplashHide {
                0% {
                  opacity: 1;
                  visibility: visible;
                }

                100% {
                  opacity: 0;
                  visibility: hidden;
                  pointer-events: none;
                }
              }

              #krushnai-splash {
                position: fixed;
                inset: 0;
                z-index: 999999;

                display: flex;
                align-items: center;
                justify-content: center;

                overflow: hidden;

                background: #1b1009;
              }

              #krushnai-splash.krushnai-splash-hide {
                animation: krushnaiSplashHide 0.6s ease forwards;
              }

              .krushnai-splash-seen #krushnai-splash {
                display: none !important;
              }

              #krushnai-splash .splash-glow {
                position: absolute;

                left: 50%;
                top: 50%;

                width: 420px;
                height: 420px;

                transform: translate(-50%, -50%);

                border-radius: 9999px;

                background: rgba(196, 154, 99, 0.10);

                filter: blur(70px);
              }

              #krushnai-splash .splash-content {
                position: relative;
                z-index: 2;

                display: flex;
                flex-direction: column;
                align-items: center;

                padding: 24px;

                text-align: center;
              }

              /* Actual Krushnai Traders logo */
              #krushnai-splash .splash-logo {
                display: flex;
                align-items: center;
                justify-content: center;

                width: 150px;
                height: 150px;

                opacity: 0;

                animation:
                  krushnaiSplashLogo
                  0.9s
                  ease-out
                  0.05s
                  forwards;
              }

              #krushnai-splash .splash-logo-image {
                display: block;

                width: 150px;
                height: 150px;

                object-fit: contain;
              }

              #krushnai-splash .splash-title {
                margin-top: 28px;

                color: #f3e5ce;

                font-family:
                  Georgia,
                  "Times New Roman",
                  serif;

                font-size: 38px;

                font-weight: 600;

                letter-spacing: 0.03em;

                opacity: 0;

                animation:
                  krushnaiSplashText
                  0.7s
                  ease-out
                  0.5s
                  forwards;
              }

              #krushnai-splash .splash-line {
                height: 1px;

                width: 0;

                margin-top: 20px;

                background: #c9a66d;

                opacity: 0;

                animation:
                  krushnaiSplashLine
                  0.6s
                  ease-out
                  0.9s
                  forwards;
              }

              #krushnai-splash .splash-subtitle {
                margin-top: 16px;

                color: #cdb58f;

                font-family: Arial, sans-serif;

                font-size: 11px;

                font-weight: 600;

                letter-spacing: 0.35em;

                text-transform: uppercase;

                opacity: 0;

                animation:
                  krushnaiSplashText
                  0.6s
                  ease-out
                  1s
                  forwards;
              }

              #krushnai-splash .splash-tagline {
                max-width: 500px;

                margin-top: 28px;

                color: #d8c8b0;

                font-family: Arial, sans-serif;

                font-size: 16px;

                line-height: 1.6;

                opacity: 0;

                animation:
                  krushnaiSplashText
                  0.6s
                  ease-out
                  1.15s
                  forwards;
              }

              #krushnai-splash .splash-dots {
                position: absolute;

                bottom: 40px;
                left: 50%;

                display: flex;

                gap: 8px;

                transform: translateX(-50%);
              }

              #krushnai-splash .splash-dot {
                width: 6px;
                height: 6px;

                border-radius: 9999px;

                background: #d8b47a;

                animation:
                  krushnaiSplashDot
                  0.9s
                  ease-in-out
                  infinite;
              }

              #krushnai-splash .splash-dot:nth-child(2) {
                animation-delay: 0.15s;
              }

              #krushnai-splash .splash-dot:nth-child(3) {
                animation-delay: 0.3s;
              }

              @media (max-width: 640px) {
                #krushnai-splash .splash-logo {
                  width: 125px;
                  height: 125px;
                }

                #krushnai-splash .splash-logo-image {
                  width: 125px;
                  height: 125px;
                }

                #krushnai-splash .splash-title {
                  margin-top: 24px;
                  font-size: 30px;
                }

                #krushnai-splash .splash-subtitle {
                  font-size: 9px;
                  letter-spacing: 0.25em;
                }

                #krushnai-splash .splash-tagline {
                  max-width: 290px;
                  font-size: 14px;
                }

                #krushnai-splash .splash-dots {
                  bottom: 30px;
                }
              }

              @media (prefers-reduced-motion: reduce) {
                #krushnai-splash .splash-logo,
                #krushnai-splash .splash-title,
                #krushnai-splash .splash-line,
                #krushnai-splash .splash-subtitle,
                #krushnai-splash .splash-tagline {
                  animation: none;
                  opacity: 1;
                  transform: none;
                }
              }
            `,
          }}
        />

        {/* Prevent splash from appearing again during the same browser session */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  if (
                    sessionStorage.getItem("krushnai-splash-shown") === "true"
                  ) {
                    document.documentElement.classList.add(
                      "krushnai-splash-seen"
                    );
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>

      <body>
        {/* Immediate splash screen */}
        <div id="krushnai-splash" aria-label="Krushnai Traders">
          <div className="splash-glow" />

          <div className="splash-content">
            <div className="splash-logo">
              <img
                src="/images/krushnai-logo-transparent.png"
                alt="Krushnai Traders"
                className="splash-logo-image"
              />
            </div>

            <div className="splash-title">
              Krushnai Traders
            </div>

            <div className="splash-line" />

            <div className="splash-subtitle">
              Plywood • Hardware • Interiors
            </div>

            <div className="splash-tagline">
              Everything You Need to Build, Furnish & Finish.
            </div>
          </div>

          <div className="splash-dots">
            <span className="splash-dot" />
            <span className="splash-dot" />
            <span className="splash-dot" />
          </div>
        </div>

        {children}

        <Scripts />

        {/* Remove splash after 4 seconds */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  if (
                    sessionStorage.getItem("krushnai-splash-shown") === "true"
                  ) {
                    return;
                  }

                  window.setTimeout(function () {
                    var splash =
                      document.getElementById("krushnai-splash");

                    if (!splash) return;

                    splash.classList.add("krushnai-splash-hide");

                    sessionStorage.setItem(
                      "krushnai-splash-shown",
                      "true"
                    );

                    window.setTimeout(function () {
                      if (splash && splash.parentNode) {
                        splash.parentNode.removeChild(splash);
                      }
                    }, 600);
                  }, 4000);
                } catch (e) {}
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <QuoteProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />

          <main className="flex-1">
            <Outlet />
          </main>

          <Footer />
          <WhatsAppButton />
        </div>

        <Analytics />
      </QuoteProvider>
    </QueryClientProvider>
  );
}
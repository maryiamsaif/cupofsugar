import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 font-body">
      <div className="max-w-md text-center">
        <p className="font-hand text-2xl text-cta-red">off recipe</p>
        <h1 className="mt-1 font-display text-6xl font-normal text-neutral-950">404</h1>
        <p className="mt-2 text-sm text-neutral-600">
          That page isn't in this cookbook. Let's flip back to the front.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-cta-red px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to the recipe
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 font-body">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-normal text-neutral-950">
          The dough didn't rise.
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Something went wrong on our end. Try again — your recipe is saved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-cta-red px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900"
          >
            Back to the recipe
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cup of Sugar — A recipe for turning your kitchen into a business" },
      {
        name: "description",
        content:
          "A warm mentor-baker AI walks Chicago home bakers through the recipe: eligibility, certification, and a properly submitted CDPH cottage food application — one ingredient at a time.",
      },
      { name: "author", content: "Cup of Sugar" },
      { property: "og:title", content: "Cup of Sugar — A recipe for turning your kitchen into a business" },
      {
        property: "og:description",
        content:
          "Passion into a paycheck, one step at a time. A recipe-card guide to Chicago's cottage food registration.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Public+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Caveat:wght@500;700&display=swap",
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
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

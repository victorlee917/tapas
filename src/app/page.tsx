type App = {
  name: string;
  description: string;
  href: string;
  /** Path to an icon under /public (e.g. "/icons/myapp.png"). Optional. */
  icon?: string;
};

// Add your apps / services here.
const apps: App[] = [
  {
    name: "Scenes",
    description: "Our story, scene by scene.",
    href: "https://scenes.id/",
    icon: "/icons/scenes.png",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-28 text-center">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Tapas
        </h1>
        <p className="mt-6 max-w-xl text-lg text-foreground/60">
          A short one-line introduction to your service goes here. This is a
          simple official page with company information and an app overview.
        </p>
        <div className="mt-10 flex gap-3">
          <a
            href="#apps"
            className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Our Apps
          </a>
          <a
            href="#contact"
            className="rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
          >
            Contact
          </a>
        </div>
      </section>

      {/* Apps */}
      <section id="apps" className="border-t border-foreground/10 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight">Our Apps</h2>
          <p className="mt-3 text-foreground/60">
            Apps and services we have published.
          </p>

          <ul className="mt-8 flex flex-col gap-4">
            {apps.map((app) => (
              <li
                key={app.name}
                className="flex items-center gap-4 rounded-2xl border border-foreground/10 p-5 transition-colors hover:bg-foreground/[0.03]"
              >
                {/* Icon */}
                {app.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={app.icon}
                    alt={`${app.name} icon`}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-foreground/10 text-xl font-semibold">
                    {app.name.charAt(0)}
                  </div>
                )}

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">{app.name}</h3>
                  <p className="mt-0.5 truncate text-sm text-foreground/60">
                    {app.description}
                  </p>
                </div>

                {/* Button */}
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full border border-foreground/15 px-5 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-foreground/10 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
          <p className="mt-4 leading-relaxed text-foreground/70">
            For any inquiries, please reach out to us at{" "}
            <a className="underline" href="mailto:tapas.maker@gmail.com">
              tapas.maker@gmail.com
            </a>
            .
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-foreground/10 px-6 py-10 text-sm text-foreground/40">
        <div className="mx-auto max-w-3xl space-y-1">
          <p>Tapas</p>
          <p>Business Registration No. 460-19-02707</p>
          <p>Mail-Order Sales Registration No. 2026-Seoul Songpa-1657</p>
          <p>
            Email:{" "}
            <a className="underline" href="mailto:tapas.maker@gmail.com">
              tapas.maker@gmail.com
            </a>
          </p>
          <p className="pt-3">© 2026 Tapas. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

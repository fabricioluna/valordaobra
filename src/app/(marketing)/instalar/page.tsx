import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { InstallStatus } from "@/features/install/components/install-status";
import { installCopy } from "@/features/install/copy";
import { SiteFooter } from "@/features/marketing/components/site-footer";
import { AFTER_LOGIN_PATH } from "@/lib/auth/paths";

const copy = installCopy.page;

export const metadata: Metadata = { title: copy.metaTitle };

/**
 * Passo a passo para pôr o app na tela inicial (iPhone e Android). Pública:
 * o lembrete da área logada, Configurações e o guia em PDF apontam para cá.
 */
export default function InstallPage() {
  const platforms = [copy.iphone, copy.android];
  return (
    <>
      <header className="bg-brand-navy px-4 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-10 text-brand-white sm:px-10">
        <div className="mx-auto max-w-3xl">
          <Link href="/" aria-label={installCopy.page.back}>
            <BrandMark iconSize={32} />
          </Link>
          <h1 className="mt-10 text-3xl heading sm:text-4xl">{copy.title}</h1>
          <p className="mt-3 text-lg text-brand-white/80">{copy.intro}</p>
        </div>
      </header>
      <main className="flex-1 bg-background px-4 py-10 sm:px-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 text-base leading-relaxed">
          <InstallStatus />

          <nav aria-label={copy.jump} className="flex flex-wrap gap-2">
            <span className="self-center text-muted-foreground">
              {copy.jump}
            </span>
            {platforms.map((platform) => (
              <a
                key={platform.id}
                href={`#${platform.id}`}
                className="inline-flex min-h-11 items-center rounded-lg border bg-card px-4 font-semibold"
              >
                {platform.title}
              </a>
            ))}
          </nav>

          {platforms.map((platform) => (
            <section
              key={platform.id}
              id={platform.id}
              aria-labelledby={`${platform.id}-title`}
              className="flex scroll-mt-6 flex-col gap-4"
            >
              <h2 id={`${platform.id}-title`} className="text-2xl heading">
                {platform.title}
              </h2>
              <ol className="flex flex-col gap-3">
                {platform.steps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span
                      aria-hidden
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-navy font-bold text-brand-white"
                    >
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="rounded-2xl border bg-card p-4 text-graphite dark:text-brand-white/80">
                {platform.tip}
              </p>
            </section>
          ))}

          <section className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
            <h2 className="font-bold">{copy.inAppBrowser.title}</h2>
            <p className="text-graphite dark:text-brand-white/80">
              {copy.inAppBrowser.text}
            </p>
          </section>

          <Link
            href={AFTER_LOGIN_PATH}
            className="inline-flex min-h-11 items-center self-start font-semibold underline underline-offset-4"
          >
            {copy.back}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

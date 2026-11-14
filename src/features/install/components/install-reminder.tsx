"use client";

import { Smartphone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { Button, buttonVariants } from "@/components/ui/button";

import {
  promptInstall,
  readReminderState,
  reminderView,
  subscribeInstall,
  writeReminderState,
} from "../browser";
import { INSTALL_PATH, installCopy } from "../copy";
import { snoozeReminder, stopReminder } from "../rules";

const copy = installCopy.reminder;

/**
 * Lembrete no topo da área logada para pôr o app na tela inicial do celular.
 * Só no celular, fora do app instalado e fora dos formulários; volta de vez
 * em quando ("Agora não") até a pessoa instalar ou pedir para não mostrar.
 * No servidor e na primeira pintura fica escondido: o estado mora no aparelho.
 */
export function InstallReminder() {
  const pathname = usePathname();
  const view = useSyncExternalStore(
    subscribeInstall,
    () => reminderView(pathname),
    () => "hidden" as const,
  );
  if (view === "hidden") return null;

  function update(change: typeof snoozeReminder | typeof stopReminder) {
    const state = readReminderState();
    if (state) writeReminderState(change(state, Date.now()));
  }

  async function install() {
    const outcome = await promptInstall();
    // Instalou: o evento "appinstalled" desliga o lembrete. Recusou na
    // janela do Chrome: conta como "Agora não".
    if (outcome === "dismissed") update(snoozeReminder);
  }

  const guideHref = `${INSTALL_PATH}#${
    view === "android"
      ? installCopy.page.android.id
      : installCopy.page.iphone.id
  }`;

  return (
    <section
      aria-labelledby="install-reminder-title"
      className="mb-6 rounded-2xl border bg-card p-4 print:hidden"
    >
      <div className="flex items-start gap-3">
        <Smartphone
          className="mt-0.5 size-6 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="flex flex-col gap-1">
          <h2 id="install-reminder-title" className="font-semibold">
            {copy.title}
          </h2>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {view === "prompt" ? (
          <Button type="button" onClick={install}>
            {copy.install}
          </Button>
        ) : (
          <Link href={guideHref} className={buttonVariants()}>
            {copy.howTo}
          </Link>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => update(snoozeReminder)}
        >
          {copy.later}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground underline underline-offset-4"
          onClick={() => update(stopReminder)}
        >
          {copy.never}
        </Button>
      </div>
    </section>
  );
}

"use client";

import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

import {
  canPromptInstall,
  isStandalone,
  promptInstall,
  subscribeInstall,
} from "../browser";
import { installCopy } from "../copy";

const copy = installCopy.page;

type Status = "unknown" | "installed" | "prompt";

function currentStatus(): Status {
  if (isStandalone()) return "installed";
  if (canPromptInstall()) return "prompt";
  return "unknown";
}

/**
 * No alto do tutorial: avisa quem já abriu pelo app instalado e, no Android
 * em que o Chrome deixa, oferece instalar com um toque.
 */
export function InstallStatus() {
  const status = useSyncExternalStore(
    subscribeInstall,
    currentStatus,
    () => "unknown" as const,
  );

  if (status === "installed") {
    return (
      <p
        role="status"
        className="rounded-2xl border border-status-ok/40 bg-status-ok-soft p-4 font-medium text-status-ok"
      >
        {copy.installed}
      </p>
    );
  }
  if (status === "prompt") {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border bg-card p-4">
        <p>{copy.installNowHint}</p>
        <Button type="button" size="lg" onClick={() => void promptInstall()}>
          {copy.installNow}
        </Button>
      </div>
    );
  }
  return null;
}

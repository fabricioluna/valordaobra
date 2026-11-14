"use client";

import { useEffect } from "react";

import { startInstallCapture } from "@/features/install/browser";

/**
 * Registra o service worker (tela de "sem conexão"; só em produção) e começa
 * a ouvir o convite de instalação do Chrome, em qualquer página.
 */
export function ServiceWorker() {
  useEffect(() => {
    startInstallCapture();
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Sem service worker o app funciona igual; só perde a tela offline.
      });
  }, []);
  return null;
}

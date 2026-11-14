/**
 * O lado do navegador do "instalar o app": guarda o convite de instalação do
 * Chrome (beforeinstallprompt), sabe se o app já abriu instalado e lê e grava
 * o estado do lembrete no aparelho. Só roda no navegador.
 */
import {
  detectPlatform,
  isFormPath,
  isReminderDue,
  parseReminderState,
  type Platform,
  type ReminderState,
  stopReminder,
} from "./rules";

type InstallChoice = { outcome: "accepted" | "dismissed" };
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

const STORAGE_KEY = "vdo:lembrete-instalar";

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let started = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/**
 * Começa a ouvir o navegador. Chamado uma vez no layout raiz, para não perder
 * o convite do Chrome, que pode chegar antes de o lembrete aparecer.
 */
export function startInstallCapture() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    // Segura o convite para o botão "Instalar agora" usar depois.
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    const state = readReminderState();
    if (state) writeReminderState(stopReminder(state));
    emit();
  });
}

export function subscribeInstall(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function canPromptInstall(): boolean {
  return deferredPrompt !== null;
}

/** Abre a janela de instalação do Chrome. */
export async function promptInstall(): Promise<
  InstallChoice["outcome"] | "unavailable"
> {
  const event = deferredPrompt;
  if (!event) return "unavailable";
  // O convite só vale uma vez.
  deferredPrompt = null;
  emit();
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    return outcome;
  } catch {
    return "unavailable";
  }
}

/** O app abriu pelo ícone da tela inicial (já instalado). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone = (navigator as Navigator & { standalone?: boolean })
    .standalone;
  return (
    iosStandalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches === true
  );
}

export function currentPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  return detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
}

/** Nulo quando o aparelho não deixa guardar (aba anônima, bloqueio). */
export function readReminderState(): ReminderState | null {
  try {
    return parseReminderState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeReminderState(state: ReminderState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sem onde guardar: o lembrete some nesta página e não volta, porque
    // sem armazenamento ele nem aparece (readReminderState devolve nulo).
  }
  emit();
}

export type ReminderView = "hidden" | "prompt" | "ios" | "android";

/**
 * O que o lembrete mostra agora. Some no computador, no app já instalado,
 * nos formulários, sem armazenamento (não daria para obedecer o "Não mostrar
 * mais") e antes da hora marcada.
 */
export function reminderView(pathname: string, now = Date.now()): ReminderView {
  const platform = currentPlatform();
  if (platform === "other" || isStandalone() || isFormPath(pathname)) {
    return "hidden";
  }
  const state = readReminderState();
  if (!state || !isReminderDue(state, now)) return "hidden";
  if (canPromptInstall()) return "prompt";
  return platform;
}

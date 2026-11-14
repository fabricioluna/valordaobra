/**
 * Regras do lembrete "coloque o app na tela inicial". Puras, sem navegador,
 * para testar. O estado fica no aparelho (instalar é coisa de cada celular).
 */

export type Platform = "ios" | "android" | "other";

/** iPhone, iPad (o iPadOS se apresenta como Mac, mas tem toque) ou Android. */
export function detectPlatform(
  userAgent: string,
  maxTouchPoints = 0,
): Platform {
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  if (/macintosh/i.test(userAgent) && maxTouchPoints > 1) return "ios";
  if (/android/i.test(userAgent)) return "android";
  return "other";
}

export type ReminderState = {
  /** "Não mostrar mais" ou o app já foi instalado. */
  never: boolean;
  /** Quantas vezes a pessoa tocou em "Agora não". */
  dismissals: number;
  /** Quando o lembrete pode voltar (ms desde 1970); nulo = já pode. */
  nextAt: number | null;
};

export const EMPTY_REMINDER: ReminderState = {
  never: false,
  dismissals: 0,
  nextAt: null,
};

/** Cada "Agora não" adia mais: 3, 7, 14 e depois 30 dias. */
export const SNOOZE_DAYS = [3, 7, 14, 30] as const;
const DAY_MS = 86_400_000;

export function parseReminderState(raw: string | null): ReminderState {
  if (!raw) return EMPTY_REMINDER;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return EMPTY_REMINDER;
    const { never, dismissals, nextAt } = value as Record<string, unknown>;
    return {
      never: never === true,
      dismissals:
        typeof dismissals === "number" && Number.isFinite(dismissals)
          ? Math.max(0, Math.floor(dismissals))
          : 0,
      nextAt:
        typeof nextAt === "number" && Number.isFinite(nextAt) ? nextAt : null,
    };
  } catch {
    return EMPTY_REMINDER;
  }
}

export function isReminderDue(state: ReminderState, now: number): boolean {
  if (state.never) return false;
  return state.nextAt === null || now >= state.nextAt;
}

export function snoozeReminder(
  state: ReminderState,
  now: number,
): ReminderState {
  const days = SNOOZE_DAYS[Math.min(state.dismissals, SNOOZE_DAYS.length - 1)];
  return {
    never: state.never,
    dismissals: state.dismissals + 1,
    nextAt: now + days * DAY_MS,
  };
}

export function stopReminder(state: ReminderState): ReminderState {
  return { ...state, never: true };
}

/**
 * Formulários (nova obra, lançar gasto, nova conta…): a pessoa está no meio
 * de uma tarefa, então o lembrete espera. Inclui a primeira obra, logo
 * depois do cadastro: ele aparece quando ela já estiver criada.
 */
export function isFormPath(pathname: string): boolean {
  return /\/(nova|novo|editar|convidar|assinar)(\/|$)/.test(pathname);
}

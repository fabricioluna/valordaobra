import { describe, expect, it } from "vitest";

import {
  detectPlatform,
  EMPTY_REMINDER,
  isFormPath,
  isReminderDue,
  parseReminderState,
  snoozeReminder,
  stopReminder,
} from "@/features/install/rules";

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 10, 14, 12);

describe("detectPlatform", () => {
  it("reconhece iPhone, iPad e Android", () => {
    expect(
      detectPlatform(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1",
      ),
    ).toBe("ios");
    expect(
      detectPlatform(
        "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36",
      ),
    ).toBe("android");
    // iPadOS se apresenta como Mac, mas tem tela de toque.
    expect(
      detectPlatform(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
        5,
      ),
    ).toBe("ios");
  });

  it("computador fica de fora", () => {
    expect(
      detectPlatform(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
        0,
      ),
    ).toBe("other");
    expect(
      detectPlatform(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
      ),
    ).toBe("other");
  });
});

describe("lembrete", () => {
  it("aparece na primeira vez", () => {
    expect(isReminderDue(parseReminderState(null), NOW)).toBe(true);
  });

  it("“Agora não” adia cada vez mais: 3, 7, 14 e 30 dias", () => {
    let state = EMPTY_REMINDER;
    let now = NOW;
    for (const days of [3, 7, 14, 30, 30]) {
      state = snoozeReminder(state, now);
      expect(state.nextAt).toBe(now + days * DAY);
      expect(isReminderDue(state, now + days * DAY - 1)).toBe(false);
      now += days * DAY;
      expect(isReminderDue(state, now)).toBe(true);
    }
    expect(state.dismissals).toBe(5);
  });

  it("“Não mostrar mais” desliga de vez", () => {
    const state = stopReminder(EMPTY_REMINDER);
    expect(isReminderDue(state, NOW + 1000 * DAY)).toBe(false);
  });

  it("estado guardado estragado volta ao começo", () => {
    expect(parseReminderState("{quebrado")).toEqual(EMPTY_REMINDER);
    expect(parseReminderState('"texto"')).toEqual(EMPTY_REMINDER);
    expect(
      parseReminderState('{"never":"sim","dismissals":-2,"nextAt":"x"}'),
    ).toEqual(EMPTY_REMINDER);
  });

  it("guarda e lê de volta", () => {
    const state = snoozeReminder(EMPTY_REMINDER, NOW);
    expect(parseReminderState(JSON.stringify(state))).toEqual(state);
  });
});

describe("isFormPath", () => {
  it("espera a pessoa terminar o formulário", () => {
    expect(isFormPath("/o/maria/obras/nova")).toBe(true);
    expect(isFormPath("/o/maria/obras/abc/lancamentos/novo")).toBe(true);
    expect(isFormPath("/o/maria/obras/abc/contas/nova")).toBe(true);
    expect(isFormPath("/o/maria/configuracoes/equipe/convidar")).toBe(true);
  });

  it("mostra nas telas comuns", () => {
    expect(isFormPath("/o/maria/obras")).toBe(false);
    expect(isFormPath("/o/maria/obras/abc")).toBe(false);
    expect(isFormPath("/o/maria/obras/abc/etapas")).toBe(false);
    expect(isFormPath("/o/maria/configuracoes")).toBe(false);
  });
});

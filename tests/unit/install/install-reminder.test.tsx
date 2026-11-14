import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InstallReminder } from "@/features/install/components/install-reminder";

const navigation = vi.hoisted(() => ({ pathname: "/o/maria/obras/abc" }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

const ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36";
const DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36";
const KEY = "vdo:lembrete-instalar";

function useAgent(agent: string) {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(agent);
}

describe("InstallReminder", () => {
  beforeEach(() => {
    localStorage.clear();
    navigation.pathname = "/o/maria/obras/abc";
  });
  afterEach(() => vi.restoreAllMocks());

  it("aparece no celular com o atalho para o passo a passo", () => {
    useAgent(ANDROID);
    render(<InstallReminder />);
    expect(screen.getByText("Coloque o app na tela inicial")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Ver como fazer" }).getAttribute("href"),
    ).toBe("/instalar#android");
  });

  it("não aparece no computador nem nos formulários", () => {
    useAgent(DESKTOP);
    const { unmount } = render(<InstallReminder />);
    expect(screen.queryByText("Coloque o app na tela inicial")).toBeNull();
    unmount();

    useAgent(ANDROID);
    navigation.pathname = "/o/maria/obras/nova";
    render(<InstallReminder />);
    expect(screen.queryByText("Coloque o app na tela inicial")).toBeNull();
  });

  it("“Agora não” some e marca a volta para daqui a 3 dias", () => {
    useAgent(ANDROID);
    render(<InstallReminder />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Agora não" }));
    });
    expect(screen.queryByText("Coloque o app na tela inicial")).toBeNull();
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    expect(saved.dismissals).toBe(1);
    expect(saved.nextAt).toBeGreaterThan(Date.now() + 2.9 * 86_400_000);
  });

  it("“Não mostrar mais” desliga de vez", () => {
    useAgent(ANDROID);
    render(<InstallReminder />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Não mostrar mais" }));
    });
    expect(screen.queryByText("Coloque o app na tela inicial")).toBeNull();
    expect(JSON.parse(localStorage.getItem(KEY) ?? "{}").never).toBe(true);
  });
});

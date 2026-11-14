import { expect, test } from "@playwright/test";

import { adminClient } from "../rls/helpers";
import { createE2EUser, deleteE2EUsers, type E2EUser, signIn } from "./helpers";

/** Lembrete de pôr o app na tela inicial (o projeto de teste é um Android). */
test.describe("instalar no celular", () => {
  const users: E2EUser[] = [];

  test.afterAll(async () => {
    await deleteE2EUsers(users);
  });

  test("lembra, adia, leva ao passo a passo e para de lembrar", async ({
    page,
  }) => {
    const user = await createE2EUser("instalar");
    users.push(user);
    await adminClient()
      .from("profiles")
      .update({
        full_name: "Rita Teste",
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    await signIn(page, user);
    await expect(page).toHaveURL(/\/o\/[a-z0-9-]+\/obras$/);
    const reminder = page.getByRole("region", {
      name: "Coloque o app na tela inicial",
    });
    await expect(reminder).toBeVisible();

    // Nos formulários ele espera.
    await page.getByRole("link", { name: "Nova obra" }).click();
    await expect(page.getByLabel("Nome da obra")).toBeVisible();
    await expect(reminder).toBeHidden();
    await page.goBack();

    // "Agora não": some e continua sumido depois de recarregar.
    await reminder.getByRole("button", { name: "Agora não" }).click();
    await expect(reminder).toBeHidden();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(reminder).toBeHidden();

    // Passado o prazo, volta; o atalho abre o passo a passo do Android.
    await page.evaluate(() => {
      const key = "vdo:lembrete-instalar";
      const state = JSON.parse(localStorage.getItem(key) ?? "{}");
      localStorage.setItem(key, JSON.stringify({ ...state, nextAt: 0 }));
    });
    await page.reload();
    await expect(reminder).toBeVisible();
    const obrasUrl = page.url();
    await reminder.getByRole("link", { name: "Ver como fazer" }).click();
    await expect(page).toHaveURL(/\/instalar#android$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Android" }),
    ).toBeVisible();

    // "Não mostrar mais": não volta.
    await page.goto(obrasUrl);
    await reminder.getByRole("button", { name: "Não mostrar mais" }).click();
    await expect(reminder).toBeHidden();
    await page.evaluate(() => {
      const key = "vdo:lembrete-instalar";
      const state = JSON.parse(localStorage.getItem(key) ?? "{}");
      localStorage.setItem(key, JSON.stringify({ ...state, nextAt: 0 }));
    });
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(reminder).toBeHidden();
  });
});

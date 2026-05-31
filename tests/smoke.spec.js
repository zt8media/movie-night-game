const { test, expect } = require("@playwright/test");

const SAVE_KEY = "movie-night-game-save";
const SETTINGS_KEY = "movie-night-game-settings";

async function clearStorage(page) {
  await page.goto("/");
  await page.evaluate(({ saveKey, settingsKey }) => {
    localStorage.removeItem(saveKey);
    localStorage.removeItem(settingsKey);
  }, { saveKey: SAVE_KEY, settingsKey: SETTINGS_KEY });
  await page.reload();
}

async function seedSave(page, payload) {
  await page.goto("/");
  await page.evaluate(({ saveKey, payload }) => {
    localStorage.setItem(saveKey, JSON.stringify(payload));
  }, { saveKey: SAVE_KEY, payload });
  await page.reload();
}

async function clickWhileVisible(page, selector, maxClicks = 8) {
  for (let index = 0; index < maxClicks; index += 1) {
    const button = page.locator(selector);
    if (!(await button.count())) {
      return;
    }

    if (!(await button.first().isVisible())) {
      return;
    }

    await button.first().click();
  }
}

test.describe("Movie Night smoke flow", () => {
  test("home screen loads and starts a new game", async ({ page }) => {
    await clearStorage(page);

    await expect(page.locator(".home-scene")).toBeVisible();
    await expect(page.locator(".home-overlay h2")).toHaveText("Movie Night");
    await page.getByRole("button", { name: "New Game" }).click();

    await expect(page.locator(".kitchen-scene")).toBeVisible();
    await expect(page.getByText("Dinner first.").or(page.getByText("Okay."))).toBeVisible();
  });

  test("kitchen scene can complete and continue to remote", async ({ page }) => {
    await clearStorage(page);
    await page.getByRole("button", { name: "New Game" }).click();

    for (let index = 0; index < 7; index += 1) {
      await page.locator('[data-kitchen-action="next"][data-sequence="story"]').click();
    }

    await page.locator('[data-kitchen-action="choose-recipe"][data-choice="spaghetti"]').click();
    await page.locator('[data-kitchen-action="start-cooking"]').click();

    await page.locator('[data-kitchen-action="ingredient"][data-item="pasta"]').click();
    await page.locator('[data-kitchen-action="ingredient"][data-item="cheese"]').click();
    await page.locator('[data-kitchen-action="ingredient"][data-item="garlic"]').click();
    await page.locator('[data-kitchen-action="ingredient"][data-item="sauce"]').click();

    await clickWhileVisible(page, '[data-kitchen-action="next"][data-sequence="spill"]', 3);
    await page.locator('[data-kitchen-action="sponge"]').click();
    await page.locator('[data-kitchen-action="clean-spot"][data-spot="one"]').click();
    await page.locator('[data-kitchen-action="clean-spot"][data-spot="two"]').click();
    await page.locator('[data-kitchen-action="clean-spot"][data-spot="three"]').click();

    await clickWhileVisible(page, '[data-kitchen-action="next"][data-sequence="final"]', 4);
    await expect(page.locator('[data-kitchen-action="continue"]')).toBeEnabled();
    await page.locator('[data-kitchen-action="continue"]').click();

    await expect(page.locator(".remote-scene")).toBeVisible();
    await expect(page.locator('[data-remote-action="next"][data-sequence="story"]')).toBeVisible();
    await expect(page.getByText("Okay.")).toBeVisible();
  });

  test("login scene handles wrong and correct password flow", async ({ page }) => {
    await seedSave(page, {
      hasSave: true,
      currentScene: "login",
      completed: false,
      sceneState: {
        login: {
          storyIndex: 10,
          storyComplete: true,
          gameplayStarted: true,
          enteredPassword: "",
          loginComplete: false,
          continueTeaseSeen: false,
          activeMessage: {
            speaker: "Owner",
            text: "All right. Password time.",
          },
        },
      },
    });

    await expect(page.locator(".login-scene")).toBeVisible();
    await page.locator("#streaming-password").fill("wrongpass");
    await page.locator('[data-login-action="submit-password"]').click();
    await expect(page.getByText("Incorrect password.")).toBeVisible();
    await expect(page.getByText("Nope.")).toBeVisible({ timeout: 2000 });

    await page.locator("#streaming-password").fill("imsorry67");
    await page.locator('[data-login-action="submit-password"]').click();
    await expect(page.getByText("Welcome back.")).toBeVisible();
    await expect(page.getByText("There we go.")).toBeVisible({ timeout: 2000 });
    await expect(page.getByText("Maybe that helped.")).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-login-action="continue"]')).toBeVisible();
  });

  test("movie selection only finishes through Twilight", async ({ page }) => {
    await seedSave(page, {
      hasSave: true,
      currentScene: "movieSelect",
      completed: false,
      sceneState: {
        movieSelect: {
          introIndex: 3,
          introComplete: true,
          wrongSelectionClicks: 0,
          twilightChosen: false,
          finalIndex: 0,
          finalComplete: false,
          continueTeaseSeen: false,
          activeMessage: {
            speaker: "Owner",
            text: "Pick something before the app changes its mind.",
          },
        },
      },
    });

    await expect(page.locator(".movie-select-scene")).toBeVisible();

    await page.getByRole("button", { name: "Arcane" }).click();
    await expect(page.getByText("Did you mean Twilight?")).toBeVisible();

    await page.getByRole("button", { name: "Twilight" }).click();
    await expect(page.getByText("Playing Twilight.")).toBeVisible();

    await page.locator('[data-movie-action="next-final"]').click();
    await expect(page.getByText("Finally.")).toBeVisible();
    await page.locator('[data-movie-action="next-final"]').click();
    await expect(page.getByText("Movie night made it.")).toBeVisible();
    await page.locator('[data-movie-action="next-final"]').click();
    await expect(page.locator('[data-movie-action="continue"]')).toBeVisible();
  });
});

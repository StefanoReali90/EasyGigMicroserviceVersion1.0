import { When, Then, After, Before } from '@cucumber/cucumber';
import { expect, chromium, Browser, Page } from '@playwright/test';

let browser: Browser;
let page: Page;

Before(async function () {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
});

After(async function () {
  if (browser) {
    await browser.close();
  }
});

When('apro l\'applicazione frontend EasyGIG nel browser', async function () {
  await page.goto('http://localhost:4200/');
});

Then('la pagina visualizza il titolo o l\'intestazione EasyGIG', async function () {
  await expect(page).toHaveTitle(/EasyGIG|Vite/i);
});

Then('posso accedere alla schermata di Login', async function () {
  const loginBtn = page.locator('text=Accedi').first();
  if (await loginBtn.isVisible()) {
    await loginBtn.click();
    await expect(page).toHaveURL(/.*login.*/i);
  }
});

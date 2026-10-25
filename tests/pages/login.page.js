import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder('Username', { exact: true });
    this.passwordInput = page.getByPlaceholder('Password', { exact: true });
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.errorMessage = page.locator('[data-test="error"]');
    this.pageTitle = page.locator('[data-test="title"]');
    this.loginForm = page.getByRole('form', { name: 'Login' });
  }

  async open() {
    const url = process.env.BASE_URL ?? 'https://www.saucedemo.com/';
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async openInventory() {
    const baseUrl = process.env.BASE_URL ?? 'https://www.saucedemo.com/';
    await this.page.goto(new URL('inventory.html', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });
  }

  async expectAccessDenied() {
    await this.page.waitForURL(/\/$/);
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async expectError(message) {
    await expect(this.errorMessage).toContainText(message);
    await expect(this.loginForm).toBeVisible();
  }

  async login(username = '', password = '') {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

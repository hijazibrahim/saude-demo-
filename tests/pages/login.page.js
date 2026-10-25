export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder('Username', { exact: true });
    this.passwordInput = page.getByPlaceholder('Password', { exact: true });
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.errorMessage = page.locator('[data-test="error"]');
    this.pageTitle = page.locator('[data-test="title"]');
  }

  async open() {
    const url = process.env.BASE_URL ?? 'https://www.saucedemo.com/';
    await this.page.goto(url);
  }

  async openInventory() {
    const baseUrl = process.env.BASE_URL ?? 'https://www.saucedemo.com/';
    await this.page.goto(new URL('inventory.html', baseUrl).href);
  }

  async login(username = '', password = '') {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

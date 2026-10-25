import { expect } from '@playwright/test';

export class CartPage {
  constructor(page) {
    this.page = page;
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.continueShoppingButton = page.getByRole('button', {
      name: 'Continue Shopping',
      exact: true,
    });
  }

  async openDirectly() {
    const baseUrl = process.env.BASE_URL ?? 'https://www.saucedemo.com/';
    await this.page.goto(new URL('cart.html', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });
  }

  async expectProduct(productName, price) {
    const item = this.cartItems.filter({ hasText: productName });
    await expect(item).toHaveCount(1);
    await expect(
      item.getByRole('button', { name: `View details for ${productName}`, exact: true }),
    ).toBeVisible();
    await expect(item.getByText(price, { exact: true })).toBeVisible();
  }

  async expectProducts(productNames) {
    await expect(this.cartItems).toHaveCount(productNames.length);
    for (const productName of productNames) {
      const item = this.cartItems.filter({ hasText: productName });
      await expect(item).toHaveCount(1);
      await expect(
        item.getByRole('button', { name: `View details for ${productName}`, exact: true }),
      ).toBeVisible();
    }
  }

  async expectItemCount(count) {
    await expect(this.cartItems).toHaveCount(count);
    for (const item of await this.cartItems.all()) {
      await expect(item.locator('[data-test="item-quantity"]')).toHaveText('1');
    }
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}

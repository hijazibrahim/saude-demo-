import { expect } from '@playwright/test';

export class InventoryPage {
  constructor(page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.productCards = page.locator('[data-test="inventory-item"]');
  }

  productCard(productName) {
    return this.productCards.filter({ hasText: productName });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html$/);
    await expect(this.pageTitle).toHaveText('Products');
  }

  async addProduct(productName) {
    await this.productCard(productName)
      .getByRole('button', { name: 'Add to cart', exact: true })
      .click();
    await expect(
      this.productCard(productName).getByRole('button', { name: 'Remove', exact: true }),
    ).toBeVisible();
  }

  async doubleClickAdd(productName) {
    await this.productCard(productName)
      .getByRole('button', { name: 'Add to cart', exact: true })
      .dblclick();
  }

  async addCurrentProductFromDetails() {
    await this.page.locator('[data-test="add-to-cart"]').click();
    await expect(this.page.getByRole('button', { name: 'Remove', exact: true })).toBeVisible();
  }

  async expectProductAdded(productName) {
    await expect(
      this.productCard(productName).getByRole('button', { name: 'Remove', exact: true }),
    ).toBeVisible();
    await expect(
      this.productCard(productName).getByRole('button', { name: 'Add to cart', exact: true }),
    ).toHaveCount(0);
  }

  async expectProductNotAdded(productName) {
    await expect(
      this.productCard(productName).getByRole('button', { name: 'Add to cart', exact: true }),
    ).toBeVisible();
  }

  async expectCartCount(count) {
    if (count === 0) {
      await expect(this.cartLink).not.toContainText(/\d/);
      return;
    }
    await expect(this.cartLink).toContainText(String(count));
  }

  async openProductDetails(productName) {
    await this.productCard(productName).locator('[data-test$="-title-link"]').click();
  }

  async expectProductDetails(productName, price) {
    await expect(this.page).toHaveURL(/inventory-item\.html\?id=\d+$/);
    const productDetails = this.page.getByRole('main');
    await expect(productDetails.getByText(productName, { exact: true })).toBeVisible();
    await expect(productDetails.getByText(price, { exact: true })).toBeVisible();
    await expect(this.page.locator('[data-test="add-to-cart"]')).toBeVisible();
  }

  async backToProducts() {
    await this.page.locator('[data-test="back-to-products"]').click();
    await this.expectLoaded();
  }

  async openCart() {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/cart\.html$/);
  }

  async getProductNames() {
    return this.productCards.locator('[data-test="inventory-item-name"]').allTextContents();
  }
}

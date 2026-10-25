// spec: specs/add-to-cart-test-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from './fixtures/base.js';
import { LoginPage } from './pages/login.page.js';
import { CartPage } from './pages/cart.page.js';
import { InventoryPage } from './pages/inventory.page.js';

function getDemoPassword() {
  return process.env.SAUCEDEMO_PASSWORD ?? 'secret_sauce';
}

test.describe('Adding products to cart', () => {
  test('Add one product from inventory', async ({ page, step }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // 1. Open the site in a fresh browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
    });

    // 2. Sign in as standard_user with the valid demo password.
    await step('Sign in as standard_user', async () => {
      await loginPage.login('standard_user', getDemoPassword());
      await inventoryPage.expectLoaded();
    });

    // 3. Add Sauce Labs Backpack from the inventory page.
    await step('Add Sauce Labs Backpack to the cart', async () => {
      await inventoryPage.addProduct('Sauce Labs Backpack');
      await inventoryPage.expectCartCount(1);
    });

    // 4. Open the cart and verify the product and price.
    await step('Verify the backpack in the cart', async () => {
      await inventoryPage.openCart();
      await cartPage.expectProduct('Sauce Labs Backpack', '$29.99');
      await cartPage.expectItemCount(1);
    });
  });

  test('Add a product from its details page', async ({ page, step }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // 1. Open the site and sign in.
    await step('Open the site and sign in', async () => {
      await loginPage.open();
      await loginPage.login('standard_user', getDemoPassword());
      await inventoryPage.expectLoaded();
    });

    // 2. Open Sauce Labs Bike Light details.
    await step('Open Bike Light details', async () => {
      await inventoryPage.openProductDetails('Sauce Labs Bike Light');
      await inventoryPage.expectProductDetails('Sauce Labs Bike Light', '$9.99');
    });

    // 3. Add the product from its details page.
    await step('Add Bike Light from its details page', async () => {
      await inventoryPage.addCurrentProductFromDetails();
      await inventoryPage.expectCartCount(1);
    });

    // 4. Open the cart and verify the same product is present.
    await step('Verify Bike Light in the cart', async () => {
      await inventoryPage.openCart();
      await cartPage.expectProduct('Sauce Labs Bike Light', '$9.99');
    });
  });

  test('Add multiple distinct products', async ({ page, step }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // 1. Open the site and sign in.
    await step('Open the site and sign in', async () => {
      await loginPage.open();
      await loginPage.login('standard_user', getDemoPassword());
      await inventoryPage.expectLoaded();
    });

    // 2. Add two different products and verify the badge increments once per product.
    await step('Add Backpack and Bike Light', async () => {
      await inventoryPage.addProduct('Sauce Labs Backpack');
      await inventoryPage.expectCartCount(1);
      await inventoryPage.addProduct('Sauce Labs Bike Light');
      await inventoryPage.expectCartCount(2);
    });

    // 3. Open the cart and inspect both products.
    await step('Verify both products in the cart', async () => {
      await inventoryPage.openCart();
      await cartPage.expectProducts(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
      await cartPage.expectItemCount(2);
    });
  });

  test('Keep added product while navigating between inventory, details, and cart', async ({ page, step }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // 1. Open the site, sign in, and add one product.
    await step('Add Backpack from inventory', async () => {
      await loginPage.open();
      await loginPage.login('standard_user', getDemoPassword());
      await inventoryPage.addProduct('Sauce Labs Backpack');
      await inventoryPage.expectCartCount(1);
    });

    // 2. Visit another product and return without adding it.
    await step('Navigate to Bike Light details and return', async () => {
      await inventoryPage.openProductDetails('Sauce Labs Bike Light');
      await inventoryPage.expectProductDetails('Sauce Labs Bike Light', '$9.99');
      await inventoryPage.backToProducts();
      await inventoryPage.expectCartCount(1);
      await inventoryPage.expectProductAdded('Sauce Labs Backpack');
      await inventoryPage.expectProductNotAdded('Sauce Labs Bike Light');
    });

    // 3. Open the cart, continue shopping, then reopen the cart.
    await step('Verify the cart persists through Continue Shopping', async () => {
      await inventoryPage.openCart();
      await cartPage.expectProducts(['Sauce Labs Backpack']);
      await cartPage.continueShopping();
      await inventoryPage.expectLoaded();
      await inventoryPage.expectCartCount(1);
      await inventoryPage.openCart();
      await cartPage.expectProducts(['Sauce Labs Backpack']);
    });
  });
});

test.describe('Negative and boundary behavior', () => {
  test('Prevent unauthenticated access to inventory and cart', async ({ page, step }) => {
    const loginPage = new LoginPage(page);
    const cartPage = new CartPage(page);

    // 1. Navigate directly to inventory without signing in.
    await step('Deny direct inventory access while signed out', async () => {
      await loginPage.openInventory();
      await loginPage.expectAccessDenied();
    });

    // 2. Navigate directly to cart without signing in.
    await step('Deny direct cart access while signed out', async () => {
      await cartPage.openDirectly();
      await loginPage.expectAccessDenied();
      await loginPage.expectError('when you are logged in');
    });
  });

  test('Do not allow a locked-out user to add products', async ({ page, step }) => {
    const loginPage = new LoginPage(page);
    const cartPage = new CartPage(page);

    // 1. Open the login page and attempt to sign in as locked_out_user.
    await step('Reject locked_out_user login', async () => {
      await loginPage.open();
      await loginPage.login('locked_out_user', getDemoPassword());
      await loginPage.expectError('Sorry, this user has been locked out');
    });

    // 2. Attempt direct inventory and cart navigation after the rejected login.
    await step('Keep inventory and cart inaccessible to locked_out_user', async () => {
      await loginPage.openInventory();
      await loginPage.expectAccessDenied();
      await cartPage.openDirectly();
      await loginPage.expectAccessDenied();
      await loginPage.expectError('when you are logged in');
    });
  });

  test('Prevent adding the same product more than once', async ({ page, step }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // 1. Open the site and sign in.
    await step('Open the site and sign in', async () => {
      await loginPage.open();
      await loginPage.login('standard_user', getDemoPassword());
      await inventoryPage.expectLoaded();
    });

    // 2. Add Backpack and verify its add control changes to Remove.
    await step('Add Backpack once and verify its added state', async () => {
      await inventoryPage.addProduct('Sauce Labs Backpack');
      await inventoryPage.expectProductAdded('Sauce Labs Backpack');
      await inventoryPage.expectCartCount(1);
    });

    // 3. Open the cart and verify the product appears once at quantity one.
    await step('Verify a single Backpack cart entry', async () => {
      await inventoryPage.openCart();
      await cartPage.expectProducts(['Sauce Labs Backpack']);
      await cartPage.expectItemCount(1);
    });
  });

  test('Verify cart count with the maximum distinct inventory selection', async ({ page, step }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const productNames = [
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
      'Test.allTheThings() T-Shirt (Red)',
    ];

    // 1. Open the site and sign in.
    await step('Open the site and sign in', async () => {
      await loginPage.open();
      await loginPage.login('standard_user', getDemoPassword());
      await inventoryPage.expectLoaded();
    });

    // 2. Add each distinct inventory product once and check every badge increment.
    await step('Add all six distinct inventory products', async () => {
      const availableProducts = await inventoryPage.getProductNames();
      expect(availableProducts).toEqual(productNames);
      for (const [index, productName] of availableProducts.entries()) {
        await inventoryPage.addProduct(productName);
        await inventoryPage.expectCartCount(index + 1);
      }
    });

    // 3. Open the cart and compare its contents to the selected products.
    await step('Verify all six products appear once in the cart', async () => {
      await inventoryPage.openCart();
      await cartPage.expectProducts(productNames);
      await cartPage.expectItemCount(productNames.length);
    });
  });

  test('Handle rapid repeated activation of an add control', async ({ page, step }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    test.fixme(
      'SauceDemo removes the item after a rapid double-click on Add to cart; the application must be fixed before this behavior can pass.',
    );

    // 1. Open the site and sign in.
    await step('Open the site and sign in', async () => {
      await loginPage.open();
      await loginPage.login('standard_user', getDemoPassword());
      await inventoryPage.expectLoaded();
    });

    // 2. SauceDemo currently toggles the item back out of the cart on a rapid double-click.
    // Remove this fixme after the application makes repeated activation safe.
    await step('Rapidly activate Add to cart for Backpack', async () => {
      await inventoryPage.doubleClickAdd('Sauce Labs Backpack');
      await inventoryPage.expectProductAdded('Sauce Labs Backpack');
      await inventoryPage.expectCartCount(1);
    });

    // 3. Open the cart and verify the product is present exactly once.
    await step('Verify one Backpack remains in the cart', async () => {
      await inventoryPage.openCart();
      await cartPage.expectProducts(['Sauce Labs Backpack']);
      await cartPage.expectItemCount(1);
    });
  });
});

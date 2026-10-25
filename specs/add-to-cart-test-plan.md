# SauceDemo Add to Cart Test Plan

## Application Overview

Test the SauceDemo shopping-cart flow at https://www.saucedemo.com/: adding products from the inventory and product-details pages, cart badge and contents, quantity-one behavior, cart persistence during navigation, and access/error handling. The repository feature specification lists these cart capabilities and states that each product can have a quantity of one and that only authenticated users can access the inventory and cart. Browser inspection remained at about:blank, so product labels, exact UI messages, and runtime behavior must be confirmed during execution. Assume a fresh unauthenticated browser context at the start of every scenario, Chromium unless broader browser coverage is selected, and the current public SauceDemo demo credentials (verify before running; never use personal credentials).

## Test Scenarios

### 1. Adding products to cart

**Seed:** `tests/seed.spec.ts`

#### 1.1. Add one product from inventory

**File:** `tests/cart.spec.js`

**Steps:**
  1. Open https://www.saucedemo.com/ in a fresh browser context.
    - expect: The login page is displayed.
  2. Sign in as standard_user using the current valid public demo password.
    - expect: Authentication succeeds and the inventory page is displayed.
  3. Note the cart badge state, then select one product's Add to cart control from the inventory page.
    - expect: The selected product is added successfully.
    - expect: The cart badge displays 1.
    - expect: The selected product control changes to the corresponding remove action or otherwise clearly indicates it has been added.
  4. Open the cart.
    - expect: The cart contains exactly the selected product with the correct displayed name and price.
    - expect: The cart badge remains 1.

#### 1.2. Add a product from its details page

**File:** `tests/cart.spec.js`

**Steps:**
  1. Open the site in a fresh browser context and sign in as standard_user with the current valid demo password.
    - expect: The authenticated inventory page is displayed.
  2. Open one product's details page by selecting its product name or image.
    - expect: The details page shows the selected product's name and price and an Add to cart control.
  3. Select Add to cart on the details page.
    - expect: The selected product is added and the cart badge displays 1.
    - expect: The page remains usable and reflects the product's added state.
  4. Open the cart.
    - expect: The cart contains the same product with the displayed product details and price.

#### 1.3. Add multiple distinct products

**File:** `tests/cart.spec.js`

**Steps:**
  1. Open the site in a fresh browser context and sign in as standard_user with the current valid demo password.
    - expect: The authenticated inventory page is displayed.
  2. Add two different products from the inventory page, one at a time.
    - expect: Each selected product is indicated as added.
    - expect: The cart badge increments from 1 to 2 without skipping or double-counting.
  3. Open the cart and inspect its contents.
    - expect: Both distinct products appear exactly once with their correct names and prices.
    - expect: The cart badge displays 2.

#### 1.4. Keep added product while navigating between inventory, details, and cart

**File:** `tests/cart.spec.js`

**Steps:**
  1. Open the site in a fresh browser context, sign in as standard_user, and add one product from inventory.
    - expect: The product is added and the cart badge displays 1.
  2. Navigate to another product's details page and return to inventory without adding that second product.
    - expect: The original product remains added and the badge remains 1.
    - expect: The unrelated product remains unadded.
  3. Open the cart, return to inventory using Continue Shopping, then open the cart again.
    - expect: The original product remains in the cart throughout navigation.
    - expect: The cart badge and cart contents remain consistent.

### 2. Negative and boundary behavior

**Seed:** `tests/seed.spec.ts`

#### 2.1. Prevent unauthenticated access to inventory and cart

**File:** `tests/cart.spec.js`

**Steps:**
  1. Open the site in a fresh unauthenticated browser context and navigate directly to the inventory route.
    - expect: The user is redirected to login or access is otherwise denied.
    - expect: Product inventory is not exposed.
  2. Navigate directly to the cart route without signing in.
    - expect: The user is redirected to login or access is otherwise denied.
    - expect: Cart contents are not exposed.

#### 2.2. Do not allow a locked-out user to add products

**File:** `tests/cart.spec.js`

**Steps:**
  1. Open the site in a fresh browser context and attempt to sign in with locked_out_user and the current valid demo password.
    - expect: Authentication is rejected and a visible locked-account error is shown.
    - expect: The user remains unauthenticated and no inventory or cart controls are available.
  2. Attempt to navigate directly to the inventory and cart routes.
    - expect: Protected pages remain unavailable to the locked-out user.
    - expect: No product can be added and no cart contents are exposed.

#### 2.3. Prevent adding the same product more than once

**File:** `tests/cart.spec.js`

**Steps:**
  1. Open the site in a fresh browser context and sign in as standard_user.
    - expect: The inventory page is displayed.
  2. Add one product, then activate the same product's add control again if it remains available; otherwise verify the product's added-state control.
    - expect: The product can only appear once in the cart, consistent with quantity-one business rule.
    - expect: The cart badge remains 1 and does not increment for a duplicate add attempt.
    - expect: The product is not displayed with quantity greater than 1.
  3. Open the cart and inspect that product's quantity.
    - expect: Exactly one line item is present for that product and its quantity is 1, or quantity is omitted while clearly representing a single unit.

#### 2.4. Verify cart count with the maximum distinct inventory selection

**File:** `tests/cart.spec.js`

**Steps:**
  1. Open the site in a fresh browser context and sign in as standard_user.
    - expect: The inventory page is displayed and available product cards can be identified.
  2. Add each distinct available product once, checking the badge after every addition.
    - expect: The badge increases by exactly one for each newly added product.
    - expect: The final badge equals the number of distinct products selected; it does not overflow, become blank, or show an incorrect count.
  3. Open the cart and compare its line items with the products added.
    - expect: Each selected product appears exactly once and no unselected product appears.
    - expect: The cart badge matches the number of distinct cart items.

#### 2.5. Handle rapid repeated activation of an add control

**File:** `tests/cart.spec.js`

**Steps:**
  1. Open the site in a fresh browser context and sign in as standard_user.
    - expect: The inventory page is displayed.
  2. Activate a single product's Add to cart control rapidly more than once, including a double-click if the control permits it.
    - expect: The application does not create duplicate entries or increase that product's quantity beyond one.
    - expect: The badge and added-state control settle to a consistent value.
  3. Open the cart and inspect the result.
    - expect: The product appears exactly once with quantity one.
    - expect: The page remains responsive and no uncaught error or broken cart state is visible.

**Known issue:** The test is marked `test.fixme()` because SauceDemo currently removes the product from the cart after a rapid double-click on Add to cart. Re-enable the assertions after the application behavior is fixed.

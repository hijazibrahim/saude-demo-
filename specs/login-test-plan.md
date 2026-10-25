# SauceDemo Login Test Plan

## Application Overview

Test the SauceDemo login flow at https://www.saucedemo.com/ for successful authentication, account restrictions, validation, input boundaries, and navigation/session behavior. The local feature specification identifies standard_user, locked_out_user, and problem_user as account types. Browser inspection was not completed because permission to navigate to the website was denied, so visible labels, exact error copy, and page behavior in these scenarios are assumptions to verify during execution. Assume Chromium, a fresh browser context, and a blank unauthenticated state at the start of every scenario. Use the public SauceDemo demo credentials where needed (the standard demo password is commonly secret_sauce); confirm current credentials and messages before execution. Do not use real personal data.

## Test Scenarios

### 1. Login authentication, validation, and boundary scenarios

**Seed:** `tests/seed.spec.ts`

#### 1.1. Successful login with standard user

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open https://www.saucedemo.com/ in a fresh unauthenticated browser context.
    - expect: The login page is displayed with username and password inputs and a Login button.
  2. Enter standard_user in the username field and the current valid SauceDemo demo password in the password field, then activate Login.
    - expect: Authentication succeeds and the inventory/products page is displayed.
    - expect: The page shows the signed-in product catalog rather than a login error.

#### 1.2. Successful login with problem user account

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context.
    - expect: The login form is visible.
  2. Enter problem_user and the current valid demo password, then activate Login.
    - expect: Authentication succeeds and the inventory/products page is displayed.
    - expect: Any account-specific product display issue does not prevent login.

#### 1.3. Reject invalid username and valid password

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context.
    - expect: The login form is visible.
  2. Enter an unrecognized username and the current valid demo password, then activate Login.
    - expect: Authentication is rejected.
    - expect: A visible login error explains that the username/password combination is not accepted.
    - expect: The user remains on the login page and no authenticated inventory is shown.

#### 1.4. Reject valid username and incorrect password

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context.
    - expect: The login form is visible.
  2. Enter standard_user and an incorrect password, then activate Login.
    - expect: Authentication is rejected with a visible error.
    - expect: The user remains unauthenticated on the login page.

#### 1.5. Reject locked-out user

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context.
    - expect: The login form is visible.
  2. Enter locked_out_user and the current valid demo password, then activate Login.
    - expect: Authentication is rejected for the locked account.
    - expect: A visible error communicates that the user is locked out.
    - expect: No inventory page is accessible from the failed login.

#### 1.6. Validate both fields are required

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context and leave both fields empty.
    - expect: The login form is visible with both inputs empty.
  2. Activate Login without entering a username or password.
    - expect: Login is rejected with a visible required-field validation message.
    - expect: The user remains on the login page.

#### 1.7. Validate missing password

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context.
    - expect: The login form is visible.
  2. Enter standard_user, leave the password empty, and activate Login.
    - expect: Login is rejected with a visible password-required validation message.
    - expect: The user remains unauthenticated.

#### 1.8. Validate missing username

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context.
    - expect: The login form is visible.
  2. Leave the username empty, enter a password, and activate Login.
    - expect: Login is rejected with a visible username-required validation message.
    - expect: The user remains unauthenticated.

#### 1.9. Reject whitespace-only credentials

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context.
    - expect: The login form is visible.
  2. Enter spaces in both username and password and activate Login.
    - expect: Whitespace-only values do not authenticate the user.
    - expect: A visible validation or authentication error is shown and the user remains on the login page.

#### 1.10. Handle leading and trailing whitespace in username

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context.
    - expect: The login form is visible.
  2. Enter standard_user with leading and trailing spaces and the valid demo password, then activate Login.
    - expect: The observed behavior is consistent and explicitly verified: either whitespace is trimmed and login succeeds, or login is rejected with a visible error.
    - expect: The resulting page state matches the observed authentication outcome; no ambiguous or partially authenticated state is left.

#### 1.11. Reject password with incorrect case

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context.
    - expect: The login form is visible.
  2. Enter standard_user and the valid demo password with one or more letters changed in case, then activate Login.
    - expect: Password comparison is case-sensitive and authentication is rejected.
    - expect: A visible error appears and the user remains on the login page.

#### 1.12. Handle long credential values safely

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context.
    - expect: The login form is visible.
  2. Enter a very long username and password (for example, 1,000 characters each) and activate Login.
    - expect: The page remains responsive and does not crash or hang.
    - expect: The credentials are rejected with a visible error; no inventory is shown.
    - expect: Input handling does not cause a layout-breaking or uncaught application error.

#### 1.13. Keep password concealed while entering it

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context.
    - expect: The password input is present.
  2. Type a password into the password input.
    - expect: The entered password is visually masked rather than displayed as plain text.

#### 1.14. Prevent access to inventory without authentication

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the inventory route directly in a fresh unauthenticated browser context.
    - expect: The unauthenticated user is redirected to the login page or otherwise denied access.
    - expect: Product inventory is not displayed without a successful login.

#### 1.15. Verify login error can be corrected and retried

**File:** `specs/login-test-plan.md`

**Steps:**
  1. Open the login page in a fresh unauthenticated browser context, submit invalid credentials, and observe the error.
    - expect: Authentication is rejected and a visible error is shown.
  2. Replace the credentials with standard_user and the current valid demo password, then activate Login.
    - expect: The previous error is cleared or no longer obstructs the form.
    - expect: Authentication succeeds and the inventory/products page is displayed.

// spec: specs/login-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/base.js';
import { LoginPage } from './pages/login.page.js';

const invalidCredentialsMessage =
  'Username and password do not match any user in this service';

function getDemoPassword() {
  return process.env.SAUCEDEMO_PASSWORD ?? 'secret_sauce';
}

async function expectLoginPage(loginPage) {
  await expect(loginPage.usernameInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
  await expect(loginPage.loginButton).toBeVisible();
}

async function expectLoginError(loginPage, message) {
  await expect(loginPage.errorMessage).toContainText(message);
  await expect(loginPage.page).toHaveURL(/saucedemo\.com\/?$/);
}

async function expectProductsPage(loginPage) {
  await expect(loginPage.page).toHaveURL(/inventory\.html$/);
  await expect(loginPage.pageTitle).toHaveText('Products');
}

test.describe('Login authentication, validation, and boundary scenarios', () => {
  test('Successful login with standard user', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page in a fresh unauthenticated browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
    });

    // Enter standard_user and the valid demo password, then activate Login.
    await step('Log in as standard_user', async () => {
      await loginPage.login('standard_user', getDemoPassword());
      await expectProductsPage(loginPage);
    });
  });

  test('Successful login with problem user account', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page in a fresh unauthenticated browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
    });

    // Enter problem_user and the valid demo password, then activate Login.
    await step('Log in as problem_user', async () => {
      await loginPage.login('problem_user', getDemoPassword());
      await expectProductsPage(loginPage);
    });
  });

  test('Reject invalid username and valid password', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page in a fresh unauthenticated browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
    });

    // Enter an unrecognized username and the valid demo password, then activate Login.
    await step('Reject an unrecognized username', async () => {
      await loginPage.login('not_a_saucedemo_user', getDemoPassword());
      await expectLoginError(loginPage, invalidCredentialsMessage);
    });
  });

  test('Reject valid username and incorrect password', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page in a fresh unauthenticated browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
    });

    // Enter standard_user and an incorrect password, then activate Login.
    await step('Reject an incorrect password', async () => {
      await loginPage.login('standard_user', 'incorrect-password');
      await expectLoginError(loginPage, invalidCredentialsMessage);
    });
  });

  test('Reject locked-out user', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page in a fresh unauthenticated browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
    });

    // Enter locked_out_user and the valid demo password, then activate Login.
    await step('Reject the locked-out account', async () => {
      await loginPage.login('locked_out_user', getDemoPassword());
      await expectLoginError(loginPage, 'Sorry, this user has been locked out');
    });
  });

  test('Validate both fields are required', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page and leave both fields empty.
    await step('Open the login page with empty fields', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
      await expect(loginPage.usernameInput).toHaveValue('');
      await expect(loginPage.passwordInput).toHaveValue('');
    });

    // Activate Login without entering a username or password.
    await step('Submit the empty login form', async () => {
      await loginPage.login();
      await expectLoginError(loginPage, 'Username is required');
    });
  });

  test('Validate missing password', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page in a fresh unauthenticated browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
    });

    // Enter standard_user, leave the password empty, and activate Login.
    await step('Submit a username without a password', async () => {
      await loginPage.login('standard_user');
      await expectLoginError(loginPage, 'Password is required');
    });
  });

  test('Validate missing username', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page in a fresh unauthenticated browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
    });

    // Leave username empty, enter a password, and activate Login.
    await step('Submit a password without a username', async () => {
      await loginPage.login('', 'any-password');
      await expectLoginError(loginPage, 'Username is required');
    });
  });

  test('Reject whitespace-only credentials', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page in a fresh unauthenticated browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
    });

    // Enter spaces in both username and password, then activate Login.
    await step('Reject whitespace-only credentials', async () => {
      await loginPage.login('   ', '   ');
      await expectLoginError(loginPage, invalidCredentialsMessage);
    });
  });

  test('Handle leading and trailing whitespace in username', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page in a fresh unauthenticated browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
    });

    // Enter standard_user with surrounding spaces and a valid password, then activate Login.
    await step('Reject a username surrounded by whitespace', async () => {
      await loginPage.login(` standard_user `, getDemoPassword());
      await expectLoginError(loginPage, invalidCredentialsMessage);
    });
  });

  test('Reject password with incorrect case', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page in a fresh unauthenticated browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
    });

    // Change the case of one password character and try to log in.
    await step('Reject a password with changed letter case', async () => {
      const password = getDemoPassword();
      const firstCharacter = password[0];
      const changedCase =
        firstCharacter === firstCharacter.toLowerCase()
          ? firstCharacter.toUpperCase()
          : firstCharacter.toLowerCase();
      const incorrectCasePassword = changedCase + password.slice(1);

      await loginPage.login('standard_user', incorrectCasePassword);
      await expectLoginError(loginPage, invalidCredentialsMessage);
    });
  });

  test('Handle long credential values safely', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page in a fresh unauthenticated browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
    });

    // Enter 1,000-character username and password values, then activate Login.
    await step('Reject long credentials without breaking the page', async () => {
      await loginPage.login('u'.repeat(1_000), 'p'.repeat(1_000));
      await expectLoginError(loginPage, invalidCredentialsMessage);
      await expectLoginPage(loginPage);
    });
  });

  test('Keep password concealed while entering it', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page in a fresh unauthenticated browser context.
    await step('Open the SauceDemo login page', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
    });

    // Enter a password and verify that the field masks it.
    await step('Verify the password field is masked', async () => {
      await loginPage.passwordInput.fill('example-password');
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test('Prevent access to inventory without authentication', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the inventory route directly in a fresh unauthenticated browser context.
    await step('Request inventory without authentication', async () => {
      await loginPage.openInventory();
      await expectLoginPage(loginPage);
      await expect(loginPage.pageTitle).toHaveCount(0);
      await expect(loginPage.page).toHaveURL(/saucedemo\.com\/?$/);
    });
  });

  test('Verify login error can be corrected and retried', async ({ page, step }) => {
    const loginPage = new LoginPage(page);

    // Open the login page and submit invalid credentials.
    await step('Submit invalid credentials and observe the error', async () => {
      await loginPage.open();
      await expectLoginPage(loginPage);
      await loginPage.login('not_a_saucedemo_user', 'incorrect-password');
      await expectLoginError(loginPage, invalidCredentialsMessage);
    });

    // Replace the credentials with valid ones and activate Login again.
    await step('Correct the credentials and log in successfully', async () => {
      await loginPage.login('standard_user', getDemoPassword());
      await expectProductsPage(loginPage);
    });
  });
});

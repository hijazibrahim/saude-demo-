# Playwright test framework

Cross-browser end-to-end tests using JavaScript, `@playwright/test`, and the
built-in Playwright runner. The default example uses a self-contained sample
form so it can run without a network connection. Set `BASE_URL` and adapt the
example steps and assertions to target your application.

## Requirements and setup

- Node.js 20.12 or newer and npm (the installed Playwright version requires
  Node 20+; the config uses Node's built-in `.env` loader).
- Dependencies are declared in `package.json` and locked in
  `package-lock.json`; no additional runtime packages are required.
- Install dependencies and all browser engines:

  ```sh
  npm ci
  npx playwright install chromium firefox webkit
  ```

  On Linux CI, use `npx playwright install --with-deps chromium firefox webkit`
  to install operating-system browser dependencies as well.

Copy `.env.example` to `.env` and set `BASE_URL` and any test credentials.
`.env` is ignored by Git. In CI, provide credentials as repository secrets and
environment variables; never commit real credentials or authenticated browser
state.

## Run tests

| Command | Purpose |
| --- | --- |
| `npm test` | Run tests in Chromium, Firefox, and WebKit |
| `npm run test:chromium` | Run only the Chromium project |
| `npm run test:firefox` | Run only the Firefox project |
| `npm run test:webkit` | Run only the WebKit project |
| `npm run test:headed` | Run with visible browser windows |
| `npm run test:ui` | Open Playwright's test explorer UI |
| `npm run test:debug` | Run with the Playwright Inspector |
| `npm run report` | Open the most recent HTML report |
| `npm run install:browsers` | Install all configured browser engines |

Use `npx playwright test tests/example.spec.js --project=firefox` to run one
file in one browser. Chromium is the open-source Chromium engine; to test
branded Google Chrome, configure a separate project with
`channel: 'chrome'` and install Chrome on the machine running the tests.

## Project layout

```text
playwright.config.js       Timeouts, browser projects, retries, reporters
tests/                     JavaScript test files (*.spec.js)
tests/fixtures/base.js     Step logging fixture and shared Playwright exports
tests/support/locators.js  Accessible-first locator fallback helper
test-data/                 Non-secret JSON test data
test-results/              Per-test output, screenshots, video, and traces
playwright-report/         HTML report
.env.example               Local environment-variable template
.vscode/extensions.json    Recommended Playwright VS Code extension
```

The Playwright VS Code extension (`ms-playwright.playwright`) adds the test
explorer, run/debug actions, and editor integration. JavaScript uses the
Playwright runner's built-in editor/type support; TypeScript and a separate
compiler are not required.

## Writing a test

Put each test in `tests/` with a `.spec.js` suffix. Import `test` and `expect`
from `tests/fixtures/base.js` to get named steps and an attached execution log.
Use web-first assertions (`toBeVisible`, `toHaveText`, `toHaveURL`, etc.) rather
than fixed sleeps; Playwright automatically waits for actions and assertions.

```js
import { test, expect } from './fixtures/base.js';
import { findReliableLocator } from './support/locators.js';

test('search returns matching results', async ({ page, step }) => {
  await step('Open the application', async () => {
    await page.setContent('<main><h1>Example help center</h1></main>');
    await expect(page.getByRole('main')).toBeVisible();
  });

  await step('Search for the requested term', async () => {
    const search = await findReliableLocator('search field', [
      { name: 'searchbox role', locator: page.getByRole('searchbox') },
      {
        name: 'accessible label "Search"',
        locator: page.getByLabel('Search'),
      },
      {
        name: 'placeholder "Search"',
        locator: page.getByPlaceholder('Search'),
      },
    ]);
    await search.fill('sample search');
    await search.press('Enter');
    await expect(page.getByText('sample search')).toBeVisible();
  });
});
```

Describe a new scenario with:

1. Starting URL and login state.
2. Each action (click, type, select, upload) and the expected next state.
3. Expected page, text, messages, and error states.
4. Any exceptional wait needs and known failure conditions.
5. Expected final state and cleanup (including logout, if required).
6. Browser(s) and test data; use environment variables for secrets.

Prefer locators in this order: role and accessible name, label, placeholder,
visible text, then a stable test ID or scoped CSS selector. The fallback helper
tries each locator until it finds one visible, unique match. It reports all
attempted strategies when none match and fails with an actionable error if a
strategy is ambiguous; it does not silently click an arbitrary element. Keep
fallbacks limited to known page variants, and prefer fixing the app's
accessibility or test IDs over adding brittle selectors.

Use `step('What the user is doing', async () => { ... })` around meaningful
actions and checks. Each step is printed to the terminal and attached as
`execution-log.txt`; failures include the step name and original error. The
runner saves a screenshot and retains video and trace for failures. Open the
HTML report with `npm run report` to inspect attachments and trace details.

For login, read secrets from `process.env.TEST_USERNAME` and
`process.env.TEST_PASSWORD`; do not put them in JSON test data. Handle expected
JavaScript dialogs with `page.once('dialog', dialog => dialog.accept())` (or
`dismiss()`), and assert success/error messages explicitly. Prefer waiting for
the expected page state over fixed delays. Increase per-action or assertion
timeouts only when the application has a known slower operation.

## Configuration and maintenance

`playwright.config.js` reads `BASE_URL`, uses 45-second test, 30-second
navigation, 10-second action, and 8-second assertion timeouts, and runs
Chromium, Firefox, and WebKit in parallel. It retries twice in CI and keeps
screenshots, video, trace, and an HTML report for diagnosis. Set `CI=true` in
continuous integration. Parallel tests should use independent accounts/data or
unique records to avoid interfering with one another.

The included GitHub Actions workflow installs browser dependencies, runs the
suite, and uploads the HTML report. Formatting/lint tools (for example,
Prettier and ESLint with `eslint-plugin-playwright`) are optional and are not
needed to run this framework; add them if the project adopts corresponding
style/lint rules.

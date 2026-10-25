import { test, expect } from './fixtures/base.js';
import { findReliableLocator } from './support/locators.js';

test('search form displays results for the submitted term', async ({
  page,
  step,
}) => {
  await step('Open the self-contained example page', async () => {
    await page.setContent(`
      <main>
        <h1>Example help center</h1>
        <form onsubmit="
          event.preventDefault();
          document.querySelector('[role=status]').textContent =
            'Results for ' + document.querySelector('#query').value;
        ">
          <label for="query">Site search</label>
          <input id="query" type="search" />
          <button type="submit">Search</button>
        </form>
        <p role="status" aria-live="polite"></p>
      </main>
    `);
    await expect(page.getByRole('heading', { name: 'Example help center' }))
      .toBeVisible();
  });

  await step('Submit a search and verify the result message', async () => {
    const search = await findReliableLocator('site search field', [
      {
        name: 'searchbox role named "Search"',
        locator: page.getByRole('searchbox', { name: 'Search' }),
      },
      {
        name: 'accessible label "Site search"',
        locator: page.getByLabel('Site search'),
      },
    ]);

    await search.fill('Playwright');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('status')).toHaveText('Results for Playwright');
  });
});

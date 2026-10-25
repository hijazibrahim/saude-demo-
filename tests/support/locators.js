/**
 * Wait for the first visible, uniquely matched locator. Put the most semantic
 * locator first and use narrowly scoped alternatives for known UI variations.
 *
 * @param {string} description
 * @param {{ name: string, locator: import('@playwright/test').Locator }[]} strategies
 * @param {{ timeoutPerStrategy?: number }} [options]
 * @returns {Promise<import('@playwright/test').Locator>}
 */
export async function findReliableLocator(
  description,
  strategies,
  { timeoutPerStrategy = 1_500 } = {},
) {
  if (strategies.length === 0) {
    throw new Error(`No locator strategies were provided for "${description}".`);
  }

  for (const strategy of strategies) {
    try {
      await strategy.locator.waitFor({
        state: 'visible',
        timeout: timeoutPerStrategy,
      });
    } catch (error) {
      if (!(error instanceof Error) || error.name !== 'TimeoutError') {
        throw error;
      }
      continue;
    }

    const matchCount = await strategy.locator.count();
    if (matchCount !== 1) {
      throw new Error(
        `Found ${matchCount} elements for "${description}" using ${strategy.name}; ` +
          'make the locator more specific instead of choosing an ambiguous match.',
      );
    }

    return strategy.locator;
  }

  const attempted = strategies.map(({ name }) => name).join('; ');
  throw new Error(
    `Could not find visible element "${description}". Tried: ${attempted}. ` +
      `Check the page, accessible name, and locator context (waited up to ${timeoutPerStrategy} ms per strategy).`,
  );
}

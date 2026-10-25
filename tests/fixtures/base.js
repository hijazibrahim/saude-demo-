import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  step: async ({}, use, testInfo) => {
    const lines = [
      `[INFO] Started "${testInfo.title}" in ${testInfo.project.name}`,
    ];

    const step = async (description, action) => {
      const startedAt = Date.now();
      const startLine = `[STEP] ${description}`;
      lines.push(startLine);
      console.log(startLine);

      return test.step(description, async () => {
        try {
          const result = await action();
          const passLine = `[PASS] ${description} (${Date.now() - startedAt} ms)`;
          lines.push(passLine);
          console.log(passLine);
          return result;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const failLine = `[FAIL] ${description}: ${message}`;
          lines.push(failLine);
          console.error(failLine);
          throw new Error(`Step "${description}" failed: ${message}`, {
            cause: error,
          });
        }
      });
    };

    await use(step);

    const result =
      testInfo.status === testInfo.expectedStatus ? 'PASSED' : 'FAILED';
    const endLine = `[INFO] ${result}: "${testInfo.title}"`;
    lines.push(endLine);
    console.log(endLine);
    await testInfo.attach('execution-log.txt', {
      body: lines.join('\n'),
      contentType: 'text/plain',
    });
  },
});

export { expect };

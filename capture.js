const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate and wait for network idle to ensure fetch requests complete
  await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });

  // Wait a little extra just in case
  await page.waitForTimeout(2000);

  // Take a full page screenshot
  await page.screenshot({ path: 'portfolio_full.png', fullPage: true });

  await browser.close();
})();

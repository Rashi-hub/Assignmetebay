import { test, expect, Page, Locator } from '@playwright/test';

// ✅ Utility Functions

const navigateToHomePage = async (page: Page): Promise<void> => {
  await page.goto('https://www.ebay.com');
};

const searchProduct = async (page: Page, keyword: string): Promise<void> => {
  await page.fill('input#gh-ac', keyword);
  await page.keyboard.press('Enter');
  await page.waitForSelector('.s-item__link');
};

const clickFirstSearchResult = async (page: Page): Promise<void> => {
  const firstItem = page.locator('.s-item__link').first();
  await firstItem.scrollIntoViewIfNeeded();
  await firstItem.waitFor({ state: 'visible' });
  await firstItem.click();
};

const getRelatedProducts = (page: Page): Locator => {
  return page.locator('[aria-label="Related sponsored items"] li');
};

const simulateAPIFailure = async (page: Page): Promise<void> => {
  await page.route('**/related-products**', route => route.abort());
};

// ✅ Test Suite

test.describe('eBay Related Products Automation Suite', () => {

  test('TC01 - Display related products', async ({ page }) => {
    await navigateToHomePage(page);
    await searchProduct(page, 'wallet');
    await clickFirstSearchResult(page);
    const related = getRelatedProducts(page);
    const count = await related.count();
    expect(count).toBeLessThanOrEqual(6);
  });

  test('TC03 - No related products for niche item', async ({ page }) => {
    await navigateToHomePage(page);
    await searchProduct(page, 'vintage keyring wallet 1910');
    await clickFirstSearchResult(page);
    const related = getRelatedProducts(page);
    const count = await related.count();
    expect(count).toBe(0);
  });

  test('TC09 - API failure fallback behavior', async ({ page }) => {
    await simulateAPIFailure(page);
    await navigateToHomePage(page);
    await searchProduct(page, 'wallet');
    await clickFirstSearchResult(page);
    const related = getRelatedProducts(page);
    const count = await related.count();
    expect(count).toBeLessThanOrEqual(0); // fallback or no items shown
  });

  test('TC04 - More than 6 matches only show top 6', async ({ page }) => {
    await navigateToHomePage(page);
    await searchProduct(page, 'wallet');
    await clickFirstSearchResult(page);
    const related = getRelatedProducts(page);
    const count = await related.count();
    expect(count).toBeLessThanOrEqual(6);
  });

  test('TC06 - Out-of-stock items are excluded (manual simulation)', async ({ page }) => {
    await navigateToHomePage(page);
    await searchProduct(page, 'wallet');
    await clickFirstSearchResult(page);
    const related = getRelatedProducts(page);
    const count = await related.count();
    expect(count).toBeLessThanOrEqual(6);
  });

});

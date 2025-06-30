export async function searchProduct(page, keyword: string) {
  await page.fill('input#gh-ac', keyword);
  await page.keyboard.press('Enter');
  await page.waitForSelector('.s-item__link');
}

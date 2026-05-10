import { test, expect } from '@playwright/test';

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

test.describe('Melcho Payment E2E Journey', () => {
  test('TC-E2E-028: Razorpay checkout modal opens', async ({ page }) => {
    await page.goto('/menu');
    await page.locator('button:has-text("Add to Cart"), text=Add to Cart').first().click();
    await page.goto('/checkout');
    await page.fill('input[name="street"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Testville');
    await page.fill('input[name="pincode"]', '123456');
    await page.fill('input[name="phone"]', '9876543210');
    await page.click('button:has-text("Pay"), input[type="submit"]');
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('text=Razorpay, text=Checkout')).toBeVisible({ timeout: 15000 });
  });

  test('TC-E2E-029: Successful test payment completes', async ({ page }) => {
    await page.goto('/menu');
    await page.locator('button:has-text("Add to Cart"), text=Add to Cart').first().click();
    await page.goto('/checkout');
    await page.fill('input[name="street"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Testville');
    await page.fill('input[name="pincode"]', '123456');
    await page.fill('input[name="phone"]', '9876543210');
    await page.click('button:has-text("Pay"), input[type="submit"]');
    const modal = page.frameLocator('iframe');
    await expect(modal.locator('text=Card, text=Debit, text=Credit')).toBeVisible({ timeout: 20000 });
    await modal.locator('input[name="cardnumber"]').fill('4111111111111111');
    await modal.locator('input[name="exp-date"]').fill('12/30');
    await modal.locator('input[name="cvv"]').fill('123');
    await modal.locator('input[name="name"]').fill('E2E User');
    await modal.locator('button:has-text("Pay"), button:has-text("Continue")').click();
    await page.waitForTimeout(5000);
    await expect(page).toHaveURL(/order-success|success/);
    await expect(page.locator('text=Order ID, text=Thank you')).toBeVisible();
  });

  test('TC-E2E-030: Order appears in history after payment', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.locator('text=Order History, .order-row')).toBeVisible();
  });

  test('TC-E2E-031: Order status starts as Pending', async ({ page }) => {
    await page.goto('/orders');
    const status = page.locator('text=Pending').first();
    await expect(status).toBeVisible();
  });

  test('TC-E2E-032: Cart cleared after successful payment', async ({ page }) => {
    await page.goto('/');
    const badge = page.locator('.cart-count, .badge').first();
    expect(await badge.textContent()).toMatch(/0|⁰/);
  });
});

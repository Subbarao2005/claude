import { test, expect } from '@playwright/test';

test.describe('Melcho Mobile Experience', () => {
  test('TC-E2E-033: Landing page responsive on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(375);
    await expect(page.locator('button[aria-label="menu"], text=Menu, text=☰')).toBeVisible();
  });

  test('TC-E2E-034: Mobile hamburger menu works', async ({ page }) => {
    await page.goto('/');
    const menuButton = page.locator('button[aria-label="menu"], text=☰').first();
    await menuButton.click();
    await expect(page.locator('text=Menu, text=Home, text=Login')).toBeVisible();
    await page.click('body');
  });

  test('TC-E2E-035: Menu page responsive on mobile', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.locator('article, .product-card, .menu-card')).toHaveCountGreaterThan(0);
    await expect(page.locator('input[type="search"], [placeholder*="Search"], [aria-label*="search"]')).toBeVisible();
  });

  test('TC-E2E-036: Cart sidebar full width on mobile', async ({ page }) => {
    await page.goto('/menu');
    await page.locator('button:has-text("Add to Cart"), text=Add to Cart').first().click();
    await page.locator('button[aria-label="cart"], text=Cart').first().click();
    const sidebar = page.locator('.cart-sidebar, .cart-drawer');
    await expect(sidebar).toBeVisible();
  });

  test('TC-E2E-037: Checkout form usable on mobile', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('input[name="street"], input[name="city"], input[name="pincode"], input[name="phone"]')).toBeVisible();
  });

  test('TC-E2E-038: Admin dashboard readable on mobile', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', process.env.ADMIN_EMAIL);
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD);
    await page.click('button:has-text("Login"), input[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);
    await expect(page.locator('text=Total Orders, text=Total Revenue, text=Pending Orders')).toBeVisible();
  });
});

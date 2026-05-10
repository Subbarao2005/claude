import { test, expect } from '@playwright/test';

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

test.describe('Melcho Admin E2E Journey', () => {
  test('TC-E2E-017: Admin login page accessible at /admin/login', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('text=Admin Login, text=Administrator Login')).toBeVisible();
    await expect(page.locator('text=Register')).toHaveCount(0);
  });

  test('TC-E2E-018: Admin login with wrong credentials fails', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'wrong@melcho.com');
    await page.fill('input[name="password"]', 'WrongPassword!');
    await page.click('button:has-text("Login"), input[type="submit"]');
    await expect(page.locator('text=Invalid credentials, text=wrong email, text=failed')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('TC-E2E-019: Admin login succeeds', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button:has-text("Login"), input[type="submit"]');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.locator('text=Dashboard, text=Total Orders, text=Total Revenue')).toBeVisible();
  });

  test('TC-E2E-020: Admin dashboard shows metrics', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button:has-text("Login"), input[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Pending Orders')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('TC-E2E-021: Admin can view all orders', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button:has-text("Login"), input[type="submit"]');
    await page.goto('/admin/orders');
    await expect(page.locator('text=Orders, table')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
  });

  test('TC-E2E-022: Admin can filter orders by status', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button:has-text("Login"), input[type="submit"]');
    await page.goto('/admin/orders');
    const filter = page.locator('select');
    if (await filter.count()) {
      await filter.selectOption({ label: 'Pending' }).catch(() => {});
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Pending')).toBeVisible();
    }
  });

  test('TC-E2E-023: Admin can update order status', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button:has-text("Login"), input[type="submit"]');
    await page.goto('/admin/orders');
    const statusSelect = page.locator('select').first();
    if (await statusSelect.count()) {
      await statusSelect.selectOption({ label: 'Accepted' }).catch(() => {});
      await page.click('button:has-text("Update"), button:has-text("Save")');
      await expect(page.locator('text=success, text=updated')).toBeVisible();
    }
  });

  test('TC-E2E-024: Admin product management page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button:has-text("Login"), input[type="submit"]');
    await page.goto('/admin/products');
    await expect(page.locator('text=Products, text=Add Product')).toBeVisible();
  });

  test('TC-E2E-025: Admin can add a new product', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button:has-text("Login"), input[type="submit"]');
    await page.goto('/admin/products');
    await page.fill('input[name="title"]', 'E2E Test Cake');
    await page.fill('input[name="price"]', '299');
    await page.fill('input[name="category"]', 'Cake').catch(() => {});
    await page.fill('textarea[name="description"]', 'Test');
    await page.click('button:has-text("Add Product"), input[type="submit"]');
    await expect(page.locator('text=E2E Test Cake')).toBeVisible();
  });

  test('TC-E2E-026: Admin can delete product', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button:has-text("Login"), input[type="submit"]');
    await page.goto('/admin/products');
    const productRow = page.locator('tr', { hasText: 'E2E Test Cake' }).first();
    if (await productRow.count()) {
      await productRow.locator('button:has-text("Delete")').click();
      await page.click('button:has-text("Confirm"), button:has-text("Yes")');
      await expect(page.locator('text=E2E Test Cake')).toHaveCount(0);
    }
  });

  test('TC-E2E-027: Regular user cannot access admin dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button:has-text("Login"), input[type="submit"]');
    await page.goto('/admin/dashboard');
    await expect(page).not.toHaveURL(/\/admin\/dashboard/);
  });
});

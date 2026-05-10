import { test, expect } from '@playwright/test';

test.describe('Melcho Customer E2E Journey', () => {
  const buildEmail = () => `test_${Date.now()}@test.melcho.com`;

  test('TC-E2E-001: Landing page loads and renders correctly', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error));

    await page.goto('/');
    await expect(page).toHaveTitle(/Melcho/i);
    await expect(page.locator('text=Order Now')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#root')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('TC-E2E-002: Navigate to menu from landing page', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('text=Order Now, text=View Menu').first();
    await button.click();
    await expect(page).toHaveURL(/\/menu/);
    await expect(page.locator('article, .product-card, .menu-card')).toBeVisible();
    await expect(page.locator('input[type="search"], [placeholder*="Search"], [aria-label*="search"]')).toBeVisible();
  });

  test('TC-E2E-003: Product search filters correctly', async ({ page }) => {
    await page.goto('/menu');
    const search = page.locator('input[type="search"], [placeholder*="Search"], [aria-label*="search"]');
    await expect(search).toBeVisible();
    await search.fill('cake');
    await page.waitForTimeout(800);
    const cards = page.locator('article, .product-card, .menu-card');
    expect(await cards.count()).toBeGreaterThan(0);
    const textContents = await cards.allTextContents();
    expect(textContents.some(text => /cake/i.test(text))).toBe(true);
  });

  test('TC-E2E-004: Category filter works', async ({ page }) => {
    await page.goto('/menu');
    const allTab = page.locator('button', { hasText: 'All' }).first();
    const categoryTab = page.locator('button', { hasText: 'Cake' }).first();
    if (await categoryTab.count()) {
      await categoryTab.click();
      await page.waitForTimeout(800);
      const cards = page.locator('article, .product-card, .menu-card');
      expect(await cards.count()).toBeGreaterThan(0);
    }
    if (await allTab.count()) {
      await allTab.click();
      await expect(page.locator('article, .product-card, .menu-card')).toBeVisible();
    }
  });

  test('TC-E2E-005: Register new account', async ({ page }) => {
    const email = buildEmail();
    await page.goto('/register');
    await page.fill('input[name="name"]', 'E2E User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button:has-text("Register"), input[type="submit"]');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/(menu|$)/);
    await expect(page.locator('text=Logout, text=Sign Out')).toBeVisible();
  });

  test('TC-E2E-006: Login with registered account', async ({ page }) => {
    const email = buildEmail();
    await page.goto('/register');
    await page.fill('input[name="name"]', 'E2E Login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button:has-text("Register"), input[type="submit"]');
    await page.waitForTimeout(2000);
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button:has-text("Login"), input[type="submit"]');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/(menu|$)/);
    await expect(page.locator('text=Logout, text=Sign Out')).toBeVisible();
  });

  test('TC-E2E-007: Add product to cart', async ({ page }) => {
    await page.goto('/menu');
    const addButton = page.locator('button:has-text("Add to Cart"), text=Add to Cart').first();
    await addButton.click();
    await page.waitForTimeout(800);
    await expect(page.locator('text=Cart, .cart-count, .badge')).toBeVisible();
  });

  test('TC-E2E-008: Cart sidebar opens and shows item', async ({ page }) => {
    await page.goto('/menu');
    const addButton = page.locator('button:has-text("Add to Cart"), text=Add to Cart').first();
    await addButton.click();
    const cartIcon = page.locator('button[aria-label="cart"], text=Cart').first();
    await cartIcon.click();
    await expect(page.locator('text=Cart, .cart-sidebar, .cart-drawer')).toBeVisible();
    await expect(page.locator('text=Qty, text=Quantity, .cart-item')).toBeVisible();
  });

  test('TC-E2E-009: Update quantity in cart', async ({ page }) => {
    await page.goto('/menu');
    await page.locator('button:has-text("Add to Cart"), text=Add to Cart').first().click();
    await page.locator('button[aria-label="cart"], text=Cart').first().click();
    const plusButton = page.locator('button:has-text("+")').first();
    await plusButton.click();
    await page.waitForTimeout(500);
    const quantity = await page.locator('.cart-item [value], .cart-item .quantity').first().textContent();
    expect(quantity).toMatch(/2/);
  });

  test('TC-E2E-010: Remove item from cart', async ({ page }) => {
    await page.goto('/menu');
    await page.locator('button:has-text("Add to Cart"), text=Add to Cart').first().click();
    await page.locator('button[aria-label="cart"], text=Cart').first().click();
    await page.locator('button:has-text("Remove"), button:has-text("Delete")').first().click();
    await expect(page.locator('text=cart is empty, text=Your cart is empty')).toBeVisible();
  });

  test('TC-E2E-011: Proceed to checkout (requires login)', async ({ page }) => {
    await page.goto('/menu');
    await page.locator('button:has-text("Add to Cart"), text=Add to Cart').first().click();
    await page.locator('button:has-text("Proceed to Checkout"), text=Checkout').first().click();
    await page.waitForTimeout(1000);
    if (page.url().includes('/login')) {
      await page.fill('input[name="email"]', 'testuser@example.com');
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.click('button:has-text("Login"), input[type="submit"]');
      await page.waitForTimeout(2000);
    }
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('text=Order Summary, text=Checkout')).toBeVisible();
  });

  test('TC-E2E-012: Checkout form validation', async ({ page }) => {
    await page.goto('/checkout');
    await page.click('button:has-text("Pay"), input[type="submit"]');
    await expect(page.locator('text=required, text=Please fill, text=invalid')).toBeVisible();
  });

  test('TC-E2E-013: Checkout form accepts valid address', async ({ page }) => {
    await page.goto('/checkout');
    await page.fill('input[name="street"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Testville');
    await page.fill('input[name="pincode"]', '123456');
    await page.fill('input[name="phone"]', '9876543210');
    await expect(page.locator('button:has-text("Pay"), input[type="submit"]')).toBeEnabled();
  });

  test('TC-E2E-014: Protected route redirects to login', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-E2E-015: Order history page loads', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.locator('text=Order History, text=My Orders')).toBeVisible();
  });

  test('TC-E2E-016: Order tracking page loads', async ({ page }) => {
    await page.goto('/orders');
    const orderLink = page.locator('a:has-text("View"), a:has-text("Track")').first();
    if (await orderLink.count()) {
      await orderLink.click();
      await expect(page.locator('text=Tracking, text=order details, .stepper')).toBeVisible();
    } else {
      await expect(page.locator('text=No orders yet, text=empty state')).toBeVisible();
    }
  });
});

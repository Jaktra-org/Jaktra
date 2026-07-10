import { test, expect } from '@playwright/test';

const mockPayload = Buffer.from(
  JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 31536000 })
).toString('base64').replace(/=/g, '');
const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${mockPayload}.mocksignature`;

test.describe('Jaktra Frontend Critical Paths', () => {
  let linkGenerated = false;
  let agentTriggered = false;

  test.beforeEach(async ({ page }) => {
    linkGenerated = false;
    agentTriggered = false;

    page.on('console', (msg) => {
      console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
    });
    page.on('requestfailed', (req) => {
      console.log(`[BROWSER REQUEST FAILED] ${req.url()} - ${req.failure()?.errorText}`);
    });
    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('/api/')) {
        console.log(`[BROWSER RESPONSE] ${res.status()} - ${url}`);
      }
    });

    // 1. Auth check
    await page.route(/\/api\/auth\/me$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'admin',
          tenantId: 'tenant-1'
        })
      });
    });

    // 2. Dashboard Analytics Summary
    await page.route(/\/api\/analytics\/summary$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalOutstanding: 125000,
          collectedThisMonth: 45000,
          overdueAmount: 32000,
          avgDaysToPayment: 14
        })
      });
    });

    // 3. Dashboard Analytics Aging
    await page.route(/\/api\/analytics\/aging$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // 4. Invoices List
    await page.route(/\/api\/invoices(\?|$)/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            invoices: [
              {
                id: 'invoice-1',
                invoiceNo: 'INV-001',
                clientName: 'Acme Corp',
                invoiceAmount: 5000,
                dueDate: '2026-08-10T00:00:00.000Z',
                paymentStatus: 'Pending',
                contactEmail: 'acme@example.com',
                followupCount: 1,
                createdAt: '2026-07-01T12:00:00.000Z',
                paymentLink: null
              }
            ],
            pagination: {
              total: 1,
              page: 1,
              limit: 10,
              totalPages: 1
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // 5. Invoice Import
    await page.route(/\/api\/invoices\/import/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          imported: 3,
          updated: 1,
          skipped: 0,
          errors: []
        })
      });
    });

    // 6. Payment Link Creation POST
    await page.route(/\/api\/invoices\/[^/]+\/payment-link$/, async (route) => {
      linkGenerated = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://payment.link/inv-001' })
      });
    });

    // 7. Single Invoice GET & sub-resources (timeline)
    // Anchored regex prevents it matching /payment-link POST requests
    await page.route(/\/api\/invoices\/invoice-1(\?|\/timeline|$)/, async (route) => {
      const url = route.request().url();
      if (url.includes('/timeline')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else {
        // Single invoice details GET
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'invoice-1',
            invoiceNo: 'INV-001',
            clientName: 'Acme Corp',
            invoiceAmount: 5000,
            dueDate: '2026-08-10T00:00:00.000Z',
            paymentStatus: 'Pending',
            contactEmail: 'acme@example.com',
            followupCount: 1,
            createdAt: '2026-07-01T12:00:00.000Z',
            paymentLink: linkGenerated ? {
              status: 'active',
              url: 'https://payment.link/inv-001'
            } : null
          })
        });
      }
    });

    // 8. Invoice Communications
    await page.route(/\/api\/settings\/communication\/invoices\/invoice-1\/communications/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // 9. Tenant Settings
    await page.route(/\/api\/settings$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          defaultEmailProvider: 'smtp',
          senderEmail: 'billing@example.com',
          senderName: 'Acme Billing',
          replyTo: 'support@example.com',
          autoPurgeEnabled: false,
          skipPaymentWarning: true
        })
      });
    });

    // 10. Settings Integrations
    await page.route(/\/api\/settings\/integrations$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sendgrid: { isConfigured: false },
          smtp: { isConfigured: true, lastValidationResult: 'valid' },
          razorpay: { isConfigured: true, lastValidationResult: 'valid' }
        })
      });
    });

    // 11. Event feed on Agent Page
    await page.route(/\/api\/events\/feed/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // 12. Agent Trigger Run POST
    await page.route(/\/api\/agent\/run$/, async (route) => {
      agentTriggered = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'run-1',
          status: 'running',
          invoicesProcessed: 0,
          emailsSent: 0,
          errors: 0
        })
      });
    });

    // 13. Agent Runs list GET
    await page.route(/\/api\/agent\/runs/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          runs: agentTriggered ? [
            {
              id: 'run-1',
              status: 'running',
              invoicesProcessed: 0,
              emailsSent: 0,
              errors: 0,
              createdAt: new Date().toISOString()
            }
          ] : [],
          pages: 1
        })
      });
    });
  });

  test('Path 1: Login', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: mockToken,
          user: {
            id: 'user-1',
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'admin',
            tenantId: 'tenant-1'
          }
        })
      });
    });

    await page.goto('/login');

    await page.fill('input[type="email"]', 'jane@example.com');
    await page.fill('input[type="password"]', 'Password123!');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBe(mockToken);
  });

  test('Path 2: Invoice Import', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate((t) => {
      localStorage.setItem('auth_token', t);
    }, mockToken);

    await page.goto('/invoices');

    await expect(page.locator('aside >> text=Invoices')).toBeVisible();

    await expect(page.locator('text=Loading invoices...')).not.toBeVisible();

    await page.click('button:has-text("Import CSV")');

    await expect(page.locator('text=Import Invoices')).toBeVisible();

    const csvContent = 'invoiceNo,clientName,invoiceAmount,dueDate,contactEmail\nINV-002,Client A,1500,2026-08-15,clienta@example.com';
    
    await page.setInputFiles('#csv-upload', {
      name: 'invoices.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });

    await page.click('div[role="dialog"] >> button:has-text("Upload and Process")');

    await expect(page.locator('text=Import Complete')).toBeVisible();
    await expect(page.locator('text=Imported').locator('xpath=..').locator('text=3')).toBeVisible();
    await expect(page.locator('text=Updated').locator('xpath=..').locator('text=1')).toBeVisible();

    await page.click('button:has-text("Done")');
    await expect(page.locator('text=Import Complete')).not.toBeVisible();
  });

  test('Path 3: Agent Run Trigger', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate((t) => {
      localStorage.setItem('auth_token', t);
    }, mockToken);

    await page.goto('/agent');

    await expect(page.locator('aside >> text=Invoices')).toBeVisible();

    await expect(page.locator('text=AI Agent Control')).toBeVisible();

    const runBtn = page.locator('button:has-text("Run Agent Now")');
    await expect(runBtn).toBeEnabled();

    await runBtn.click();

    await expect(page.locator('text=Processing Batch...')).toBeVisible();
    await expect(page.locator('text=Agent Running...')).toBeVisible();
  });

  test('Path 4: Payment Link Creation', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate((t) => {
      localStorage.setItem('auth_token', t);
    }, mockToken);

    await page.goto('/invoices/invoice-1');

    await expect(page.locator('aside >> text=Invoices')).toBeVisible();

    await expect(page.locator('text=Loading invoice details...')).not.toBeVisible();

    await expect(page.locator('text=No active payment link generated yet.')).toBeVisible();

    const generateBtn = page.locator('button:has-text("Generate Payment Link")');
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    const linkInput = page.locator('input[title="https://payment.link/inv-001"]');
    await expect(linkInput).toBeVisible();
    await expect(linkInput).toHaveValue('https://payment.link/inv-001');

    await expect(page.locator('button:has-text("Copy")')).toBeVisible();
  });
});

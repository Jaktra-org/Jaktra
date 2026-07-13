# Runbook: Enabling Dispute & Inbound Reply Capture for Tenants

This document describes the step-by-step setup, verification, and troubleshooting operations required to configure and activate SendGrid Inbound Parse reply capture for tenants in Jaktra.

---

## 1. Prerequisites (One-Time, Per-Environment Setup)

Before onboarding any tenant, ensure that the hosting environment is configured with the required environment variables and migrations.

### Required Environment Variables (Backend)
Set these variables in the backend deployment environment (e.g. `.env` file, AWS ECS container definitions, or Kubernetes ConfigMap):

* **`INBOUND_PARSE_DOMAIN`**: The dedicated domain or subdomain where customer replies will be routed (e.g., `replies.jaktra.com`).
* **`SENDGRID_INBOUND_PARSE_SECRET`**: A cryptographically secure random string used as a shared secret in the webhook URL path to verify incoming requests from SendGrid.
* **`SENDGRID_API_KEY`**: Required for sending outbound follow-up emails via SendGrid.
* **`AI_ML_SERVICE_URL`**: The base URL of the Python AI-ML service (e.g., `http://localhost:8000`).
* **`AI_ML_SERVICE_KEY`**: The secret authentication key for calling the Python AI-ML service.

### Database Migrations
Ensure the database schema is up-to-date. In particular, migrations up to `0014_add_dns_verified_at` must be applied so that the `inbound_emails` table and the `dns_verified_at` and `inbound_blocked_by_admin` columns exist.
* Run migrations via:
  ```bash
  npm run db:migrate
  ```

---

## 2. Platform Setup Steps (One-Time)

Because Jaktra uses a **single shared `INBOUND_PARSE_DOMAIN`** across all tenants, you only need to configure DNS and SendGrid webhooks once for the entire platform instance:

### Step 1: Configure DNS MX Records
* Configure the MX records for the configured `INBOUND_PARSE_DOMAIN` subdomain (e.g., `replies.jaktra.com`) in your DNS provider.
* Point the MX records to SendGrid's receiving mail servers:
  * **Host/Name**: `replies` (or matching subdomain)
  * **Target/Value**: `mx.sendgrid.net.`
  * **Priority**: `10`

### Step 2: Configure Inbound Parse Webhook in SendGrid
1. Log in to the SendGrid Dashboard.
2. Navigate to **Settings** > **Inbound Parse**.
3. Click **Add Host & URL**.
4. Configure the following fields:
   * **Subdomain**: The subdomain part of `INBOUND_PARSE_DOMAIN` (e.g. `replies`).
   * **Domain**: The root domain part (e.g. `jaktra.com`).
   * **Destination URL**: The full webhook path containing the environment's webhook secret token:
     `https://<your-api-domain>/api/webhooks/sendgrid/inbound/<SENDGRID_INBOUND_PARSE_SECRET>`
   * **Raw Payload**: Ensure this is checked/supported (Jaktra utilizes `multer` to handle the multipart form-data forwarded by SendGrid).
5. Save the configuration.

---

## 3. Per-Tenant Self-Service Onboarding & Testing

Once the platform setup is complete, individual tenants can verify and activate capture themselves:

1. Log in to the Jaktra client dashboard as the tenant admin.
2. Navigate to **Settings** > **Email Config** tab.
3. Look at the **Inbound Reply Capture Configuration** panel.
4. Click **Run Verification Test**. Jaktra will send a verification test email to the requesting admin's email address.
5. In the admin's inbox, open the email `[Jaktra] Verify Inbound Reply Capture` and click **Reply**.
6. Send any text reply (e.g., "Confirming setup").
7. Once the reply is routed through the SendGrid pipeline, Jaktra will automatically verify the setup, record the `dns_verified_at` timestamp in the database, and clear the warning banner.
8. Verify that the Disputes queue no longer displays the warning banner.

---

## 4. How to Suspend Inbound Capture (Admin Kill-Switch)

If a tenant's sub-address is leaked or scraped, causing them to receive spam or run up LLM API costs, an admin can manually suspend/block inbound capture for that specific tenant:

1. Run this SQL query to block inbound capture:
   ```sql
   UPDATE tenant_settings 
   SET inbound_blocked_by_admin = true 
   WHERE tenant_id = '<tenant-uuid>';
   ```
2. **Immediate Effect**:
   * **Backend**: Any subsequent incoming emails for this tenant forwarded by SendGrid will be immediately and silently dropped by the backend service. No AI processing is executed and no database records are created. A warning log will appear: `Inbound email matched invoice <uuid> but tenant <tenant-uuid> is blocked by admin — dropping`.
3. To unblock:
   ```sql
   UPDATE tenant_settings 
   SET inbound_blocked_by_admin = false 
   WHERE tenant_id = '<tenant-uuid>';
   ```

---

## 5. Troubleshooting Ingestion Failures

If a tenant reports that customer replies are not appearing in their Disputes queue, troubleshoot in the following order:

### 1. Verify `SENDGRID_INBOUND_PARSE_SECRET` Configuration
* **Log Check**: Check backend server startup logs (stdout/stderr) for the following warning:
  `[WARN] SENDGRID_INBOUND_PARSE_SECRET is not configured. SendGrid inbound parse webhook will reject all incoming emails.`
* **Response Check**: If SendGrid attempts to POST to the webhook but receives a `200 OK` JSON response with `{ status: "ignored", reason: "invalid_secret" }`, it means the token configured in the SendGrid dashboard path does not match the server's `SENDGRID_INBOUND_PARSE_SECRET` variable.

### 2. Verify `INBOUND_PARSE_DOMAIN` was active during Outbound Send
* If `INBOUND_PARSE_DOMAIN` was not set in the backend environment variables at the time the follow-up email was sent, Jaktra will fall back to using the tenant's standard configured `replyTo` setting.
* Ask the client to verify the `Reply-To` header of the email they received. If it does not contain the `reply+<uuid>@...` prefix, the reply will be delivered to the tenant's normal inbox and won't trigger the webhook.

### 3. Check for Strict Sub-Address Drops (Option A behavior)
* By design, Jaktra's Option A matching policy is strict: any inbound email that does not match a valid, existing `invoice_id` UUID in the sub-address is silently dropped.
* Look at backend server warning logs for:
  * `Inbound email to <email> did not match tracking sub-address pattern — dropping`
  * `Inbound email matched tracking sub-address pattern but invoice ID <uuid> was not found — dropping`
* If these warnings appear, check whether the invoice was deleted, or if the client manually modified the email recipient address (e.g., removing the `+<uuid>` block).

### 4. Verify DNS/MX Propagation
* If no webhook requests are reaching the backend controller at all, verify DNS records.
* Run a dig check to verify the MX records for your subdomain:
  ```bash
  dig MX replies.yourdomain.com
  ```
  Ensure it resolves to SendGrid's mail servers.

---

## 6. Known Limitations (v1 Architecture)

Keep the following architectural constraints in mind during operations:
* **Evidence-Based Cleared Warning**: Once a tenant has at least one real `inbound_emails` record in the database, the warning banner clears permanently even if their DNS setup lapses.
* **No Inbound Rate Limiting**: The inbound parse endpoint is un-throttled. Use the `inbound_blocked_by_admin` database kill-switch to mitigate active spam incidents.
* **Strict Matching Only**: If a customer replies to the sender email address without using the sub-addressed `reply+<uuid>` header, the email will not be captured in the review queue.
* **Single-Pass Orchestration**: The system only classifies and drafts a response for the first reply. It does not maintain a multi-turn conversation thread.

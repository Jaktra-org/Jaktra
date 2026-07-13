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
Ensure the database schema is up-to-date. In particular, migrations up to `0013_add_inbound_emails` must be applied so that the `inbound_emails` table and the `tenant_settings.inbound_parse_active` column exist.
* Run migrations via:
  ```bash
  npm run db:migrate
  ```

---

## 2. Per-Tenant Onboarding Steps

To enable dispute capture for a specific tenant, the operations team must execute the following setup sequence:

### Step 1: Sub-domain & Global Architecture Check
* Jaktra uses a **single shared `INBOUND_PARSE_DOMAIN`** across all tenants. 
* Outbound emails for any tenant will automatically have their `replyTo` header overridden to:
  `reply+<invoiceId>@${INBOUND_PARSE_DOMAIN}` (e.g. `reply+123e4567-e89b-12d3-a456-426614174000@replies.jaktra.com`).
* You do **not** need a separate parse domain per tenant.

### Step 2: Configure DNS MX Records
* Configure the MX records for the configured `INBOUND_PARSE_DOMAIN` subdomain (e.g., `replies.jaktra.com`) in your DNS provider.
* Point the MX records to SendGrid's receiving mail servers:
  * **Host/Name**: `replies` (or matching subdomain)
  * **Target/Value**: `mx.sendgrid.net.` **[VERIFY AGAINST SENDGRID DOCS BEFORE USE]**
  * **Priority**: `10`

### Step 3: Configure Inbound Parse Webhook in SendGrid
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

### Step 4: Enable the Tenant Flag in the Database
Because there is no tenant-facing self-service toggle in v1, the ops team must manually activate the flag in the database:
* Connect to your database instance and execute:
  ```sql
  UPDATE tenant_settings 
  SET inbound_parse_active = true 
  WHERE tenant_id = '<tenant-uuid>';
  ```

### Step 5: End-to-End Verification
1. Log in to the Jaktra client dashboard as the tenant admin/manager.
2. Navigate to the **Disputes** tab. Confirm that the yellow warning banner (`"Automatic Inbound Reply Capture Inactive"`) is **no longer visible**.
3. Create a test invoice with a valid client email address that you control.
4. Trigger or send a collection follow-up email.
5. In the email inbox of the client, verify that the `Reply-To` address is present and has the format: `reply+<invoice-uuid>@<your-inbound-domain>`.
6. Send a reply (e.g. *"I dispute this invoice amount because it is incorrect"*).
7. Wait a few moments and verify:
   * The reply was ingested by the webhook.
   * A new pending dispute card appears in the tenant's **Disputes Review Queue** with the draft classification, confidence score, and AI-suggested response.

---

## 3. Troubleshooting Ingestion Failures

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

## 4. How to Deactivate Dispute Capture

To immediately suspend automatic reply capture, stop background AI processing, and alert the tenant:
1. Run this SQL query to toggle the settings flag:
   ```sql
   UPDATE tenant_settings 
   SET inbound_parse_active = false 
   WHERE tenant_id = '<tenant-uuid>';
   ```
2. **Immediate Effect**: 
   * **Backend**: Any incoming emails for this tenant forwarded by SendGrid will be immediately and silently dropped by the backend service. No AI processing is executed and no database records are created. A warning log will appear: `Inbound email matched invoice <uuid> but tenant <tenant-uuid> does not have inboundParseActive enabled — dropping`.
   * **Frontend**: The Disputes page will display the yellow warning banner advising the tenant to monitor their inbox manually.

---

## 5. Known Limitations (v1 Architecture)

Keep the following architectural constraints in mind during operations:
* **No Self-Service Control**: Tenants cannot toggle the feature on/off or change their incoming sub-domain.
* **No Inbound Rate Limiting**: The inbound parse endpoint is un-throttled. If the sub-address format is leaked, it could lead to spam emails populating the queue.
* **Strict Matching Only**: If a customer replies to the sender email address without using the sub-addressed `reply+<uuid>` header, the email will not be captured in the review queue.
* **Single-Pass Orchestration**: The system only classifies and drafts a response for the first reply. It does not maintain a multi-turn conversation thread.

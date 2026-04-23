### Documentation: Configuring GitHub Secrets for CI/CD Pipeline

This document explains how to configure the required tokens and environment variables as GitHub Secrets for your CI/CD pipeline. Each section details what the secret is, where to get it, and how to add it to GitHub. Follow these steps carefully to ensure your pipeline functions correctly.

---

#### Table of Contents

1. [Environment-Specific API URLs](#1-environment-specific-api-urls)
2. [Vercel Deployment Tokens](#2-vercel-deployment-tokens)
3. [GitHub Personal Access Token](#3-github-personal-access-token)
4. [Monitoring Service Configuration (Datadog or Alternative)](#4-monitoring-service-configuration-datadog-or-alternative)
5. [Email Notification Settings](#5-email-notification-settings)
6. [How to Add Secrets to GitHub](#6-how-to-add-secrets-to-github)

---

#### 1. Environment-Specific API URLs

These secrets specify the API endpoints for your application in different environments (development, staging, production).

- **`NEXT_PUBLIC_API_URL_DEV`**: API URL for the development environment.
- **`NEXT_PUBLIC_API_URL_STAGING`**: API URL for the staging environment.
- **`NEXT_PUBLIC_API_URL_PROD`**: API URL for the production environment.

**Where to Get Them:**  
These URLs are typically provided by your development team or can be found in your API documentation. They point to the respective API services for each environment.

**Examples:**

- `https://api.dev.example.com` (development)
- `https://api.staging.example.com` (staging)
- `https://api.example.com` (production)

---

#### 2. Vercel Deployment Tokens

These secrets are required to deploy your application to Vercel.

- **`VERCEL_TOKEN`**: Authentication token for Vercel.
- **`VERCEL_ORG_ID`**: Your Vercel organization ID.
- **`VERCEL_PROJECT_ID`**: Your Vercel project ID.
- **`VERCEL_SCOPE`** (optional): Scope for the deployment (e.g., team or user).

**Where to Get Them:**

- **`VERCEL_TOKEN`**:

  1. Log in to your [Vercel account](https://vercel.com/).
  2. Go to **Settings > Tokens**.
  3. Click **Create Token**, give it a name (e.g., "GitHub CI/CD"), and copy the token.

- **`VERCEL_ORG_ID`**:

  1. In Vercel, go to your team settings or run the following command in your terminal:
     ```bash
     vercel org list
     ```
  2. Copy your organization ID from the output.

- **`VERCEL_PROJECT_ID`**:

  1. In Vercel, go to your project settings or run:
     ```bash
     vercel project list
     ```
  2. Copy your project ID from the output.

- **`VERCEL_SCOPE`** (if needed):
  - This is usually your Vercel team slug or your username. Check your Vercel team settings for the correct value.

---

#### 3. GitHub Personal Access Token

- **`GH_PAT`**: A GitHub token used for tasks like setting up uptime monitoring with Upptime.

**Where to Get It:**

1. Go to your [GitHub account settings](https://github.com/settings/tokens).
2. Click **Developer settings > Personal access tokens**.
3. Click **Generate new token**.
4. Name the token (e.g., "Uptime Monitoring").
5. Select the following scopes:
   - `repo`
   - `workflow`
6. Click **Generate token** and copy the token immediately (it won’t be shown again).

---

#### 4. Monitoring Service Configuration (Datadog or Alternative)

This section assumes you are using Datadog for monitoring. If you prefer an alternative (e.g., New Relic, Prometheus, Sentry), replace the secrets accordingly and refer to that service’s documentation.

##### For Datadog:

- **`DATADOG_API_URL`**: The Datadog API endpoint.
- **`DATADOG_API_KEY`**: Your Datadog API key.

**Where to Get Them:**

- **`DATADOG_API_URL`**:

  - For the US region: `https://api.datadoghq.com`
  - For other regions, refer to the [Datadog API documentation](https://docs.datadoghq.com/api/).

- **`DATADOG_API_KEY`**:
  1. Log in to your [Datadog account](https://app.datadoghq.com/).
  2. Go to **Integrations > APIs**.
  3. Under **API Keys**, click **New Key**, name it, and copy the key.

##### For Alternatives:

- Replace `DATADOG_API_URL` and `DATADOG_API_KEY` with the equivalent secrets for your chosen monitoring service (e.g., `NEW_RELIC_API_KEY`).
- Refer to the documentation of your selected service for setup instructions.

---

#### 5. Email Notification Settings

These secrets are used to send email notifications about deployment status.

- **`SMTP_SERVER`**: Your SMTP server address.
- **`SMTP_USERNAME`**: Username for SMTP authentication (often your email address).
- **`SMTP_PASSWORD`**: Password for SMTP authentication.
- **`NOTIFICATION_EMAIL`**: The email address to receive deployment notifications.

**Where to Get Them:**

- **`SMTP_SERVER`**:

  - For Gmail: `smtp.gmail.com`
  - For Outlook: `smtp.office365.com`
  - Check your email provider’s documentation for the correct server.

- **`SMTP_USERNAME`**: Your email address or SMTP username.
- **`SMTP_PASSWORD`**: Your email password or an app-specific password.

  - **For Gmail**: If you have 2-factor authentication enabled, generate an app password [here](https://support.google.com/accounts/answer/185833).

- **`NOTIFICATION_EMAIL`**: The email address where you want to receive notifications (e.g., your team’s email).

**Note:** If using Gmail with 2-factor authentication, you must use an app-specific password instead of your regular password.

---

#### 6. How to Add Secrets to GitHub

Once you have all the required values, follow these steps to add them as GitHub Secrets:

1. Go to your GitHub repository.
2. Click **Settings** (located in the top-right corner).
3. In the left sidebar, select **Secrets and variables > Actions**.
4. Click **New repository secret**.
5. Enter the **Name** of the secret (e.g., `VERCEL_TOKEN`).
6. Enter the **Value** (e.g., the token you copied).
7. Click **Add secret**.
8. Repeat this process for each secret listed above.

**Important:**

- The secret names must match exactly (case-sensitive) as they are referenced in the workflow file.
- Example of how secrets are used in the workflow:
  ```yaml
  env:
    NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL_DEV }}
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  ```

# Firebase Cloud Functions Deployment Guide

Follow these steps to deploy the Cloud Functions for the Zoku AI Productivity Tracker.

## 1. Prerequisites

Ensure you have the Firebase CLI installed and logged in:
```bash
npm install -g firebase-tools
firebase login
```

## 2. Install Dependencies

Navigate to the functions directory and install dependencies:
```bash
cd functions
npm install
```

## 3. Set Environment Secrets

**CRITICAL:** You must set the following secrets for the functions to work. Run these commands from the root directory or functions directory:

```bash
# Supabase Configuration
firebase functions:secrets:set SUPABASE_URL
# When prompted, paste your Supabase Project URL

firebase functions:secrets:set SUPABASE_SERVICE_KEY
# When prompted, paste your Supabase Service Role Key (NOT the anon key)

# AI Configuration
firebase functions:secrets:set GEMINI_API_KEY
# When prompted, paste your Google Gemini API Key
```

## 4. Local Testing (Optional)

To test locally with emulators, you need Java installed.

1. Create a `.env` file in `functions/` with the following content (replace with actual values):
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
   *Note: For emulators, you can also use `.secret.local` but `defineSecret` behavior varies. Using `.env` is often simpler for params.*

2. Run emulators:
   ```bash
   firebase emulators:start
   ```

## 5. Deployment

To deploy all functions:

```bash
firebase deploy --only functions
```

This ensures that only the Cloud Functions are deployed, leaving your Hosting and Firestore rules as is (unless you want to deploy those too).

## 6. Verification

After deployment, check the logs to ensure functions initialized correctly:

```bash
firebase functions:log
```

## Troubleshooting

- **Build Fails**: Run `npm run build` in `functions/` folder to see TypeScript errors.
- **Quota Exceeded**: Ensure your Firebase project is on the Blaze (pay-as-you-go) plan, which is required for external network requests (Supabase, Gemini) and Cloud Functions.
- **Missing Secrets**: If runtime errors occur saying secrets are missing, verify them with `firebase functions:secrets:list`.

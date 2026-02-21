# Mailgun Setup Guide for Embraze

## Step 1: Create Mailgun Account

1. Go to [Mailgun](https://www.mailgun.com/)
2. Click "Sign Up" (Free tier: 5,000 emails/month)
3. Verify your email address
4. Complete account setup

## Step 2: Get Your Mailgun Credentials

1. Log in to Mailgun dashboard
2. Go to "Sending" → "Domains"
3. You'll see a sandbox domain (e.g., `sandboxXXXXX.mailgun.org`)
4. Click on the domain
5. Find your:
   - **Domain**: `sandboxXXXXX.mailgun.org` (or your custom domain)
   - **API Key**: Click "API Keys" in the sidebar, copy the "Private API key"

## Step 3: Add Authorized Recipients (Sandbox Domain Only)

If using the sandbox domain, you must authorize recipient emails:

1. In Mailgun dashboard, go to your sandbox domain
2. Scroll to "Authorized Recipients"
3. Add each emergency contact email address
4. They'll receive a confirmation email - must click to authorize

**Note**: To send to any email without authorization, you need to:
- Add a custom domain (requires DNS setup)
- Or upgrade to a paid plan

## Step 4: Set Up Firebase Secrets

Set your Mailgun credentials as Firebase secrets:

```bash
# Navigate to your project
cd Embraze

# Set Mailgun API Key
firebase functions:secrets:set MAILGUN_API_KEY
# When prompted, paste your Mailgun Private API Key

# Set Mailgun Domain
firebase functions:secrets:set MAILGUN_DOMAIN
# When prompted, paste your domain (e.g., sandboxXXXXX.mailgun.org)
```

## Step 5: Deploy Cloud Functions

Deploy your functions to Firebase:

```bash
firebase deploy --only functions
```

This will:
- Upload your Cloud Function code
- Set up the trigger for new emergency alerts
- Make the function live

## Step 6: Test the Setup

1. Sign in to your Embraze app
2. Add an emergency contact in Settings (use an authorized email if using sandbox)
3. Click "Ask for Help" button
4. Check the emergency contact's email inbox

## Email Template Preview

Your emergency contacts will receive a beautiful HTML email with:
- 🚨 Emergency alert header
- Contact's name and details
- 📍 Location address
- 📞 Phone number
- 🕐 Timestamp
- Button to view location on Google Maps
- Coordinates for reference

## Troubleshooting

### Emails not sending?

1. **Check Firebase Functions logs:**
   ```bash
   firebase functions:log
   ```

2. **Verify secrets are set:**
   ```bash
   firebase functions:secrets:access MAILGUN_API_KEY
   firebase functions:secrets:access MAILGUN_DOMAIN
   ```

3. **Check Mailgun logs:**
   - Go to Mailgun dashboard → "Sending" → "Logs"
   - Look for failed deliveries

4. **Sandbox domain issues:**
   - Make sure recipient emails are authorized
   - Check spam folder
   - Consider setting up a custom domain

### Function deployment errors?

1. **Make sure you're on the Blaze (pay-as-you-go) plan:**
   - Cloud Functions require the Blaze plan
   - Free tier available (generous limits)
   - Go to Firebase Console → Upgrade

2. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be 18 or higher

## Cost Estimates

### Mailgun (Free Tier)
- 5,000 emails/month: **FREE**
- After that: $0.80 per 1,000 emails

### Firebase Cloud Functions (Free Tier)
- 2M invocations/month: **FREE**
- 400,000 GB-seconds: **FREE**
- 200,000 CPU-seconds: **FREE**

**Estimated cost for 100 emergency alerts/month with 3 contacts each:**
- Emails: 300/month = **FREE** (well under 5,000 limit)
- Function invocations: 100/month = **FREE**
- **Total: $0/month**

## Setting Up Custom Domain (Optional)

For production use without email authorization:

1. **Add your domain in Mailgun:**
   - Go to "Sending" → "Domains" → "Add New Domain"
   - Enter your domain (e.g., `alerts.yourdomain.com`)

2. **Add DNS records:**
   - Mailgun will provide TXT and CNAME records
   - Add these to your domain's DNS settings
   - Wait for verification (can take up to 48 hours)

3. **Update Firebase secret:**
   ```bash
   firebase functions:secrets:set MAILGUN_DOMAIN
   # Enter your custom domain
   ```

4. **Redeploy:**
   ```bash
   firebase deploy --only functions
   ```

## Next Steps

After setup:
- ✅ Emergency contacts receive instant email alerts
- ✅ Emails include location, phone, and map link
- ✅ Beautiful, professional email template
- ✅ Automatic delivery when help button is pressed
- ✅ No manual intervention needed

## Support

- Mailgun Docs: https://documentation.mailgun.com/
- Firebase Functions: https://firebase.google.com/docs/functions
- Need help? Check Firebase Console logs and Mailgun dashboard

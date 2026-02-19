# Resend Setup Guide for Embraze

## Why Resend?
- ✅ 100 emails/day FREE (3,000/month)
- ✅ No credit card required
- ✅ Modern, developer-friendly API
- ✅ No recipient authorization needed
- ✅ Better than Mailgun for small projects

## Step 1: Upgrade Firebase to Blaze Plan

Cloud Functions require the Blaze (pay-as-you-go) plan, but it's FREE for your usage:

1. Go to: https://console.firebase.google.com/project/embraze-react-e49c0/usage/details
2. Click "Upgrade to Blaze"
3. Add payment method (required but won't be charged)
4. Set budget alerts (optional, recommended: $5/month)

**Free Tier Limits (you won't exceed these):**
- 2M function invocations/month
- 400,000 GB-seconds
- 200,000 CPU-seconds
- **Estimated cost for 100 alerts/month: $0**

## Step 2: Set Resend API Key

Your API key: `re_e8H2ARtE_6giYeKtThxt89ww62jLnj8At`

Set it as a Firebase secret:

```bash
cd Embraze-react
echo "re_e8H2ARtE_6giYeKtThxt89ww62jLnj8At" | firebase functions:secrets:set RESEND_API_KEY
```

Or manually:
```bash
firebase functions:secrets:set RESEND_API_KEY
# When prompted, paste: re_e8H2ARtE_6giYeKtThxt89ww62jLnj8At
```

## Step 3: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

This will:
- Upload your Cloud Function
- Set up automatic email sending
- Make it live

## Step 4: Test It!

1. Sign in to Embraze
2. Go to Settings → Add emergency contact
3. Click "Ask for Help" button
4. Check the contact's email inbox

## Email Features

Your emergency contacts will receive:
- 🚨 Beautiful gradient header
- Contact's name and emergency details
- 📍 Location address
- 📞 Phone number
- 🕐 Timestamp
- Button to view location on Google Maps
- Professional HTML design

## Troubleshooting

### "Must be on Blaze plan" error?
- Upgrade at: https://console.firebase.google.com/project/embraze-react-e49c0/usage/details
- Don't worry, it's free for your usage!

### Emails not sending?
1. Check Firebase Functions logs:
   ```bash
   firebase functions:log
   ```

2. Verify secret is set:
   ```bash
   firebase functions:secrets:access RESEND_API_KEY
   ```

3. Check Resend dashboard:
   - Go to https://resend.com/emails
   - View sent emails and delivery status

### Function deployment fails?
1. Make sure you're logged in:
   ```bash
   firebase login
   ```

2. Check you're using the right project:
   ```bash
   firebase use embraze-react-e49c0
   ```

## Resend Dashboard

Access your Resend dashboard at: https://resend.com/

Here you can:
- View all sent emails
- Check delivery status
- See email opens (if enabled)
- Monitor your usage (100/day limit)

## Upgrading Resend (Optional)

If you need more than 100 emails/day:
- **Pro Plan**: $20/month for 50,000 emails/month
- **Business Plan**: Custom pricing

But for emergency alerts, free tier is plenty!

## Cost Breakdown

### Resend
- 0-100 emails/day: **FREE**
- After: $20/month for 50,000/month

### Firebase Blaze Plan
- First 2M invocations: **FREE**
- After: $0.40 per million

**For 100 emergency alerts/month with 3 contacts each:**
- Emails: 300/month = **FREE** (10/day average)
- Functions: 100/month = **FREE**
- **Total: $0/month**

## Custom Domain (Optional)

To send from your own domain (e.g., alert@yourdomain.com):

1. Go to Resend dashboard → Domains
2. Add your domain
3. Add DNS records (provided by Resend)
4. Update function code:
   ```javascript
   from: "Embraze Alert <alert@yourdomain.com>"
   ```

## Next Steps

After deployment:
- ✅ Emails send automatically when help button is pressed
- ✅ No manual intervention needed
- ✅ Beautiful, professional emails
- ✅ Instant delivery
- ✅ Track delivery in Resend dashboard

## Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- Firebase Functions: https://firebase.google.com/docs/functions

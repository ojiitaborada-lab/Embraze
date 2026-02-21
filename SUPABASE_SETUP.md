# Supabase Magic Link Setup Guide

This guide will help you set up Supabase for magic link email authentication in Embraze.

## Prerequisites
- A Supabase account (sign up at https://supabase.com)

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: Embraze (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Replace the placeholder values with your actual credentials from Step 2

## Step 4: Configure Email Settings (Optional but Recommended)

By default, Supabase uses their email service, but you can configure your own SMTP:

1. Go to **Authentication** → **Email Templates**
2. Customize the magic link email template if desired
3. For custom SMTP, go to **Settings** → **Auth** → **SMTP Settings**

### Recommended Email Template Customization:

**Subject**: Sign in to Embraze

**Body**:
```html
<h2>Welcome to Embraze!</h2>
<p>Click the link below to sign in to your account:</p>
<p><a href="{{ .ConfirmationURL }}">Sign in to Embraze</a></p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this email, you can safely ignore it.</p>
```

## Step 5: Configure Auth Settings

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - **Site URL**: `http://localhost:5173` (for development)
   - For production, add your production URL (e.g., `https://yourdomain.com`)
3. Add redirect URLs:
   - `http://localhost:5173`
   - Your production URL

## Step 6: Test Magic Link Authentication

1. Start your development server: `npm run dev`
2. Go to the login screen
3. Enter your email address
4. Click "Continue with Email"
5. Check your email for the magic link
6. Click the link to sign in

## Step 7: Configure Rate Limiting (Recommended)

To prevent abuse:

1. Go to **Authentication** → **Rate Limits**
2. Configure appropriate limits:
   - **Email sends per hour**: 4-6 (prevents spam)
   - **Sign-in attempts per hour**: 10-20

## Troubleshooting

### Magic link not received?
- Check your spam folder
- Verify the email address is correct
- Check Supabase logs: **Authentication** → **Logs**
- Ensure your email provider isn't blocking Supabase emails

### "Invalid credentials" error?
- Double-check your `.env` file has the correct values
- Restart your development server after changing `.env`
- Verify the credentials in Supabase dashboard

### Link expired?
- Magic links expire after 1 hour by default
- Request a new magic link

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use different projects** for development and production
3. **Enable RLS (Row Level Security)** on your Supabase tables
4. **Configure rate limiting** to prevent abuse
5. **Use custom email templates** to match your brand

## Integration with Firebase

Embraze uses both Supabase (for authentication) and Firebase (for real-time data):
- **Supabase**: Handles user authentication (magic links, Google OAuth)
- **Firebase**: Stores user profiles, emergency alerts, and family data

When a user signs in with Supabase, their user ID is used to create/fetch their Firebase profile.

## Next Steps

- Configure Google OAuth (see FIREBASE_SETUP.md)
- Set up email templates to match your brand
- Configure production environment variables
- Test the complete authentication flow

## Support

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com

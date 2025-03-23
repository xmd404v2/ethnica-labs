# Deploying Ethnica to Vercel

This guide provides step-by-step instructions for deploying the Ethnica application to Vercel.

## Prerequisites

1. A GitHub, GitLab, or Bitbucket account where your project is hosted
2. A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub, GitLab, or Bitbucket account)
3. A PostgreSQL database (options detailed below)

## Step 1: Prepare Your Database

You'll need a PostgreSQL database that's accessible from Vercel's servers. Here are some options:

### Option 1: Vercel Postgres (Recommended)
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Click on "Storage" → "Create Postgres Database"
- Follow the setup instructions
- Vercel will automatically add the connection details to your project environment

### Option 2: Other PostgreSQL Providers
- [Supabase](https://supabase.com/) - Offers a generous free tier
- [Railway](https://railway.app/) - Developer-friendly platform
- [Neon](https://neon.tech/) - Serverless Postgres with a free tier
- [ElephantSQL](https://www.elephantsql.com/) - PostgreSQL as a service

Make note of your database connection string, which will look like this:
```
postgresql://username:password@hostname:port/database
```

## Step 2: Prepare Your Repository

Ensure your code is committed and pushed to your Git repository.

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

## Step 3: Deploy to Vercel

1. Visit [Vercel](https://vercel.com) and sign up or log in
2. Click on "Add New..." → "Project"
3. Connect to your Git provider and select your Ethnica repository
4. Configure the deployment settings:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: ./
   - **Build Command**: next build
   - **Environment Variables**: Add the following variables
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `NEXTAUTH_SECRET`: Generate a secure string with `openssl rand -base64 32`
     - `NEXTAUTH_URL`: Initially set to `https://your-project-name.vercel.app` (update after deployment)
     - `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox API token
     - `NEXT_PUBLIC_PRIVY_APP_ID`: Your Privy App ID
5. Click "Deploy"

## Step 4: Run Database Migrations

After the initial deployment:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" → "Deployments" → Latest deployment
3. Click on "Functions" tab
4. Select "Running functions" option
5. Click "New Command"
6. Run: `npx prisma migrate deploy`
7. Wait for the command to complete

## Step 5: Verify Your Deployment

1. Open your deployed application URL (shown in the Vercel dashboard)
2. Test key functionality to ensure everything works correctly
3. If you encounter any issues, check the "Logs" section in the Vercel dashboard

## Step 6: Set Up Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Settings" → "Domains"
2. Add your custom domain and follow the DNS configuration instructions
3. After configuring your custom domain, update the `NEXTAUTH_URL` environment variable to match

## Troubleshooting Common Issues

### Database Connection Errors

- Ensure your database is publicly accessible or has Vercel's IP addresses whitelisted
- Double-check your connection string in the environment variables
- If using Prisma, try running `prisma db push` for schema updates

### Build Errors

- Check build logs in the Vercel dashboard
- Ensure all dependencies are correctly specified in your package.json
- Verify that your Next.js configuration is compatible with Vercel

### Authentication Issues

- Make sure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are correctly set
- If using social logins, verify callback URLs are correctly configured

## Continuous Deployment

With Vercel's GitHub integration, any changes pushed to your main branch will automatically trigger a new deployment. You can configure specific branches and deployment rules in the Vercel project settings.

## Useful Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js on Vercel](https://next-auth.js.org/deployment)
- [Mapbox Documentation](https://docs.mapbox.com/) 
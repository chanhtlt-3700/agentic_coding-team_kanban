# Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
- GitHub account
- Vercel account
- Supabase project

### Step-by-Step Deployment

#### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Team Kanban application"
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### 2. Deploy to Vercel

**Option A: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

6. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

#### 3. Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_APP_URL` environment variable

## CloudFlare Workers Deployment (Alternative)

### Using Next.js with CloudFlare Pages

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to CloudFlare
wrangler login

# Build for CloudFlare
npm run build

# Deploy
wrangler pages publish .next
```

### Environment Variables

Add in CloudFlare Dashboard:
- Settings → Environment Variables
- Add the same variables as Vercel

## Database Setup

Your Supabase database is already hosted. Ensure:

1. **Run all migrations** in Supabase SQL Editor
2. **Enable RLS** on all tables
3. **Configure Auth** settings
4. **Set up Email** provider for password reset

## Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Database migrations are applied
- [ ] Authentication works (test signup/login)
- [ ] Can create boards
- [ ] Can create lists
- [ ] Can create and drag cards
- [ ] RLS policies work correctly
- [ ] No console errors

## Monitoring and Maintenance

### Vercel Analytics

Enable in Vercel Dashboard:
- Analytics → Enable

### Error Tracking

Consider adding Sentry:

```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

### Performance Monitoring

```bash
# Add Web Vitals tracking
npm install web-vitals
```

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working

- Redeploy after adding/changing env vars
- Check variable names match exactly
- Restart deployment

### Database Connection Issues

- Verify Supabase URL and keys
- Check RLS policies
- Ensure migrations are applied

### CORS Errors

Add to next.config.ts:

```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
      ],
    },
  ]
}
```

## Scaling Considerations

### Database
- Supabase automatically scales
- Consider upgrading plan for production
- Enable database backups

### Frontend
- Vercel Edge Network handles scaling
- No additional configuration needed
- Consider Pro plan for higher limits

### Performance
- Enable ISR for static pages
- Use Server Components where possible
- Optimize images with next/image

## Security

### Before Production

- [ ] Enable HTTPS only
- [ ] Set secure cookie settings
- [ ] Configure CSP headers
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Regular dependency updates

### Supabase Security

- [ ] Enable MFA for admin account
- [ ] Review RLS policies
- [ ] Set up audit logs
- [ ] Configure IP restrictions (if needed)

## Cost Estimation

### Free Tier (Sufficient for Learning/Small Projects)

- **Vercel**: Free tier includes:
  - Unlimited deployments
  - 100GB bandwidth
  - Serverless functions

- **Supabase**: Free tier includes:
  - 500MB database
  - 1GB file storage
  - 50K monthly active users

### Paid Plans (Production)

- **Vercel Pro**: $20/month
  - More bandwidth
  - Advanced analytics
  - Team features

- **Supabase Pro**: $25/month
  - 8GB database
  - 100GB file storage
  - Daily backups

## Continuous Deployment

### Auto-Deploy from GitHub

Vercel automatically deploys:
- Main branch → Production
- Other branches → Preview

### Preview Deployments

Every PR gets a preview URL:
- Test changes before merging
- Share with team for review

## Backup Strategy

### Database Backups

Supabase Pro includes:
- Daily automatic backups
- Point-in-time recovery

### Code Backups

- GitHub as source of truth
- Tag releases: `git tag v1.0.0`
- Create releases in GitHub

## Support

For deployment issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

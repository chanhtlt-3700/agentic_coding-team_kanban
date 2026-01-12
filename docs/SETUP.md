# Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Database Migrations

Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Option B: Manual Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order from `supabase/migrations/`:
   - `20260112000001_create_profiles.sql`
   - `20260112000002_create_boards.sql`
   - `20260112000003_create_lists.sql`
   - `20260112000004_create_cards.sql`
   - `20260112000005_create_comments.sql`
   - `20260112000006_create_activities.sql`
   - `20260112000007_create_functions.sql`

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Create Your First Account

1. Navigate to `/register`
2. Create an account
3. Start using the Kanban board!

## Project Structure

```
kanban/
├── docs/                    # Documentation
│   ├── SPECIFICATION.md     # Product specification
│   ├── DATABASE.md          # Database schema
│   └── API.md              # API documentation
├── src/
│   ├── app/                # Next.js app directory
│   │   ├── (auth)/         # Authentication pages
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── boards/         # Board pages
│   │   └── api/            # API routes
│   ├── components/         # React components
│   ├── lib/                # Utilities and helpers
│   └── types/              # TypeScript types
├── supabase/
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## Features Implemented

✅ User authentication (register, login, logout)
✅ Board creation and management
✅ List management with default lists
✅ Card creation with drag & drop
✅ Card assignments
✅ Comments system
✅ Activity logging
✅ Row Level Security (RLS)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
vercel
```

### Deploy Database

Your Supabase database is already hosted. Just ensure:
- All migrations are applied
- RLS policies are enabled
- Environment variables are set in Vercel

## Troubleshooting

### Cannot connect to Supabase

- Check your environment variables
- Ensure Supabase project is active
- Verify API keys are correct

### Database errors

- Run migrations in correct order
- Check RLS policies are enabled
- Verify user has correct permissions

### Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Development Tips

### Type Safety

- TypeScript types are auto-generated from database
- Use `Database` type for Supabase queries
- Validate inputs with Zod schemas

### Database Changes

1. Create new migration file
2. Apply changes via Supabase CLI or SQL Editor
3. Update TypeScript types if needed

### Testing

- Test authentication flow first
- Verify RLS policies work correctly
- Check drag & drop on different browsers

## Next Steps

- [ ] Add real-time subscriptions
- [ ] Implement search functionality
- [ ] Add file attachments
- [ ] Create mobile app
- [ ] Add board templates
- [ ] Implement notifications

## Support

For issues or questions:
- Check documentation in `/docs`
- Review Supabase docs
- Check Next.js documentation

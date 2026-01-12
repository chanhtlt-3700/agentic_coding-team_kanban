# Team Kanban Board

A modern, collaborative Kanban board application built with Next.js, TypeScript, and Supabase.

## 📋 Overview

Team Kanban is a powerful yet simple task management application that helps teams organize their work using the Kanban methodology. Create boards, lists, and cards, then drag and drop them to track progress from "To Do" through "In Progress" to "Done".

## ✨ Features

- **Board Management**: Create and manage multiple Kanban boards
- **List/Column Management**: Organize work into customizable lists (To Do, In Progress, Done, etc.)
- **Task Cards**: Create detailed task cards with descriptions
- **Drag & Drop**: Intuitive drag-and-drop interface to move cards between lists
- **Comments**: Add comments to cards for team communication
- **Task Assignment**: Assign team members to specific tasks
- **Activity Log**: Track all changes and activities on boards and cards
- **Real-time Updates**: See changes as they happen with real-time synchronization
- **User Authentication**: Secure login and user management

## 🛠️ Technology Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Drag & Drop**: dnd-kit
- **Deployment**: Vercel

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd kanban

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## 🚀 Deployment

This application can be easily deployed to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 📖 Documentation

- [Product Specification](./docs/SPECIFICATION.md)
- [Database Schema](./docs/DATABASE.md)
- [API Documentation](./docs/API.md)
- [User Guide](./docs/USER_GUIDE.md)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 License

MIT

## 👥 Author

Developed as part of GitHub Copilot Agent Mode learning exercise.

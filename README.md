# Create Next Prisma

A modern Next.js template with Prisma ORM, PostgreSQL, Tailwind CSS, and TypeScript. Perfect for building full-stack applications with a robust database layer.

## Quick Start

Create a new Next.js + Prisma project:

```bash
npx @waiyanmt/next-prisma my-app
# or if installed globally
create-next-prisma my-app
cd my-app
```

## What's Included

- **Next.js 16** with App Router
- **Prisma ORM** with PostgreSQL adapter
- **Tailwind CSS v4** for styling
- **TypeScript** for type safety
- **ESLint** for code quality
- Pre-configured **User** and **Post** models
- Database connection setup
- API routes example

## Setup

1. **Install dependencies** (already done by the CLI):
   ```bash
   npm install
   ```

2. **Set up your database**:
   Copy `.env.example` to `.env` and update your database URL:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/myapp?schema=public"
   ```

3. **Run database migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio
- `npx prisma migrate dev` - Create and apply migrations

## Project Structure

```
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── lib/                # Utility functions
│   ├── prisma.ts       # Prisma client
│   └── utils.ts        # Helper functions
├── prisma/             # Database schema and migrations
│   └── schema.prisma   # Prisma schema
├── public/             # Static assets
└── tests/              # Test files
```

## Database Schema

The template includes two basic models:

- **User**: id, email, name, posts, timestamps
- **Post**: id, title, content, published, author, timestamps

## Customization

- Modify `prisma/schema.prisma` to add your own models
- Update the UI in `app/page.tsx` to match your design
- Add authentication, API routes, or other features as needed

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Contributing

This is a template repository. To modify the template:

1. Make your changes
2. Test with: `npm run dev`
3. Update this README if needed
4. Publish to npm: `npm publish`

## License

MIT

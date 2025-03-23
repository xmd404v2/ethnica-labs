[![Netlify Status](https://api.netlify.com/api/v1/badges/b6e60398-7921-49a7-bb0d-e70304031e21/deploy-status)](https://app.netlify.com/sites/ethnica-labs/deploys)

# Ethnica - Support Your Tribe & Grow Local Economies

Ethnica is a web application that helps users discover and support businesses that align with their values and demographics. The platform allows users to find businesses on a map, read reviews from people with similar backgrounds, and search for establishments based on their preferences.

## Features

- **Interactive Map**: Discover businesses near you using Mapbox integration
- **Demographic Matching**: See reviews from people with similar backgrounds and preferences first
- **Value-Based Search**: Find businesses that match your values and priorities
- **User Profiles**: Create a semi-anonymous profile with demographic information
- **Reviews System**: Leave and read authentic reviews from the community

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (built on Radix UI)
- **Database**: PostgreSQL with Prisma ORM
- **Maps**: Mapbox GL
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Mapbox API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ethnica.git
   cd ethnica
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the database connection string and Mapbox API key

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

To deploy the application to Vercel:

1. Push your code to a GitHub repository

2. Visit [Vercel](https://vercel.com) and sign up or log in

3. Click "Add New..." and select "Project"

4. Import your GitHub repository

5. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: next build
   - Output Directory: .next

6. Set up environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox API token
   - `NEXT_PUBLIC_PRIVY_APP_ID`: Your Privy App ID
   - `DATABASE_URL`: Your production database connection string
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth
   - `NEXTAUTH_URL`: Your deployed application URL

7. Click "Deploy" and wait for the build to complete

You can also use the Vercel CLI for more advanced deployment options:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and shared code
- `/prisma` - Database schema and migrations
- `/public` - Static assets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or feedback, please contact the team at team@ethni.ca.

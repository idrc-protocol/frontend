# IDRC Protocol - Frontend

A web application for the IDRC Protocol, a tokenized Real World Assets (RWA) platform.

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **React**: 19.1.1
- **TypeScript**: 5.9.2
- **Styling**: Tailwind CSS 4.1.13
- **UI Components**: Radix UI primitives, shadcn/ui
- **Animations**: Framer Motion 12
- **State Management**: TanStack React Query 5
- **Web3**: wagmi 2.x, RainbowKit 2.2.8, ethers 6.15.0, viem 2.x
- **Authentication**: better-auth 1.3.27 with Google OAuth, email/password, OTP
- **Database**: PostgreSQL with Prisma ORM, Kysely query builder
- **Forms**: React Hook Form 7 with Zod validation
- **Internationalization**: next-intl 4.3.7
- **Charts**: Recharts 3, Lightweight Charts 5
- **3D Graphics**: Three.js 0.180.0

## 📁 Project Structure

```
frontend/
├── app/                  # Next.js App Router
│   ├── (client)/        # Client-side routes
│   │   ├── account/     # Account management (settings, activity, wallets, onboarding)
│   │   ├── assets/      # Asset details page [slug]
│   │   ├── auth/        # Authentication (login, register, reset-password)
│   │   ├── explore/     # Explore assets
│   │   ├── faucet/      # Token faucet
│   │   ├── idrc/        # IDRC main page
│   │   └── onboard/     # User onboarding
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Root page (redirects to /idrc)
├── components/          # React components
│   ├── animations/      # Animated components
│   ├── auth/           # Authentication components
│   ├── chart/          # Trading charts
│   ├── layout/         # Layout components
│   ├── loader/         # Loading states
│   ├── providers/      # Context providers
│   ├── sumsub/         # KYC integration
│   ├── tooltip/        # Tooltips
│   └── ui/             # shadcn/ui components
├── config/             # Configuration files
├── contexts/           # React contexts
├── data/               # Static data (assets, bonds, history)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and libraries
│   ├── abis/          # Smart contract ABIs
│   ├── graphql/       # GraphQL queries
│   ├── helper/        # Helper functions
│   ├── utils/         # Utility functions
│   ├── auth.ts        # Authentication configuration
│   ├── api.ts         # API client
│   └── constants.ts   # Contract addresses and constants
├── messages/           # i18n messages
├── prisma/            # Prisma schema
├── public/            # Static assets
├── scripts/           # Build and utility scripts
├── services/          # External services
├── styles/            # Global styles
└── types/             # TypeScript type definitions
```

## 🔧 Smart Contract Addresses (Base Sepolia)

- **IDRXToken**: `0x3E4c9e0a4F7F735401971dace92d18418da9c937`
- **IDRC Implementation**: `0x770d11A0583290f6B5BE500EE70720E3a3c01ea1`
- **Hub Implementation**: `0x4CAa4eC854306F961A2e476B62c4e6dacb8C23eF`
- **IDRC Proxy**: `0xD3723bD07766d4993FBc936bEA1895227B556ea3`
- **Hub Proxy**: `0xf2CCA756D7dE98d54ed00697EA8Cf50D71ea0Dd1`

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://...

# Authentication
BETTER_AUTH_SECRET=<secret>
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
TURNSTILE_SECRET_KEY=<turnstile-secret>

# Web3
NEXT_PUBLIC_API_SUBGRAPH_BASE_SEPOLIA_URL=<subgraph-url>
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<walletconnect-project-id>

# Cloudinary (for file uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>

# Resend (for emails)
RESEND_API_KEY=<resend-api-key>

# Sumsub (for KYC)
NEXT_PUBLIC_SUMSUB_APP_TOKEN=<sumsub-token>
```

## 🚀 Development

```bash
# Run development server with Turbopack
pnpm dev

# Run linter
pnpm lint

# Generate test data
pnpm generate-data

# Seed chains data
pnpm seed:chains
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🏗️ Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Build for Netlify
pnpm build:netlify
```

## ✨ Key Features

### Authentication
- Email/password authentication
- Google OAuth integration
- Email OTP verification
- Password reset functionality
- One-tap Google sign-in
- Cloudflare Turnstile CAPTCHA (production)

### Web3 Integration
- RainbowKit wallet connection
- Multi-wallet support (MetaMask, WalletConnect, Coinbase, etc.)
- Smart contract interactions via ethers.js and wagmi
- Base Sepolia testnet support

### User Features
- Asset exploration and trading
- Portfolio management
- Transaction history
- Account settings and KYC
- Multi-language support (i18n)
- Dark/light theme

### UI/UX
- Responsive design
- Smooth animations with Framer Motion
- Interactive charts and visualizations
- Skeleton loading states
- Toast notifications (sonner)
- Accessible components (Radix UI)

## 📦 Key Dependencies

- **UI Framework**: `@radix-ui/*` - Accessible component primitives
- **Web3**: `wagmi`, `viem`, `ethers`, `@rainbow-me/rainbowkit`
- **Forms**: `react-hook-form`, `@hookform/resolvers`, `zod`
- **Database**: `@prisma/client`, `kysely`, `@libsql/kysely-libsql`
- **State**: `@tanstack/react-query`, `@tanstack/react-table`
- **Styling**: `tailwindcss`, `tailwind-merge`, `class-variance-authority`
- **Utils**: `date-fns`, `axios`, `graphql-request`, `bignumber.js`

## 🔒 Security

- CAPTCHA protection on production
- CSRF protection via better-auth
- Secure cookie handling
- Input validation with Zod
- Environment variable validation
- KYC verification via Sumsub

## 📝 Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm seed:chains` - Seed blockchain data
- `pnpm generate-data` - Generate mock data

## 🌐 Routes

- `/` - Redirects to `/idrc`
- `/idrc` - Main IDRC page
- `/explore` - Browse available assets
- `/assets/[slug]` - Individual asset details
- `/account` - Account overview
- `/account/settings` - User settings
- `/account/activity` - Transaction activity
- `/account/wallets` - Connected wallets
- `/account/onboarding` - KYC onboarding
- `/auth` - Authentication pages
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/reset-password` - Password reset
- `/faucet` - Token faucet
- `/onboard` - New user onboarding

## 🎨 Theming

The app supports both light and dark themes using `next-themes`. Theme colors are defined in Tailwind CSS configuration.

## 🌍 Internationalization

Multi-language support powered by `next-intl`. Message files are located in the `messages/` directory.

## 📄 License

See LICENSE file for details.

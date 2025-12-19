# 📁 Stock Insights App - Project Structure

## Overview
This document provides a comprehensive overview of the folder structure and key files in the Stock Insights application.

## Directory Tree

```
stock-insights-app/
├── public/                          # Static assets
├── src/
│   ├── components/                  # React components
│   │   ├── Login.tsx               # Authentication UI (sign in/up)
│   │   ├── Login.css               # Login component styles
│   │   ├── Dashboard.tsx           # Main dashboard container
│   │   ├── Dashboard.css           # Dashboard styles
│   │   ├── AddStock.tsx            # Stock search/add form
│   │   ├── AddStock.css            # AddStock component styles
│   │   ├── StockCard.tsx           # Individual stock display card
│   │   └── StockCard.css           # StockCard styles
│   │
│   ├── contexts/                    # React contexts
│   │   └── AuthContext.tsx         # Global authentication state
│   │
│   ├── services/                    # Business logic layer
│   │   ├── supabase.service.ts     # Supabase client & DB operations
│   │   ├── alphaVantage.service.ts # Alpha Vantage API client
│   │   └── stockInsights.service.ts # Insights calculations
│   │
│   ├── config/                      # Configuration
│   │   └── env.ts                  # Environment variable validation
│   │
│   ├── App.tsx                      # Root component
│   ├── App.css                      # App-level styles
│   ├── main.tsx                     # Application entry point
│   └── index.css                    # Global CSS reset
│
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── SUPABASE_SCHEMA.sql             # Database schema with RLS policies
├── README.md                        # Project documentation
├── STRUCTURE.md                     # This file
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
└── index.html                       # HTML entry point

```

## Key Files Explained

### 🎯 Entry Points

#### `index.html`
- HTML template
- Contains root div for React app
- Imports main.tsx

#### `src/main.tsx`
- Application bootstrap
- Wraps App with AuthProvider
- Renders to DOM

#### `src/App.tsx`
- Root React component
- Handles routing between Login and Dashboard
- Shows loading state during auth check

---

### 🔐 Authentication

#### `src/contexts/AuthContext.tsx`
- React Context for global auth state
- Provides: `user`, `loading`, `signIn`, `signUp`, `signOut`
- Listens to Supabase auth state changes
- Used by all components needing auth info

#### `src/components/Login.tsx`
- Login/Sign-up form
- Toggles between sign in and sign up modes
- Form validation and error handling
- Styled with gradient background

---

### 🎨 Components

#### `src/components/Dashboard.tsx`
**Purpose**: Main authenticated view  
**Features**:
- Displays user's stock watchlist
- Header with sign-out button
- Empty state for new users
- Loading state while fetching stocks
- Error handling

#### `src/components/AddStock.tsx`
**Purpose**: Add new stocks to watchlist  
**Features**:
- Input field for stock symbols
- Client-side validation (1-5 uppercase letters)
- Prevents duplicate additions
- Success/error feedback messages

#### `src/components/StockCard.tsx`
**Purpose**: Display insights for a single stock  
**Features**:
- Fetches data from Alpha Vantage
- Shows latest price, day change, trends
- Loading spinner while fetching
- Error state with retry button
- Remove stock functionality
- Cache indicator badge

---

### 🛠️ Services (Business Logic)

#### `src/services/supabase.service.ts`
**Responsibilities**:
- Supabase client initialization
- Authentication methods (signIn, signUp, signOut)
- User stock CRUD operations
- Cache read/write operations
- RLS-compliant queries

**Key Methods**:
- `signIn(email, password)` - Authenticate user
- `signUp(email, password)` - Create new account
- `getUserStocks()` - Fetch user's watchlist
- `addUserStock(symbol)` - Add stock to watchlist
- `removeUserStock(id)` - Remove stock from watchlist
- `getCachedStockData(symbol, type)` - Check cache
- `cacheStockData(symbol, type, data)` - Store in cache

#### `src/services/alphaVantage.service.ts`
**Responsibilities**:
- Alpha Vantage API integration
- Rate limiting (5 calls/min)
- Request queuing
- Data normalization
- Cache integration
- Error handling

**Key Methods**:
- `getDailyTimeSeries(symbol)` - Fetch stock data (checks cache first)
- `validateSymbol(symbol)` - Validate symbol format
- `normalizeTimeSeriesData()` - Convert API response to usable format
- `queueRequest()` - Queue requests to respect rate limits

**Rate Limiting**:
- Minimum 12 seconds between requests
- Sequential processing of queued requests
- Prevents API quota exhaustion

#### `src/services/stockInsights.service.ts`
**Responsibilities**:
- Calculate insights from raw data
- Format numbers for display
- Client-side computations (no API calls)

**Key Methods**:
- `calculateInsights(symbol, data)` - Compute all insights
- `formatCurrency(value)` - Format as USD
- `formatPercentage(value)` - Format with +/- sign
- `formatLargeNumber(value)` - Format with K/M/B suffixes

**Insights Calculated**:
- Day change (absolute & percentage)
- 7-day trend (direction & percentage)
- 30-day trend (direction & percentage)
- 52-week high/low (when available)

---

### ⚙️ Configuration

#### `src/config/env.ts`
**Purpose**: Centralized environment variable management  
**Features**:
- Validates all required env vars on startup
- Fails fast with clear error messages
- Type-safe configuration export

**Required Variables**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ALPHA_VANTAGE_API_KEY`

---

### 🗄️ Database

#### `SUPABASE_SCHEMA.sql`
**Tables**:

1. **`user_stocks`**
   - Stores user's selected stocks
   - Fields: `id`, `user_id`, `symbol`, `added_at`
   - Unique constraint: `(user_id, symbol)`
   - RLS policies: Users can only access their own stocks

2. **`stock_data_cache`**
   - Caches Alpha Vantage responses
   - Fields: `id`, `symbol`, `data_type`, `data`, `fetched_at`
   - Unique constraint: `(symbol, data_type)`
   - RLS policies: All authenticated users can read
   - TTL: 24 hours (enforced in application logic)

**Security**:
- Row Level Security (RLS) enabled on all tables
- Users isolated to their own data
- Cache is read-only for users

---

### 🎨 Styling

#### CSS Architecture
- **Component-scoped CSS**: Each component has its own CSS file
- **No CSS-in-JS**: Pure CSS for simplicity and performance
- **Modern features**: Gradients, animations, flexbox, grid

#### Design System
- **Colors**: Purple gradient theme (`#667eea` → `#764ba2`)
- **Typography**: System fonts for performance
- **Spacing**: Consistent rem-based spacing
- **Animations**: Smooth transitions and micro-interactions

---

## 🔄 Data Flow

### Authentication Flow
```
User → Login Component → AuthContext → Supabase Auth → AuthContext updates → App re-renders → Dashboard
```

### Stock Addition Flow
```
User → AddStock → Validate → supabase.service → Database → Callback → Dashboard refreshes
```

### Stock Data Fetch Flow
```
StockCard → alphaVantage.service → Check cache → (if miss) API call → Cache result → Calculate insights → Display
```

---

## 🧩 Design Patterns

### Service Layer Pattern
- All business logic in service modules
- Components are thin, focused on UI
- Services are testable and reusable

### Context Pattern
- Global state (auth) via React Context
- Avoids prop drilling
- Single source of truth

### Singleton Pattern
- Services exported as singleton instances
- Shared state (e.g., request queue)
- Consistent behavior across app

---

## 🚀 Extensibility Points

### Adding New Features

1. **Alerts System**
   - Create `alerts.service.ts`
   - Add `user_alerts` table to schema
   - Create `AlertsPanel.tsx` component

2. **AI Summaries**
   - Create `ai.service.ts` for LLM integration
   - Add `stock_summaries` table
   - Extend `StockCard` to show summaries

3. **Charts/Graphs**
   - Install charting library (e.g., recharts)
   - Create `StockChart.tsx` component
   - Use existing normalized data

4. **Portfolio Analytics**
   - Create `portfolio.service.ts`
   - Aggregate data across stocks
   - Create `PortfolioSummary.tsx` component

---

## 📦 Dependencies

### Production
- `react` - UI library
- `react-dom` - React DOM renderer
- `@supabase/supabase-js` - Supabase client

### Development
- `vite` - Build tool
- `typescript` - Type safety
- `@vitejs/plugin-react` - React support for Vite

---

## 🧪 Testing Strategy (Future)

Recommended test structure:
```
src/
├── services/
│   ├── __tests__/
│   │   ├── supabase.service.test.ts
│   │   ├── alphaVantage.service.test.ts
│   │   └── stockInsights.service.test.ts
├── components/
│   ├── __tests__/
│   │   ├── Login.test.tsx
│   │   ├── Dashboard.test.tsx
│   │   └── StockCard.test.tsx
```

---

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: JSDoc-style for functions and services
- **Formatting**: Consistent indentation and spacing

---

**This structure is designed for scalability, maintainability, and ease of onboarding new developers.**

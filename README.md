# 📈 Stock Insights App

A production-ready React application that provides real-time insights for user-selected stocks by integrating **Supabase** (authentication + database) and **Alpha Vantage** (market data API).

## 🎯 Features

### ✅ Authentication
- Email + password authentication via Supabase Auth
- Protected dashboard accessible only to authenticated users
- Persistent sessions with automatic state management

### 📊 Stock Management
- Search and add stock symbols (e.g., AAPL, MSFT, GOOGL)
- Validate symbols before storing
- Remove stocks from watchlist
- Persistent storage per user in Supabase

### 💹 Market Data & Insights
- Fetch daily time series data from Alpha Vantage
- Display comprehensive insights:
  - **Latest Price** with day change (absolute & percentage)
  - **7-Day Trend** (up/down/flat with percentage)
  - **30-Day Trend** (up/down/flat with percentage)
  - **Volume** (formatted for readability)
  - **52-Week High/Low** (when sufficient data available)

### ⚡ Performance & Reliability
- **Intelligent Caching**: Stock data cached in Supabase for 24 hours
- **Rate Limit Handling**: Request queue system respects Alpha Vantage limits (5 calls/min)
- **Error Handling**: Graceful error states with retry functionality
- **Loading States**: Clear feedback during data fetching

### 🎨 User Interface
- Clean, responsive design
- Real-time updates
- Empty states for new users
- Loading spinners and error messages
- Smooth animations and transitions

## 🏗️ Architecture

### Service Layer Pattern
Business logic is separated into dedicated service modules:

- **`supabase.service.ts`**: Authentication, database operations, caching
- **`alphaVantage.service.ts`**: API calls, rate limiting, data normalization
- **`stockInsights.service.ts`**: Client-side calculations and formatting

### Component Structure
```
src/
├── components/
│   ├── Login.tsx              # Authentication UI
│   ├── Dashboard.tsx          # Main dashboard view
│   ├── AddStock.tsx           # Stock search/add form
│   └── StockCard.tsx          # Individual stock display
├── contexts/
│   └── AuthContext.tsx        # Global auth state
├── services/
│   ├── supabase.service.ts    # Supabase client & operations
│   ├── alphaVantage.service.ts # Alpha Vantage API client
│   └── stockInsights.service.ts # Insights calculations
└── config/
    └── env.ts                 # Environment validation
```

### Database Schema
See `SUPABASE_SCHEMA.sql` for the complete schema with:
- **`user_stocks`**: User's selected stocks
- **`stock_data_cache`**: Cached API responses
- Row Level Security (RLS) policies for data protection

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Alpha Vantage API key ([alphavantage.co](https://www.alphavantage.co/support/#api-key))

### 1. Clone and Install
```bash
cd stock-insights-app
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API** and copy:
   - Project URL
   - Anon/Public Key
3. Go to **SQL Editor** and run the schema from `SUPABASE_SCHEMA.sql`

### 3. Get Alpha Vantage API Key

1. Visit [alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
2. Get your free API key (5 calls/min, 500 calls/day)

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Usage

1. **Sign Up**: Create an account with email and password
2. **Add Stocks**: Enter stock symbols (e.g., AAPL, MSFT) to track
3. **View Insights**: See real-time price, trends, and volume data
4. **Manage Watchlist**: Remove stocks you no longer want to track

## 🔒 Security Best Practices

✅ All secrets stored in environment variables  
✅ Row Level Security (RLS) enabled on all tables  
✅ Symbol validation before database insertion  
✅ API error handling with user-friendly messages  
✅ No sensitive data exposed in client code  

## 🧪 Error Handling

The app gracefully handles:
- Invalid stock symbols
- API rate limits
- Network failures
- Duplicate stock additions
- Missing or stale data

## 🎯 Extensibility

The architecture is designed for future enhancements:

### Planned Features
- **Alerts**: Notify users when stocks hit target prices
- **AI Summaries**: Generate insights using LLMs
- **Advanced Charts**: Historical price visualization
- **Portfolio Tracking**: Calculate total portfolio value
- **Watchlist Sharing**: Share watchlists with other users

### Extension Points
- Service layer is modular and testable
- Database schema includes notes for future tables
- Component structure supports additional views
- Caching system can be extended for other data types

## 📦 Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **API**: Alpha Vantage (Stock Market Data)
- **Styling**: CSS Modules with modern gradients and animations

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | ✅ Yes |
| `VITE_ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key | ✅ Yes |

## 🤝 Contributing

This is a production-ready template. Feel free to:
- Add new features
- Improve error handling
- Enhance UI/UX
- Add tests
- Optimize performance

## 📄 License

MIT License - feel free to use this project as a starting point for your own applications.

---

**Built with ❤️ using React, Supabase, and Alpha Vantage**

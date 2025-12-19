# 🚀 Quick Start Guide - Stock Insights App

This guide will walk you through setting up and running the Stock Insights application from scratch.

## ⏱️ Estimated Time: 15 minutes

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** installed ([nodejs.org](https://nodejs.org))
- ✅ **npm** (comes with Node.js)
- ✅ A **Supabase account** (free tier is fine)
- ✅ An **Alpha Vantage API key** (free tier is fine)

---

## Step 1: Install Dependencies

The dependencies should already be installed, but if not:

```bash
cd stock-insights-app
npm install
```

**Expected output**: Installation of ~234 packages

---

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Choose an organization (or create one)
4. Fill in:
   - **Name**: `stock-insights` (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait ~2 minutes for project to be ready

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon) in the sidebar
2. Click **API** under "Project Settings"
3. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 2.3 Set Up the Database Schema

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **"New Query"**
3. Open the file `SUPABASE_SCHEMA.sql` from this project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see: **"Success. No rows returned"**

**What this does**: Creates two tables (`user_stocks` and `stock_data_cache`) with proper security policies.

---

## Step 3: Get Alpha Vantage API Key

1. Go to [alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
2. Enter your email address
3. Click **"GET FREE API KEY"**
4. Copy the API key (it's a long string like `ABC123XYZ...`)

**Free tier limits**: 5 API calls per minute, 500 per day (plenty for testing!)

---

## Step 4: Configure Environment Variables

### 4.1 Create .env File

In the project root, create a `.env` file:

```bash
cp .env.example .env
```

### 4.2 Edit .env File

Open `.env` in your text editor and fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key-here
```

**⚠️ Important**: 
- Replace the placeholder values with your actual credentials
- Do NOT commit this file to git (it's already in `.gitignore`)
- Keep these keys secret!

---

## Step 5: Run the Application

Start the development server:

```bash
npm run dev
```

**Expected output**:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Step 6: Use the Application

### 6.1 Open in Browser

Open [http://localhost:5173](http://localhost:5173)

### 6.2 Create an Account

1. You'll see the login screen
2. Click **"Sign Up"**
3. Enter an email and password (min 6 characters)
4. Click **"Sign Up"**

**Note**: For testing, you can use a fake email like `test@example.com`

### 6.3 Add Your First Stock

1. After signing in, you'll see the dashboard
2. In the "Add Stock" section, enter a stock symbol (e.g., `AAPL`)
3. Click **"+ Add Stock"**
4. Wait a few seconds for data to load
5. You'll see a card with stock insights!

### 6.4 Try More Stocks

Popular symbols to try:
- `AAPL` - Apple
- `MSFT` - Microsoft
- `GOOGL` - Google
- `AMZN` - Amazon
- `TSLA` - Tesla
- `NVDA` - NVIDIA

---

## 🎉 Success!

You should now see:
- ✅ Latest stock price
- ✅ Day change ($ and %)
- ✅ 7-day trend
- ✅ 30-day trend
- ✅ Volume
- ✅ 52-week range (if enough data)

---

## 🔍 Verifying Everything Works

### Check 1: Authentication
- ✅ Can sign up with email/password
- ✅ Can sign out and sign back in
- ✅ Session persists on page refresh

### Check 2: Stock Management
- ✅ Can add stock symbols
- ✅ Can remove stocks (click the × button)
- ✅ Can't add duplicate stocks
- ✅ Invalid symbols show error

### Check 3: Data Fetching
- ✅ Stock data loads and displays
- ✅ Cache indicator shows on subsequent loads
- ✅ Rate limiting works (try adding 5+ stocks)

---

## 🐛 Troubleshooting

### Problem: "Missing required environment variable"

**Solution**: Check your `.env` file
- Ensure all three variables are set
- No extra spaces or quotes
- Restart dev server after changing `.env`

### Problem: "Failed to load stocks" or database errors

**Solution**: Check Supabase setup
- Verify you ran the `SUPABASE_SCHEMA.sql` script
- Check that RLS policies are enabled
- Verify your Supabase URL and key are correct

### Problem: "API rate limit exceeded"

**Solution**: This is expected!
- Alpha Vantage free tier: 5 calls/min
- Wait 60 seconds and try again
- Data is cached for 24 hours to minimize API calls

### Problem: "Invalid symbol or no data available"

**Solution**: 
- Use valid US stock symbols (1-5 uppercase letters)
- Some symbols may not have data on Alpha Vantage
- Try common stocks like AAPL, MSFT, GOOGL

### Problem: Build errors

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

---

## 📚 Next Steps

Now that you have the app running:

1. **Explore the code**: Check out `STRUCTURE.md` for architecture details
2. **Add features**: See the "Extensibility" section in `README.md`
3. **Deploy**: Build for production with `npm run build`

---

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

---

## 🔒 Security Reminders

- ✅ Never commit `.env` file
- ✅ Don't share your API keys
- ✅ Use environment variables for all secrets
- ✅ Supabase RLS policies protect user data

---

## 📞 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review `README.md` for detailed documentation
3. Check `STRUCTURE.md` for code architecture
4. Verify all prerequisites are met

---

**Happy coding! 🚀**

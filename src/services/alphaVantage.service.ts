/**
 * Alpha Vantage API Service
 * Handles all interactions with the Alpha Vantage API
 * Includes rate limiting, error handling, and response normalization
 */

import { config } from '../config/env';
import { supabaseService } from './supabase.service';

// API response types
export interface TimeSeriesData {
    [date: string]: {
        '1. open': string;
        '2. high': string;
        '3. low': string;
        '4. close': string;
        '5. volume': string;
    };
}

export interface AlphaVantageResponse {
    'Meta Data': {
        '1. Information': string;
        '2. Symbol': string;
        '3. Last Refreshed': string;
        '4. Output Size': string;
        '5. Time Zone': string;
    };
    'Time Series (Daily)': TimeSeriesData;
}

// Normalized data format for easier consumption
export interface NormalizedDailyData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface StockDataResult {
    symbol: string;
    lastRefreshed: string;
    dailyData: NormalizedDailyData[];
    fromCache: boolean;
}

export interface SearchResult {
    symbol: string;
    name: string;
    type: string;
    region: string;
    currency: string;
}

export interface AlphaVantageSearchResponse {
    bestMatches: Array<{
        '1. symbol': string;
        '2. name': string;
        '3. type': string;
        '4. region': string;
        '5. marketOpen': string;
        '6. marketClose': string;
        '7. timezone': string;
        '8. currency': string;
        '9. matchScore': string;
    }>;
}

/**
 * Alpha Vantage API Service
 */
class AlphaVantageService {
    private readonly baseUrl = 'https://www.alphavantage.co/query';
    private readonly apiKey = config.alphaVantage.apiKey;

    // Rate limiting: Alpha Vantage free tier allows 5 calls/min, 500 calls/day
    private requestQueue: Array<() => Promise<any>> = [];
    private isProcessingQueue = false;
    private readonly minRequestInterval = 12000; // 12 seconds between requests (5 per minute)

    /**
     * Search for stock symbols matching a keyword
     */
    async searchSymbols(keywords: string): Promise<SearchResult[]> {
        if (!keywords.trim()) return [];

        const params = new URLSearchParams({
            function: 'SYMBOL_SEARCH',
            keywords: keywords.trim(),
            apikey: this.apiKey,
        });

        const url = `${this.baseUrl}?${params.toString()}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: AlphaVantageSearchResponse = await response.json();

            // Check for API errors or notes
            if ((data as any)['Note']) {
                throw new Error(
                    'API rate limit exceeded. Please wait a moment and try again.'
                );
            }

            if (!data.bestMatches) {
                return [];
            }

            return data.bestMatches.map(match => ({
                symbol: match['1. symbol'],
                name: match['2. name'],
                type: match['3. type'],
                region: match['4. region'],
                currency: match['8. currency'],
            }));
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    /**
     * Fetch daily time series data for a stock symbol
     * Checks cache first, then fetches from API if needed
     */
    async getDailyTimeSeries(symbol: string): Promise<StockDataResult> {
        const dataType = 'TIME_SERIES_DAILY';

        // Try to get from cache first
        const cachedData = await supabaseService.getCachedStockData(symbol, dataType);

        if (cachedData) {
            console.log(`Using cached data for ${symbol}`);
            return {
                symbol: cachedData['Meta Data']['2. Symbol'],
                lastRefreshed: cachedData['Meta Data']['3. Last Refreshed'],
                dailyData: this.normalizeTimeSeriesData(cachedData['Time Series (Daily)']),
                fromCache: true,
            };
        }

        // Fetch from API
        console.log(`Fetching fresh data for ${symbol} from Alpha Vantage`);
        const data = await this.queueRequest(() => this.fetchDailyTimeSeries(symbol));

        // Cache the response
        await supabaseService.cacheStockData(symbol, dataType, data);

        return {
            symbol: data['Meta Data']['2. Symbol'],
            lastRefreshed: data['Meta Data']['3. Last Refreshed'],
            dailyData: this.normalizeTimeSeriesData(data['Time Series (Daily)']),
            fromCache: false,
        };
    }

    /**
     * Fetch data from Alpha Vantage API
     */
    private async fetchDailyTimeSeries(symbol: string): Promise<AlphaVantageResponse> {
        const params = new URLSearchParams({
            function: 'TIME_SERIES_DAILY',
            symbol: symbol.toUpperCase(),
            apikey: this.apiKey,
            outputsize: 'compact', // Last 100 data points (vs 'full' for 20+ years)
        });

        const url = `${this.baseUrl}?${params.toString()}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Check for API errors
            if (data['Error Message']) {
                throw new Error(`Alpha Vantage API error: ${data['Error Message']}`);
            }

            if (data['Note']) {
                throw new Error(
                    'API rate limit exceeded. Please wait a moment and try again.\n' +
                    'Free tier: 5 calls/minute, 500 calls/day.'
                );
            }

            if (!data['Time Series (Daily)']) {
                throw new Error(`Invalid symbol or no data available for ${symbol}`);
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to fetch stock data from Alpha Vantage');
        }
    }

    /**
     * Normalize time series data to a more usable format
     * Converts string values to numbers and restructures the data
     */
    private normalizeTimeSeriesData(timeSeries: TimeSeriesData): NormalizedDailyData[] {
        return Object.entries(timeSeries)
            .map(([date, values]) => ({
                date,
                open: parseFloat(values['1. open']),
                high: parseFloat(values['2. high']),
                low: parseFloat(values['3. low']),
                close: parseFloat(values['4. close']),
                volume: parseFloat(values['5. volume']),
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first
    }

    /**
     * Queue a request to respect rate limits
     * Processes requests sequentially with delays
     */
    private async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.requestQueue.push(async () => {
                try {
                    const result = await requestFn();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });

            this.processQueue();
        });
    }

    /**
     * Process the request queue with rate limiting
     */
    private async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            if (request) {
                await request();

                // Wait before processing next request (rate limiting)
                if (this.requestQueue.length > 0) {
                    await this.delay(this.minRequestInterval);
                }
            }
        }

        this.isProcessingQueue = false;
    }

    /**
     * Utility function to delay execution
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Validate a stock symbol format
     * Basic validation - symbols are typically 1-5 uppercase letters
     */
    validateSymbol(symbol: string): boolean {
        const symbolRegex = /^[A-Z0-9.]{1,10}$/; // Expanded to allow dots (e.g. BRK.A) and numbers
        return symbolRegex.test(symbol.toUpperCase());
    }
}

// Export singleton instance
export const alphaVantageService = new AlphaVantageService();

/**
 * Stock Insights Service
 * Computes insights from stock data (trends, changes, etc.)
 * All calculations are done client-side for performance
 */

import type { NormalizedDailyData, AlphaVantageOverview } from './alphaVantage.service';

export interface StockInsights {
    symbol: string;
    latestPrice: number;
    latestDate: string;
    dayChange: {
        absolute: number;
        percentage: number;
    };
    trend7Day: {
        direction: 'up' | 'down' | 'flat';
        percentage: number;
    };
    trend30Day: {
        direction: 'up' | 'down' | 'flat';
        percentage: number;
    };
    volume: number;
    high52Week?: number;
    low52Week?: number;
    peRatio?: number;
}

/**
 * Stock Insights Service
 */
class StockInsightsService {
    /**
     * Calculate comprehensive insights from daily stock data
     */
    calculateInsights(
        symbol: string,
        dailyData: NormalizedDailyData[],
        overview?: AlphaVantageOverview
    ): StockInsights {
        if (!dailyData || dailyData.length === 0) {
            throw new Error('No data available to calculate insights');
        }

        const latest = dailyData[0];
        const previous = dailyData[1];

        // Calculate day change
        const dayChange = this.calculateDayChange(latest, previous);

        // Calculate 7-day trend
        const trend7Day = this.calculateTrend(dailyData, 7);

        // Calculate 30-day trend
        const trend30Day = this.calculateTrend(dailyData, 30);

        // Calculate 52-week high/low if we have enough data
        const { high52Week, low52Week } = this.calculate52WeekHighLow(dailyData);

        // Parse PE Ratio
        const peRatio = overview?.PERatio && overview.PERatio !== 'None'
            ? parseFloat(overview.PERatio)
            : undefined;

        return {
            symbol,
            latestPrice: latest.close,
            latestDate: latest.date,
            dayChange,
            trend7Day,
            trend30Day,
            volume: latest.volume,
            high52Week,
            low52Week,
            peRatio,
        };
    }

    /**
     * Calculate day-over-day change
     */
    private calculateDayChange(
        latest: NormalizedDailyData,
        previous?: NormalizedDailyData
    ): { absolute: number; percentage: number } {
        if (!previous) {
            return { absolute: 0, percentage: 0 };
        }

        const absolute = latest.close - previous.close;
        const percentage = (absolute / previous.close) * 100;

        return {
            absolute: this.roundToTwo(absolute),
            percentage: this.roundToTwo(percentage),
        };
    }

    /**
     * Calculate trend over a specific number of days
     */
    private calculateTrend(
        dailyData: NormalizedDailyData[],
        days: number
    ): { direction: 'up' | 'down' | 'flat'; percentage: number } {
        if (dailyData.length < days + 1) {
            // Not enough data for this trend
            return { direction: 'flat', percentage: 0 };
        }

        const currentPrice = dailyData[0].close;
        const pastPrice = dailyData[days]?.close || dailyData[dailyData.length - 1].close;

        const change = currentPrice - pastPrice;
        const percentage = (change / pastPrice) * 100;

        let direction: 'up' | 'down' | 'flat' = 'flat';
        if (percentage > 0.5) direction = 'up';
        else if (percentage < -0.5) direction = 'down';

        return {
            direction,
            percentage: this.roundToTwo(percentage),
        };
    }

    /**
     * Calculate 52-week high and low
     */
    private calculate52WeekHighLow(
        dailyData: NormalizedDailyData[]
    ): { high52Week?: number; low52Week?: number } {
        // 52 weeks ≈ 252 trading days
        const tradingDays = Math.min(252, dailyData.length);

        if (tradingDays < 30) {
            // Not enough data for meaningful 52-week calculation
            return {};
        }

        const relevantData = dailyData.slice(0, tradingDays);
        const high52Week = Math.max(...relevantData.map(d => d.high));
        const low52Week = Math.min(...relevantData.map(d => d.low));

        return {
            high52Week: this.roundToTwo(high52Week),
            low52Week: this.roundToTwo(low52Week),
        };
    }

    /**
     * Round a number to 2 decimal places
     */
    private roundToTwo(num: number): number {
        return Math.round(num * 100) / 100;
    }

    /**
     * Format currency for display
     */
    formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    }

    /**
     * Format percentage for display
     */
    formatPercentage(value: number): string {
        const sign = value > 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    }

    /**
     * Format large numbers (volume, etc.)
     */
    formatLargeNumber(value: number): string {
        if (value >= 1_000_000_000) {
            return `${(value / 1_000_000_000).toFixed(2)}B`;
        } else if (value >= 1_000_000) {
            return `${(value / 1_000_000).toFixed(2)}M`;
        } else if (value >= 1_000) {
            return `${(value / 1_000).toFixed(2)}K`;
        }
        return value.toLocaleString();
    }
}

// Export singleton instance
export const stockInsightsService = new StockInsightsService();

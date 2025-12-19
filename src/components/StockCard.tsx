/**
 * StockCard Component
 * Displays insights for a single stock with data from Alpha Vantage
 */

import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabase.service';
import type { UserStock } from '../services/supabase.service';
import { alphaVantageService } from '../services/alphaVantage.service';
import { stockInsightsService } from '../services/stockInsights.service';
import type { StockInsights } from '../services/stockInsights.service';
import './StockCard.css';

interface StockCardProps {
    stock: UserStock;
    onRemove: (stockId: string) => void;
}

export function StockCard({ stock, onRemove }: StockCardProps) {
    const [insights, setInsights] = useState<StockInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [fromCache, setFromCache] = useState(false);

    useEffect(() => {
        loadStockData();
    }, [stock.symbol]);

    const loadStockData = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await alphaVantageService.getDailyTimeSeries(stock.symbol);
            const calculatedInsights = stockInsightsService.calculateInsights(
                stock.symbol,
                data.dailyData
            );

            setInsights(calculatedInsights);
            setFromCache(data.fromCache);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stock data');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        if (window.confirm(`Remove ${stock.symbol} from your watchlist?`)) {
            try {
                await supabaseService.removeUserStock(stock.id);
                onRemove(stock.id);
            } catch (err) {
                alert('Failed to remove stock');
            }
        }
    };

    if (loading) {
        return (
            <div className="stock-card loading">
                <div className="card-header">
                    <h3>{stock.symbol}</h3>
                </div>
                <div className="card-loading">
                    <div className="spinner-small"></div>
                    <p>Loading data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="stock-card error">
                <div className="card-header">
                    <h3>{stock.symbol}</h3>
                    <button onClick={handleRemove} className="remove-button" title="Remove stock">
                        ×
                    </button>
                </div>
                <div className="card-error">
                    <p>{error}</p>
                    <button onClick={loadStockData} className="retry-button">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!insights) {
        return null;
    }

    const isPositiveChange = insights.dayChange.percentage >= 0;
    const trend7DayIcon = insights.trend7Day.direction === 'up' ? '📈' :
        insights.trend7Day.direction === 'down' ? '📉' : '➡️';
    const trend30DayIcon = insights.trend30Day.direction === 'up' ? '📈' :
        insights.trend30Day.direction === 'down' ? '📉' : '➡️';

    return (
        <div className="stock-card">
            {/* Header */}
            <div className="card-header">
                <div>
                    <h3>{stock.symbol}</h3>
                    {fromCache && (
                        <span className="cache-badge" title="Data from cache">📦 Cached</span>
                    )}
                </div>
                <button onClick={handleRemove} className="remove-button" title="Remove stock">
                    ×
                </button>
            </div>

            {/* Latest Price */}
            <div className="price-section">
                <div className="current-price">
                    {stockInsightsService.formatCurrency(insights.latestPrice)}
                </div>
                <div className={`price-change ${isPositiveChange ? 'positive' : 'negative'}`}>
                    {stockInsightsService.formatCurrency(insights.dayChange.absolute)}
                    {' '}
                    ({stockInsightsService.formatPercentage(insights.dayChange.percentage)})
                </div>
                <div className="last-updated">
                    As of {new Date(insights.latestDate).toLocaleDateString()}
                </div>
            </div>

            {/* Insights Grid */}
            <div className="insights-grid">
                {/* 7-Day Trend */}
                <div className="insight-item">
                    <div className="insight-label">7-Day Trend</div>
                    <div className="insight-value">
                        {trend7DayIcon} {stockInsightsService.formatPercentage(insights.trend7Day.percentage)}
                    </div>
                </div>

                {/* 30-Day Trend */}
                <div className="insight-item">
                    <div className="insight-label">30-Day Trend</div>
                    <div className="insight-value">
                        {trend30DayIcon} {stockInsightsService.formatPercentage(insights.trend30Day.percentage)}
                    </div>
                </div>

                {/* Volume */}
                <div className="insight-item">
                    <div className="insight-label">Volume</div>
                    <div className="insight-value">
                        {stockInsightsService.formatLargeNumber(insights.volume)}
                    </div>
                </div>

                {/* 52-Week Range (if available) */}
                {insights.high52Week && insights.low52Week && (
                    <div className="insight-item full-width">
                        <div className="insight-label">52-Week Range</div>
                        <div className="insight-value">
                            {stockInsightsService.formatCurrency(insights.low52Week)}
                            {' - '}
                            {stockInsightsService.formatCurrency(insights.high52Week)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

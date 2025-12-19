/**
 * Dashboard Component
 * Main dashboard view showing user's stock portfolio
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabase.service';
import type { UserStock } from '../services/supabase.service';
import { StockCard } from './StockCard';
import { AddStock } from './AddStock';
import './Dashboard.css';

export function Dashboard() {
    const { user, signOut } = useAuth();
    const [stocks, setStocks] = useState<UserStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStocks();
    }, []);

    const loadStocks = async () => {
        try {
            setLoading(true);
            setError('');
            const userStocks = await supabaseService.getUserStocks();
            setStocks(userStocks);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stocks');
        } finally {
            setLoading(false);
        }
    };

    const handleStockAdded = () => {
        loadStocks();
    };

    const handleStockRemoved = (stockId: string) => {
        setStocks(stocks.filter(s => s.id !== stockId));
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (err) {
            console.error('Sign out error:', err);
        }
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>📈 Stock Insights</h1>
                        <p className="user-email">{user?.email}</p>
                    </div>
                    <button onClick={handleSignOut} className="sign-out-button">
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-container">
                    {/* Add Stock Section */}
                    <section className="add-stock-section">
                        <AddStock onStockAdded={handleStockAdded} />
                    </section>

                    {/* Error State */}
                    {error && (
                        <div className="error-banner">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading your stocks...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && stocks.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">📊</div>
                            <h2>No stocks yet</h2>
                            <p>Add your first stock symbol above to start tracking insights</p>
                        </div>
                    )}

                    {/* Stock Cards Grid */}
                    {!loading && stocks.length > 0 && (
                        <div className="stocks-grid">
                            {stocks.map(stock => (
                                <StockCard
                                    key={stock.id}
                                    stock={stock}
                                    onRemove={handleStockRemoved}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

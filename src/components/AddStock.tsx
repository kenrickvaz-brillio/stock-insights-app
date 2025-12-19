/**
 * AddStock Component
 * Allows users to search and add stock symbols to their watchlist
 */

import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { supabaseService } from '../services/supabase.service';
import { alphaVantageService } from '../services/alphaVantage.service';
import type { SearchResult } from '../services/alphaVantage.service';
import './AddStock.css';

interface AddStockProps {
    onStockAdded: () => void;
}

export function AddStock({ onStockAdded }: AddStockProps) {
    const [symbol, setSymbol] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchTimeoutRef = useRef<any>(null);

    useEffect(() => {
        if (symbol.length >= 1) {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            searchTimeoutRef.current = setTimeout(async () => {
                setSearching(true);
                try {
                    const results = await alphaVantageService.searchSymbols(symbol);
                    setSearchResults(results);
                    setShowResults(results.length > 0);
                } catch (err) {
                    console.error('Search error:', err);
                } finally {
                    setSearching(false);
                }
            }, 500); // Debounce search
        } else {
            setSearchResults([]);
            setShowResults(false);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [symbol]);

    const handleAddStock = async (selectedSymbol: string) => {
        setLoading(true);
        setError('');
        setSuccess('');
        setShowResults(false);

        try {
            await supabaseService.addUserStock(selectedSymbol);
            setSuccess(`${selectedSymbol} added successfully!`);
            setSymbol('');
            onStockAdded();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            if (err instanceof Error) {
                if (err.message.includes('duplicate')) {
                    setError('You already have this stock in your watchlist');
                } else {
                    setError(err.message);
                }
            } else {
                setError('Failed to add stock');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const trimmedSymbol = symbol.trim().toUpperCase();

        if (!trimmedSymbol) {
            setError('Please enter a stock symbol');
            return;
        }

        // If we have search results and one matches exactly, use it
        const exactMatch = searchResults.find(r => r.symbol.toUpperCase() === trimmedSymbol);
        if (exactMatch) {
            handleAddStock(exactMatch.symbol);
            return;
        }

        // Otherwise, just try to add the trimmed symbol if it's valid format
        if (!alphaVantageService.validateSymbol(trimmedSymbol)) {
            setError('Invalid symbol format');
            return;
        }

        handleAddStock(trimmedSymbol);
    };

    return (
        <div className="add-stock">
            <form onSubmit={handleSubmit} className="add-stock-form">
                <div className="input-container">
                    <div className="input-group">
                        <input
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            onFocus={() => setShowResults(searchResults.length > 0)}
                            placeholder="Enter stock symbol (e.g., AAPL)"
                            className="stock-input"
                            disabled={loading}
                            maxLength={10}
                        />
                        <button
                            type="submit"
                            className="add-button"
                            disabled={loading || searching}
                        >
                            {loading ? '...' : '+ Add Stock'}
                        </button>
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="search-results">
                            {searchResults.map((result) => (
                                <div
                                    key={result.symbol}
                                    className="search-item"
                                    onClick={() => handleAddStock(result.symbol)}
                                >
                                    <div className="search-item-symbol">{result.symbol}</div>
                                    <div className="search-item-details">
                                        <span className="search-item-name">{result.name}</span>
                                        <span className="search-item-meta">{result.type} • {result.region} • {result.currency}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {searching && (
                        <div className="searching-indicator">
                            Searching...
                        </div>
                    )}
                </div>

                {error && (
                    <div className="message error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="message success-message">
                        {success}
                    </div>
                )}
            </form>
        </div>
    );
}

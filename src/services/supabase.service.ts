/**
 * Supabase Client Service
 * Provides a singleton instance of the Supabase client
 * Handles authentication and database operations
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { config } from '../config/env';

// Database types for type safety
export interface UserStock {
    id: string;
    user_id: string;
    symbol: string;
    added_at: string;
}

export interface StockDataCache {
    id: string;
    symbol: string;
    data_type: string;
    data: any;
    fetched_at: string;
}

/**
 * Singleton Supabase client instance
 */
class SupabaseService {
    private client: SupabaseClient;

    constructor() {
        this.client = createClient(
            config.supabase.url,
            config.supabase.anonKey
        );
    }

    /**
     * Get the Supabase client instance
     */
    getClient(): SupabaseClient {
        return this.client;
    }

    /**
     * Sign up a new user with email and password
     */
    async signUp(email: string, password: string) {
        const { data, error } = await this.client.auth.signUp({
            email,
            password,
        });

        if (error) throw error;
        return data;
    }

    /**
     * Sign in an existing user
     */
    async signIn(email: string, password: string) {
        const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    }

    /**
     * Sign out the current user
     */
    async signOut() {
        const { error } = await this.client.auth.signOut();
        if (error) throw error;
    }

    /**
     * Get the current authenticated user
     */
    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await this.client.auth.getUser();
        return user;
    }

    /**
     * Subscribe to authentication state changes
     */
    onAuthStateChange(callback: (user: User | null) => void) {
        return this.client.auth.onAuthStateChange((_event, session) => {
            callback(session?.user ?? null);
        });
    }

    /**
     * Get all stocks for the current user
     */
    async getUserStocks(): Promise<UserStock[]> {
        const { data, error } = await this.client
            .from('user_stocks')
            .select('*')
            .order('added_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    }

    /**
     * Add a stock to the user's watchlist
     */
    async addUserStock(symbol: string): Promise<UserStock> {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await this.client
            .from('user_stocks')
            .insert({ user_id: user.id, symbol: symbol.toUpperCase() })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Remove a stock from the user's watchlist
     */
    async removeUserStock(stockId: string): Promise<void> {
        const { error } = await this.client
            .from('user_stocks')
            .delete()
            .eq('id', stockId);

        if (error) throw new Error(error.message);
    }

    /**
     * Get cached stock data if it exists and is fresh (< 24 hours)
     */
    async getCachedStockData(symbol: string, dataType: string): Promise<any | null> {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const { data, error } = await this.client
            .from('stock_data_cache')
            .select('*')
            .eq('symbol', symbol.toUpperCase())
            .eq('data_type', dataType)
            .gte('fetched_at', twentyFourHoursAgo.toISOString())
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching cached data:', error.message);
            return null;
        }

        return data?.data || null;
    }

    /**
     * Cache stock data from Alpha Vantage
     * Uses upsert to update existing cache or insert new
     */
    async cacheStockData(symbol: string, dataType: string, data: any): Promise<void> {
        const { error } = await this.client
            .from('stock_data_cache')
            .upsert(
                {
                    symbol: symbol.toUpperCase(),
                    data_type: dataType,
                    data,
                    fetched_at: new Date().toISOString(),
                },
                {
                    onConflict: 'symbol,data_type',
                }
            );

        if (error) {
            console.error('Error caching stock data:', error.message);
            // Don't throw - caching failure shouldn't break the app
        }
    }
}

// Export singleton instance
export const supabaseService = new SupabaseService();

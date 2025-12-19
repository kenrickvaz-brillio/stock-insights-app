/**
 * Environment configuration module
 * Validates and exports all required environment variables
 * Fails fast if any required variables are missing
 */

interface EnvConfig {
    supabase: {
        url: string;
        anonKey: string;
    };
    alphaVantage: {
        apiKey: string;
    };
}

/**
 * Validates that a required environment variable exists
 * @throws Error if the variable is missing or empty
 */
function getRequiredEnv(key: string): string {
    const value = import.meta.env[key];

    if (!value || value.trim() === '') {
        throw new Error(
            `Missing required environment variable: ${key}\n` +
            `Please ensure ${key} is set in your .env file.`
        );
    }

    return value;
}

/**
 * Load and validate all environment variables
 * This runs at module load time to fail fast
 */
function loadConfig(): EnvConfig {
    return {
        supabase: {
            url: getRequiredEnv('VITE_SUPABASE_URL'),
            anonKey: getRequiredEnv('VITE_SUPABASE_ANON_KEY'),
        },
        alphaVantage: {
            apiKey: getRequiredEnv('VITE_ALPHA_VANTAGE_API_KEY'),
        },
    };
}

// Export the validated configuration
export const config = loadConfig();

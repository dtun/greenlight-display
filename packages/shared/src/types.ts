/**
 * Individual child account with spending, savings, and total balance
 */
export interface Account {
	name: string
	spending: number
	savings: number
	total: number
}

/**
 * Complete balance data with timestamp and all accounts
 */
export interface BalanceData {
	timestamp: string // ISO 8601 format
	accounts: Account[]
	parentWallet: number
}

/**
 * Standardized API response wrapper
 */
export interface ApiResponse {
	success: boolean
	data?: BalanceData
	error?: string
	message?: string
}

/**
 * Scraper service configuration
 */
export interface ScraperConfig {
	email: string
	password: string
	apiKey: string
	port: number
	headless: boolean
	cacheTtlMinutes: number
}

/**
 * Generic cache entry with data and expiration
 */
export interface CacheEntry<T> {
	data: T
	timestamp: number
	expiresAt: number
}

import type { Account, BalanceData, ScraperConfig } from './types'
import { ValidationError } from './errors'
import { defaultConfig } from './constants'

/**
 * Type guard for Account interface
 * Validates account structure and ensures total matches spending + savings
 */
export function isValidAccount(account: unknown): account is Account {
	if (typeof account !== 'object' || account === null) {
		return false
	}

	let a = account as Account

	// Validate name is non-empty string
	if (typeof a.name !== 'string' || a.name.length === 0) {
		return false
	}

	// Validate all numeric fields
	if (typeof a.spending !== 'number') return false
	if (typeof a.savings !== 'number') return false
	if (typeof a.total !== 'number') return false

	// Validate total matches spending + savings (with floating point tolerance)
	let expectedTotal = a.spending + a.savings
	if (Math.abs(a.total - expectedTotal) > 0.001) {
		return false
	}

	return true
}

/**
 * Type guard for BalanceData interface
 * Validates timestamp format, accounts array, and parentWallet
 */
export function isValidBalanceData(data: unknown): data is BalanceData {
	if (typeof data !== 'object' || data === null) {
		return false
	}

	let d = data as BalanceData

	// Validate timestamp is a valid ISO 8601 string
	if (typeof d.timestamp !== 'string') return false

	let date = new Date(d.timestamp)
	if (isNaN(date.getTime())) {
		return false
	}

	// Validate accounts is a non-empty array
	if (!Array.isArray(d.accounts)) return false
	if (d.accounts.length === 0) return false

	// Validate all accounts in the array
	for (let account of d.accounts) {
		if (!isValidAccount(account)) {
			return false
		}
	}

	// Validate parentWallet is a number
	if (typeof d.parentWallet !== 'number') return false

	return true
}

/**
 * Type guard for API key validation
 * Ensures key exists and is at least 32 characters long
 */
export function isValidApiKey(key: string | undefined): key is string {
	return typeof key === 'string' && key.length >= 32
}

/**
 * Validate and extract environment configuration
 * @throws {ValidationError} If required env vars are missing or invalid
 */
export function validateEnvConfig(env: NodeJS.ProcessEnv): ScraperConfig {
	// Extract required fields
	let email = env.EMAIL
	let password = env.PASSWORD
	let apiKey = env.API_KEY

	// Validate required fields
	if (!email) {
		throw new ValidationError('EMAIL environment variable is required')
	}

	if (!password) {
		throw new ValidationError('PASSWORD environment variable is required')
	}

	if (!apiKey) {
		throw new ValidationError('API_KEY environment variable is required')
	}

	// Validate API key length
	if (!isValidApiKey(apiKey)) {
		throw new ValidationError('API_KEY must be at least 32 characters long')
	}

	// Extract optional fields with defaults
	let port = env.PORT ? parseInt(env.PORT, 10) : defaultConfig.PORT
	let headless = env.HEADLESS ? env.HEADLESS === 'true' : defaultConfig.HEADLESS
	let cacheTtlMinutes = env.CACHE_TTL_MINUTES
		? parseInt(env.CACHE_TTL_MINUTES, 10)
		: defaultConfig.CACHE_TTL_MINUTES

	return {
		email,
		password,
		apiKey,
		port,
		headless,
		cacheTtlMinutes,
	}
}

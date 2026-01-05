/**
 * API route constants
 */
export let apiRoutes = {
	BALANCES: '/api/balances',
	HEALTH: '/health',
} as const

/**
 * HTTP status code constants
 */
export let httpStatus = {
	OK: 200,
	UNAUTHORIZED: 401,
	INTERNAL_ERROR: 500,
} as const

/**
 * Default configuration values
 */
export let defaultConfig = {
	PORT: 3000,
	HEADLESS: true,
	CACHE_TTL_MINUTES: 5,
	SESSION_TTL_MINUTES: 30,
	POLLING_INTERVAL_SECONDS: 900, // 15 minutes
} as const

/**
 * Greenlight application URLs
 */
export let greenlightUrls = {
	LOGIN: 'https://greenlight.com/login',
	DASHBOARD: 'https://greenlight.com/dashboard',
} as const

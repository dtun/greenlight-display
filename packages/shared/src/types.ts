// Greenlight account data structure
export interface GreenlightAccount {
	childName: string
	balance: number
	currency: string
	lastUpdated: Date
}

// Scraper configuration
export interface ScraperConfig {
	email: string
	password: string
	updateInterval: number
}

// TRMNL display payload
export interface TRMNLPayload {
	accounts: GreenlightAccount[]
	timestamp: string
	status: 'success' | 'error'
	error?: string
}

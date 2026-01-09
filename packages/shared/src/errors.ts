/**
 * Base error class for scraper-related errors
 */
export class ScraperError extends Error {
	constructor(
		message: string,
		public code: string
	) {
		super(message)
		this.name = 'ScraperError'
	}
}

/**
 * Authentication error class
 */
export class AuthenticationError extends ScraperError {
	constructor(message: string = 'Authentication failed') {
		super(message, 'AUTH_ERROR')
		this.name = 'AuthenticationError'
	}
}

/**
 * Scraping error class
 */
export class ScrapingError extends ScraperError {
	constructor(message: string = 'Failed to scrape data') {
		super(message, 'SCRAPE_ERROR')
		this.name = 'ScrapingError'
	}
}

/**
 * Validation error class
 */
export class ValidationError extends ScraperError {
	constructor(message: string = 'Data validation failed') {
		super(message, 'VALIDATION_ERROR')
		this.name = 'ValidationError'
	}
}

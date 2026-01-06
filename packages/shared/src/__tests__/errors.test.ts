import { describe, it, expect } from 'vitest'
import {
	ScraperError,
	AuthenticationError,
	ScrapingError,
	ValidationError,
} from '../errors'

describe('ScraperError', () => {
	it('should create error with message and code', () => {
		// Arrange
		let message = 'Test error message'
		let code = 'TEST_CODE'

		// Act
		let error = new ScraperError(message, code)

		// Assert
		expect(error.message).toBe(message)
		expect(error.code).toBe(code)
	})

	it('should have correct name property', () => {
		// Arrange & Act
		let error = new ScraperError('Test', 'CODE')

		// Assert
		expect(error.name).toBe('ScraperError')
	})

	it('should be instanceof Error', () => {
		// Arrange & Act
		let error = new ScraperError('Test', 'CODE')

		// Assert
		expect(error).toBeInstanceOf(Error)
	})

	it('should be instanceof ScraperError', () => {
		// Arrange & Act
		let error = new ScraperError('Test', 'CODE')

		// Assert
		expect(error).toBeInstanceOf(ScraperError)
	})
})

describe('AuthenticationError', () => {
	it('should create with default message', () => {
		// Arrange & Act
		let error = new AuthenticationError()

		// Assert
		expect(error.message).toBe('Authentication failed')
	})

	it('should create with custom message', () => {
		// Arrange
		let customMessage = 'Invalid credentials provided'

		// Act
		let error = new AuthenticationError(customMessage)

		// Assert
		expect(error.message).toBe(customMessage)
	})

	it('should have code AUTH_ERROR', () => {
		// Arrange & Act
		let error = new AuthenticationError()

		// Assert
		expect(error.code).toBe('AUTH_ERROR')
	})

	it('should have correct name property', () => {
		// Arrange & Act
		let error = new AuthenticationError()

		// Assert
		expect(error.name).toBe('AuthenticationError')
	})

	it('should be instanceof ScraperError', () => {
		// Arrange & Act
		let error = new AuthenticationError()

		// Assert
		expect(error).toBeInstanceOf(ScraperError)
	})

	it('should be instanceof Error', () => {
		// Arrange & Act
		let error = new AuthenticationError()

		// Assert
		expect(error).toBeInstanceOf(Error)
	})
})

describe('ScrapingError', () => {
	it('should create with default message', () => {
		// Arrange & Act
		let error = new ScrapingError()

		// Assert
		expect(error.message).toBe('Failed to scrape data')
	})

	it('should create with custom message', () => {
		// Arrange
		let customMessage = 'Element not found on page'

		// Act
		let error = new ScrapingError(customMessage)

		// Assert
		expect(error.message).toBe(customMessage)
	})

	it('should have code SCRAPE_ERROR', () => {
		// Arrange & Act
		let error = new ScrapingError()

		// Assert
		expect(error.code).toBe('SCRAPE_ERROR')
	})

	it('should have correct name property', () => {
		// Arrange & Act
		let error = new ScrapingError()

		// Assert
		expect(error.name).toBe('ScrapingError')
	})

	it('should be instanceof ScraperError', () => {
		// Arrange & Act
		let error = new ScrapingError()

		// Assert
		expect(error).toBeInstanceOf(ScraperError)
	})

	it('should be instanceof Error', () => {
		// Arrange & Act
		let error = new ScrapingError()

		// Assert
		expect(error).toBeInstanceOf(Error)
	})
})

describe('ValidationError', () => {
	it('should create with default message', () => {
		// Arrange & Act
		let error = new ValidationError()

		// Assert
		expect(error.message).toBe('Data validation failed')
	})

	it('should create with custom message', () => {
		// Arrange
		let customMessage = 'Invalid account structure'

		// Act
		let error = new ValidationError(customMessage)

		// Assert
		expect(error.message).toBe(customMessage)
	})

	it('should have code VALIDATION_ERROR', () => {
		// Arrange & Act
		let error = new ValidationError()

		// Assert
		expect(error.code).toBe('VALIDATION_ERROR')
	})

	it('should have correct name property', () => {
		// Arrange & Act
		let error = new ValidationError()

		// Assert
		expect(error.name).toBe('ValidationError')
	})

	it('should be instanceof ScraperError', () => {
		// Arrange & Act
		let error = new ValidationError()

		// Assert
		expect(error).toBeInstanceOf(ScraperError)
	})

	it('should be instanceof Error', () => {
		// Arrange & Act
		let error = new ValidationError()

		// Assert
		expect(error).toBeInstanceOf(Error)
	})
})

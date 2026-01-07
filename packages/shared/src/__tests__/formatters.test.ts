import { describe, it, expect } from 'vitest'
import {
	formatCurrency,
	formatTimestamp,
	parseCurrencyString,
	sanitizeAccountName,
} from '../formatters'

describe('formatCurrency', () => {
	it('should format whole numbers', () => {
		// Arrange
		let amount = 125

		// Act
		let result = formatCurrency(amount)

		// Assert
		expect(result).toBe('$125.00')
	})

	it('should format decimals to 2 places', () => {
		// Arrange
		let amount = 125.5

		// Act
		let result = formatCurrency(amount)

		// Assert
		expect(result).toBe('$125.50')
	})

	it('should handle negative numbers', () => {
		// Arrange
		let amount = -50.0

		// Act
		let result = formatCurrency(amount)

		// Assert
		expect(result).toBe('-$50.00')
	})

	it('should handle zero', () => {
		// Arrange
		let amount = 0

		// Act
		let result = formatCurrency(amount)

		// Assert
		expect(result).toBe('$0.00')
	})

	it('should handle large numbers with commas', () => {
		// Arrange
		let amount = 1234567.89

		// Act
		let result = formatCurrency(amount)

		// Assert
		expect(result).toBe('$1,234,567.89')
	})

	it('should round to 2 decimal places', () => {
		// Arrange
		let amount = 123.456

		// Act
		let result = formatCurrency(amount)

		// Assert
		expect(result).toBe('$123.46')
	})
})

describe('formatTimestamp', () => {
	it('should format ISO string to short format', () => {
		// Arrange
		let isoString = '2026-01-03T10:30:00Z'

		// Act
		let result = formatTimestamp(isoString)

		// Assert
		// Expected format: "Jan 3, 10:30 AM"
		expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{1,2}:\d{2} [AP]M$/)
		expect(result).toContain('Jan 3')
		expect(result).toContain('10:30')
	})

	it('should format afternoon time correctly', () => {
		// Arrange
		let isoString = '2026-01-15T14:45:00Z'

		// Act
		let result = formatTimestamp(isoString)

		// Assert
		expect(result).toMatch(/[AP]M$/)
		expect(result).toContain('Jan 15')
	})

	it('should handle midnight', () => {
		// Arrange
		let isoString = '2026-06-20T00:00:00Z'

		// Act
		let result = formatTimestamp(isoString)

		// Assert
		expect(result).toContain('Jun 20')
		expect(result).toContain('12:00 AM')
	})

	it('should handle noon', () => {
		// Arrange
		let isoString = '2026-12-25T12:00:00Z'

		// Act
		let result = formatTimestamp(isoString)

		// Assert
		expect(result).toContain('Dec 25')
		expect(result).toContain('12:00 PM')
	})

	it('should throw or return error for invalid ISO string', () => {
		// Arrange
		let invalidString = 'not-a-date'

		// Act & Assert
		expect(() => formatTimestamp(invalidString)).toThrow()
	})
})

describe('parseCurrencyString', () => {
	it('should parse simple dollar amount', () => {
		// Arrange
		let currencyStr = '$125.50'

		// Act
		let result = parseCurrencyString(currencyStr)

		// Assert
		expect(result).toBe(125.5)
	})

	it('should parse amount with commas', () => {
		// Arrange
		let currencyStr = '$1,234.56'

		// Act
		let result = parseCurrencyString(currencyStr)

		// Assert
		expect(result).toBe(1234.56)
	})

	it('should parse amount with spaces', () => {
		// Arrange
		let currencyStr = '$ 100.00'

		// Act
		let result = parseCurrencyString(currencyStr)

		// Assert
		expect(result).toBe(100.0)
	})

	it('should handle negative amounts', () => {
		// Arrange
		let currencyStr = '-$50.00'

		// Act
		let result = parseCurrencyString(currencyStr)

		// Assert
		expect(result).toBe(-50.0)
	})

	it('should handle whole numbers without decimals', () => {
		// Arrange
		let currencyStr = '$100'

		// Act
		let result = parseCurrencyString(currencyStr)

		// Assert
		expect(result).toBe(100)
	})

	it('should return NaN for invalid input', () => {
		// Arrange
		let invalidStr = 'not a number'

		// Act
		let result = parseCurrencyString(invalidStr)

		// Assert
		expect(result).toBeNaN()
	})

	it('should parse large amounts with multiple commas', () => {
		// Arrange
		let currencyStr = '$1,234,567.89'

		// Act
		let result = parseCurrencyString(currencyStr)

		// Assert
		expect(result).toBe(1234567.89)
	})
})

describe('sanitizeAccountName', () => {
	it('should trim whitespace', () => {
		// Arrange
		let name = '  Alice  '

		// Act
		let result = sanitizeAccountName(name)

		// Assert
		expect(result).toBe('Alice')
	})

	it('should limit to 50 characters', () => {
		// Arrange
		let longName = 'A'.repeat(100)

		// Act
		let result = sanitizeAccountName(longName)

		// Assert
		expect(result).toBe('A'.repeat(50))
		expect(result.length).toBe(50)
	})

	it('should handle empty string', () => {
		// Arrange
		let name = ''

		// Act
		let result = sanitizeAccountName(name)

		// Assert
		expect(result).toBe('')
	})

	it('should handle whitespace-only string', () => {
		// Arrange
		let name = '   '

		// Act
		let result = sanitizeAccountName(name)

		// Assert
		expect(result).toBe('')
	})

	it('should preserve valid characters', () => {
		// Arrange
		let name = "Alice's Account"

		// Act
		let result = sanitizeAccountName(name)

		// Assert
		expect(result).toBe("Alice's Account")
	})

	it('should preserve numbers and special chars', () => {
		// Arrange
		let name = 'Bob123-Test'

		// Act
		let result = sanitizeAccountName(name)

		// Assert
		expect(result).toBe('Bob123-Test')
	})

	it('should trim and limit together', () => {
		// Arrange
		let name = '  ' + 'B'.repeat(60) + '  '

		// Act
		let result = sanitizeAccountName(name)

		// Assert
		expect(result).toBe('B'.repeat(50))
		expect(result.length).toBe(50)
	})
})

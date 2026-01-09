import { describe, it, expect } from 'vitest'
import { isValidAccount, isValidBalanceData, isValidApiKey, validateEnvConfig } from '../validators'
import { ValidationError } from '../errors'
import type { Account, BalanceData } from '../types'

describe('isValidAccount', () => {
	it('should return true for valid account', () => {
		// Arrange
		let account: Account = {
			name: 'Alice',
			spending: 25.5,
			savings: 100.0,
			total: 125.5,
		}

		// Act
		let result = isValidAccount(account)

		// Assert
		expect(result).toBe(true)
	})

	it('should return false if name is empty', () => {
		// Arrange
		let account = {
			name: '',
			spending: 25.5,
			savings: 100.0,
			total: 125.5,
		}

		// Act
		let result = isValidAccount(account)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false if name is not string', () => {
		// Arrange
		let account = {
			name: 123,
			spending: 25.5,
			savings: 100.0,
			total: 125.5,
		}

		// Act
		let result = isValidAccount(account)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false if spending is not number', () => {
		// Arrange
		let account = {
			name: 'Alice',
			spending: '25.5',
			savings: 100.0,
			total: 125.5,
		}

		// Act
		let result = isValidAccount(account)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false if savings is not number', () => {
		// Arrange
		let account = {
			name: 'Alice',
			spending: 25.5,
			savings: '100.0',
			total: 125.5,
		}

		// Act
		let result = isValidAccount(account)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false if total is not number', () => {
		// Arrange
		let account = {
			name: 'Alice',
			spending: 25.5,
			savings: 100.0,
			total: '125.5',
		}

		// Act
		let result = isValidAccount(account)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false if total does not match spending + savings', () => {
		// Arrange
		let account = {
			name: 'Alice',
			spending: 25.5,
			savings: 100.0,
			total: 200.0, // Should be 125.5
		}

		// Act
		let result = isValidAccount(account)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false for missing properties', () => {
		// Arrange
		let account = {
			name: 'Alice',
			spending: 25.5,
		}

		// Act
		let result = isValidAccount(account)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false for null', () => {
		// Arrange
		let account = null

		// Act
		let result = isValidAccount(account)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false for non-object', () => {
		// Arrange
		let account = 'not an object'

		// Act
		let result = isValidAccount(account)

		// Assert
		expect(result).toBe(false)
	})

	it('should allow small floating point differences in total', () => {
		// Arrange
		let account = {
			name: 'Alice',
			spending: 0.1,
			savings: 0.2,
			total: 0.30000000000000004, // JavaScript floating point precision
		}

		// Act
		let result = isValidAccount(account)

		// Assert
		expect(result).toBe(true)
	})
})

describe('isValidBalanceData', () => {
	it('should return true for valid balance data', () => {
		// Arrange
		let data: BalanceData = {
			timestamp: '2026-01-03T10:30:00Z',
			accounts: [
				{
					name: 'Alice',
					spending: 25.5,
					savings: 100.0,
					total: 125.5,
				},
			],
			parentWallet: 500.0,
		}

		// Act
		let result = isValidBalanceData(data)

		// Assert
		expect(result).toBe(true)
	})

	it('should return false if timestamp is missing', () => {
		// Arrange
		let data = {
			accounts: [],
			parentWallet: 500.0,
		}

		// Act
		let result = isValidBalanceData(data)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false if timestamp is not ISO 8601', () => {
		// Arrange
		let data = {
			timestamp: 'not-a-date',
			accounts: [],
			parentWallet: 500.0,
		}

		// Act
		let result = isValidBalanceData(data)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false if accounts is not array', () => {
		// Arrange
		let data = {
			timestamp: '2026-01-03T10:30:00Z',
			accounts: 'not an array',
			parentWallet: 500.0,
		}

		// Act
		let result = isValidBalanceData(data)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false if accounts array is empty', () => {
		// Arrange
		let data = {
			timestamp: '2026-01-03T10:30:00Z',
			accounts: [],
			parentWallet: 500.0,
		}

		// Act
		let result = isValidBalanceData(data)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false if any account is invalid', () => {
		// Arrange
		let data = {
			timestamp: '2026-01-03T10:30:00Z',
			accounts: [
				{
					name: 'Alice',
					spending: 25.5,
					savings: 100.0,
					total: 125.5,
				},
				{
					name: '', // Invalid: empty name
					spending: 50.0,
					savings: 50.0,
					total: 100.0,
				},
			],
			parentWallet: 500.0,
		}

		// Act
		let result = isValidBalanceData(data)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false if parentWallet is not number', () => {
		// Arrange
		let data = {
			timestamp: '2026-01-03T10:30:00Z',
			accounts: [
				{
					name: 'Alice',
					spending: 25.5,
					savings: 100.0,
					total: 125.5,
				},
			],
			parentWallet: '500.0',
		}

		// Act
		let result = isValidBalanceData(data)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false for missing properties', () => {
		// Arrange
		let data = {
			timestamp: '2026-01-03T10:30:00Z',
		}

		// Act
		let result = isValidBalanceData(data)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false for null', () => {
		// Arrange
		let data = null

		// Act
		let result = isValidBalanceData(data)

		// Assert
		expect(result).toBe(false)
	})

	it('should accept valid ISO 8601 with timezone', () => {
		// Arrange
		let data = {
			timestamp: '2026-01-03T10:30:00-05:00',
			accounts: [
				{
					name: 'Alice',
					spending: 25.5,
					savings: 100.0,
					total: 125.5,
				},
			],
			parentWallet: 500.0,
		}

		// Act
		let result = isValidBalanceData(data)

		// Assert
		expect(result).toBe(true)
	})
})

describe('isValidApiKey', () => {
	it('should return true for valid key (32+ chars)', () => {
		// Arrange
		let key = 'a'.repeat(32)

		// Act
		let result = isValidApiKey(key)

		// Assert
		expect(result).toBe(true)
	})

	it('should return true for key longer than 32 chars', () => {
		// Arrange
		let key = 'a'.repeat(64)

		// Act
		let result = isValidApiKey(key)

		// Assert
		expect(result).toBe(true)
	})

	it('should return false for undefined', () => {
		// Arrange
		let key = undefined

		// Act
		let result = isValidApiKey(key)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false for empty string', () => {
		// Arrange
		let key = ''

		// Act
		let result = isValidApiKey(key)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false for short string (<32 chars)', () => {
		// Arrange
		let key = 'a'.repeat(31)

		// Act
		let result = isValidApiKey(key)

		// Assert
		expect(result).toBe(false)
	})

	it('should return false for non-string', () => {
		// Arrange
		let key = 12345 as any

		// Act
		let result = isValidApiKey(key)

		// Assert
		expect(result).toBe(false)
	})
})

describe('validateEnvConfig', () => {
	it('should return config for valid env vars', () => {
		// Arrange
		let env = {
			EMAIL: 'test@example.com',
			PASSWORD: 'secret123',
			API_KEY: 'a'.repeat(32),
			PORT: '8080',
			HEADLESS: 'true',
			CACHE_TTL_MINUTES: '10',
		}

		// Act
		let result = validateEnvConfig(env)

		// Assert
		expect(result).toEqual({
			email: 'test@example.com',
			password: 'secret123',
			apiKey: 'a'.repeat(32),
			port: 8080,
			headless: true,
			cacheTtlMinutes: 10,
		})
	})

	it('should use default values for optional vars', () => {
		// Arrange
		let env = {
			EMAIL: 'test@example.com',
			PASSWORD: 'secret123',
			API_KEY: 'a'.repeat(32),
		}

		// Act
		let result = validateEnvConfig(env)

		// Assert
		expect(result.port).toBe(3000) // default
		expect(result.headless).toBe(true) // default
		expect(result.cacheTtlMinutes).toBe(5) // default
	})

	it('should throw ValidationError if email missing', () => {
		// Arrange
		let env = {
			PASSWORD: 'secret123',
			API_KEY: 'a'.repeat(32),
		}

		// Act & Assert
		expect(() => validateEnvConfig(env)).toThrow(ValidationError)
		expect(() => validateEnvConfig(env)).toThrow(/email/i)
	})

	it('should throw ValidationError if password missing', () => {
		// Arrange
		let env = {
			EMAIL: 'test@example.com',
			API_KEY: 'a'.repeat(32),
		}

		// Act & Assert
		expect(() => validateEnvConfig(env)).toThrow(ValidationError)
		expect(() => validateEnvConfig(env)).toThrow(/password/i)
	})

	it('should throw ValidationError if apiKey missing', () => {
		// Arrange
		let env = {
			EMAIL: 'test@example.com',
			PASSWORD: 'secret123',
		}

		// Act & Assert
		expect(() => validateEnvConfig(env)).toThrow(ValidationError)
		expect(() => validateEnvConfig(env)).toThrow(/api.*key/i)
	})

	it('should throw ValidationError if apiKey too short', () => {
		// Arrange
		let env = {
			EMAIL: 'test@example.com',
			PASSWORD: 'secret123',
			API_KEY: 'short',
		}

		// Act & Assert
		expect(() => validateEnvConfig(env)).toThrow(ValidationError)
		expect(() => validateEnvConfig(env)).toThrow(/api.*key/i)
	})

	it('should parse numeric values correctly', () => {
		// Arrange
		let env = {
			EMAIL: 'test@example.com',
			PASSWORD: 'secret123',
			API_KEY: 'a'.repeat(32),
			PORT: '9000',
			CACHE_TTL_MINUTES: '15',
		}

		// Act
		let result = validateEnvConfig(env)

		// Assert
		expect(result.port).toBe(9000)
		expect(result.cacheTtlMinutes).toBe(15)
		expect(typeof result.port).toBe('number')
		expect(typeof result.cacheTtlMinutes).toBe('number')
	})

	it('should parse headless boolean correctly', () => {
		// Arrange
		let env = {
			EMAIL: 'test@example.com',
			PASSWORD: 'secret123',
			API_KEY: 'a'.repeat(32),
			HEADLESS: 'false',
		}

		// Act
		let result = validateEnvConfig(env)

		// Assert
		expect(result.headless).toBe(false)
		expect(typeof result.headless).toBe('boolean')
	})

	it('should handle HEADLESS=true string', () => {
		// Arrange
		let env = {
			EMAIL: 'test@example.com',
			PASSWORD: 'secret123',
			API_KEY: 'a'.repeat(32),
			HEADLESS: 'true',
		}

		// Act
		let result = validateEnvConfig(env)

		// Assert
		expect(result.headless).toBe(true)
	})
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '../../index'
import { createMockKV } from '../helpers/mock-kv'

describe('GET /api/balances', () => {
	let mockKV: ReturnType<typeof createMockKV>

	beforeEach(() => {
		mockKV = createMockKV()
		mockKV._clear()
	})

	describe('authentication', () => {
		it('should require Authorization header', async () => {
			// Arrange
			let req = new Request('http://localhost/api/balances')

			// Act
			let res = await app.fetch(req, {
				API_KEY: 'test-api-key',
				KV_CACHE: mockKV,
			})
			let body = await res.json()

			// Assert
			expect(res.status).toBe(401)
			expect(body).toHaveProperty('error', 'Unauthorized')
		})

		it('should reject invalid API key', async () => {
			// Arrange
			let req = new Request('http://localhost/api/balances', {
				headers: {
					Authorization: 'Bearer wrong-key',
				},
			})

			// Act
			let res = await app.fetch(req, {
				API_KEY: 'correct-key',
				KV_CACHE: mockKV,
			})
			let body = await res.json()

			// Assert
			expect(res.status).toBe(401)
			expect(body).toHaveProperty('error', 'Unauthorized')
		})

		it('should accept valid API key', async () => {
			// Arrange
			let cachedData = {
				timestamp: '2026-01-03T10:30:00Z',
				accounts: [{ name: 'Alice', spending: 25.5, savings: 100, total: 125.5 }],
				parentWallet: 50,
			}
			await mockKV.put('balances:latest', JSON.stringify(cachedData), {
				metadata: { timestamp: Date.now() },
			})

			let req = new Request('http://localhost/api/balances', {
				headers: {
					Authorization: 'Bearer test-api-key',
				},
			})

			// Act
			let res = await app.fetch(req, {
				API_KEY: 'test-api-key',
				KV_CACHE: mockKV,
				GREENLIGHT_EMAIL: 'test@example.com',
				GREENLIGHT_PASSWORD: 'password',
			})

			// Assert
			expect(res.status).toBe(200)
		})
	})

	describe('response structure', () => {
		it('should return proper balance data structure', async () => {
			// Arrange
			let cachedData = {
				timestamp: '2026-01-03T10:30:00Z',
				accounts: [
					{ name: 'Alice', spending: 25.5, savings: 100, total: 125.5 },
					{ name: 'Bob', spending: 15.25, savings: 50, total: 65.25 },
				],
				parentWallet: 50,
			}
			await mockKV.put('balances:latest', JSON.stringify(cachedData), {
				metadata: { timestamp: Date.now() },
			})

			let req = new Request('http://localhost/api/balances', {
				headers: {
					Authorization: 'Bearer test-api-key',
				},
			})

			// Act
			let res = await app.fetch(req, {
				API_KEY: 'test-api-key',
				KV_CACHE: mockKV,
				GREENLIGHT_EMAIL: 'test@example.com',
				GREENLIGHT_PASSWORD: 'password',
			})
			let body = await res.json()

			// Assert
			expect(res.status).toBe(200)
			expect(body).toHaveProperty('timestamp')
			expect(body).toHaveProperty('accounts')
			expect(body).toHaveProperty('parentWallet')
			expect(Array.isArray((body as { accounts: unknown[] }).accounts)).toBe(true)
		})

		it('should return accounts with required fields', async () => {
			// Arrange
			let cachedData = {
				timestamp: '2026-01-03T10:30:00Z',
				accounts: [{ name: 'Alice', spending: 25.5, savings: 100, total: 125.5 }],
				parentWallet: 50,
			}
			await mockKV.put('balances:latest', JSON.stringify(cachedData), {
				metadata: { timestamp: Date.now() },
			})

			let req = new Request('http://localhost/api/balances', {
				headers: {
					Authorization: 'Bearer test-api-key',
				},
			})

			// Act
			let res = await app.fetch(req, {
				API_KEY: 'test-api-key',
				KV_CACHE: mockKV,
				GREENLIGHT_EMAIL: 'test@example.com',
				GREENLIGHT_PASSWORD: 'password',
			})
			let body = await res.json()

			// Assert
			expect(res.status).toBe(200)
			let account = (body as { accounts: Array<Record<string, unknown>> }).accounts[0]
			expect(account).toHaveProperty('name')
			expect(account).toHaveProperty('spending')
			expect(account).toHaveProperty('savings')
			expect(account).toHaveProperty('total')
		})

		it('should return JSON content type', async () => {
			// Arrange
			let cachedData = {
				timestamp: '2026-01-03T10:30:00Z',
				accounts: [{ name: 'Alice', spending: 25.5, savings: 100, total: 125.5 }],
				parentWallet: 50,
			}
			await mockKV.put('balances:latest', JSON.stringify(cachedData), {
				metadata: { timestamp: Date.now() },
			})

			let req = new Request('http://localhost/api/balances', {
				headers: {
					Authorization: 'Bearer test-api-key',
				},
			})

			// Act
			let res = await app.fetch(req, {
				API_KEY: 'test-api-key',
				KV_CACHE: mockKV,
				GREENLIGHT_EMAIL: 'test@example.com',
				GREENLIGHT_PASSWORD: 'password',
			})

			// Assert
			expect(res.headers.get('content-type')).toContain('application/json')
		})
	})

	describe('caching behavior', () => {
		it('should return cached data when available', async () => {
			// Arrange
			let cachedData = {
				timestamp: '2026-01-03T10:30:00Z',
				accounts: [{ name: 'Cached', spending: 10, savings: 20, total: 30 }],
				parentWallet: 100,
			}
			await mockKV.put('balances:latest', JSON.stringify(cachedData), {
				metadata: { timestamp: Date.now() },
			})

			let req = new Request('http://localhost/api/balances', {
				headers: {
					Authorization: 'Bearer test-api-key',
				},
			})

			// Act
			let res = await app.fetch(req, {
				API_KEY: 'test-api-key',
				KV_CACHE: mockKV,
				GREENLIGHT_EMAIL: 'test@example.com',
				GREENLIGHT_PASSWORD: 'password',
			})
			let body = await res.json()

			// Assert
			expect(res.status).toBe(200)
			expect((body as { accounts: Array<{ name: string }> }).accounts[0].name).toBe('Cached')
		})
	})

	describe('error handling', () => {
		it('should return 500 on scraper error with no cached data', async () => {
			// Arrange - no cached data, no browser binding (will fail)
			let req = new Request('http://localhost/api/balances', {
				headers: {
					Authorization: 'Bearer test-api-key',
				},
			})

			// Act
			let res = await app.fetch(req, {
				API_KEY: 'test-api-key',
				KV_CACHE: mockKV,
				GREENLIGHT_EMAIL: 'test@example.com',
				GREENLIGHT_PASSWORD: 'password',
				// No BROWSER binding - should cause scraper to fail
			})
			let body = await res.json()

			// Assert
			expect(res.status).toBe(500)
			expect(body).toHaveProperty('error', 'ScraperError')
			expect(body).toHaveProperty('message')
		})
	})
})

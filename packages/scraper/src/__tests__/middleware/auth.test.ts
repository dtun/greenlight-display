import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'

describe('authMiddleware', () => {
	// Setup test app with auth middleware
	function createTestApp() {
		let app = new Hono<{
			Bindings: {
				API_KEY: string
			}
		}>()

		app.use('/protected/*', authMiddleware)
		app.get('/protected/resource', (c) => {
			return c.json({ message: 'success' })
		})

		return app
	}

	it('should reject request without Authorization header', async () => {
		// Arrange
		let app = createTestApp()
		let req = new Request('http://localhost/protected/resource')

		// Act
		let res = await app.fetch(req, { API_KEY: 'test-api-key' })
		let body = await res.json()

		// Assert
		expect(res.status).toBe(401)
		expect(body).toHaveProperty('error', 'Unauthorized')
		expect(body).toHaveProperty('message')
	})

	it('should reject request with invalid Authorization format', async () => {
		// Arrange
		let app = createTestApp()
		let req = new Request('http://localhost/protected/resource', {
			headers: {
				Authorization: 'Basic invalid-format',
			},
		})

		// Act
		let res = await app.fetch(req, { API_KEY: 'test-api-key' })
		let body = await res.json()

		// Assert
		expect(res.status).toBe(401)
		expect(body).toHaveProperty('error', 'Unauthorized')
	})

	it('should reject request with invalid API key', async () => {
		// Arrange
		let app = createTestApp()
		let req = new Request('http://localhost/protected/resource', {
			headers: {
				Authorization: 'Bearer wrong-api-key',
			},
		})

		// Act
		let res = await app.fetch(req, { API_KEY: 'correct-api-key' })
		let body = await res.json()

		// Assert
		expect(res.status).toBe(401)
		expect(body).toHaveProperty('error', 'Unauthorized')
		expect(body).toHaveProperty('message', 'Invalid API key')
	})

	it('should allow request with valid Bearer token', async () => {
		// Arrange
		let app = createTestApp()
		let req = new Request('http://localhost/protected/resource', {
			headers: {
				Authorization: 'Bearer test-api-key',
			},
		})

		// Act
		let res = await app.fetch(req, { API_KEY: 'test-api-key' })
		let body = await res.json()

		// Assert
		expect(res.status).toBe(200)
		expect(body).toEqual({ message: 'success' })
	})

	it('should reject empty Bearer token', async () => {
		// Arrange
		let app = createTestApp()
		let req = new Request('http://localhost/protected/resource', {
			headers: {
				Authorization: 'Bearer ',
			},
		})

		// Act
		let res = await app.fetch(req, { API_KEY: 'test-api-key' })
		let body = await res.json()

		// Assert
		expect(res.status).toBe(401)
		expect(body).toHaveProperty('error', 'Unauthorized')
	})

	it('should be case-sensitive for Bearer prefix', async () => {
		// Arrange
		let app = createTestApp()
		let req = new Request('http://localhost/protected/resource', {
			headers: {
				Authorization: 'bearer test-api-key', // lowercase 'bearer'
			},
		})

		// Act
		let res = await app.fetch(req, { API_KEY: 'test-api-key' })
		let body = await res.json()

		// Assert
		expect(res.status).toBe(401)
		expect(body).toHaveProperty('error', 'Unauthorized')
	})
})

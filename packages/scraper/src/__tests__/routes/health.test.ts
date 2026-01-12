import { describe, it, expect } from 'vitest'
import app from '../../index'

describe('GET /health', () => {
	it('should return status ok', async () => {
		// Arrange
		let req = new Request('http://localhost/health')

		// Act
		let res = await app.fetch(req)
		let body = await res.json()

		// Assert
		expect(res.status).toBe(200)
		expect(body).toHaveProperty('status', 'ok')
	})

	it('should return JSON content type', async () => {
		// Arrange
		let req = new Request('http://localhost/health')

		// Act
		let res = await app.fetch(req)

		// Assert
		expect(res.headers.get('content-type')).toContain('application/json')
	})

	it('should include timestamp in response', async () => {
		// Arrange
		let req = new Request('http://localhost/health')

		// Act
		let res = await app.fetch(req)
		let body = await res.json()

		// Assert
		expect(body).toHaveProperty('timestamp')
		expect(typeof (body as { timestamp: string }).timestamp).toBe('string')
	})
})

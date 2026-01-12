import { describe, it, expect, beforeEach } from 'vitest'
import { KVCache } from '../../storage/cache'
import { createMockKV } from '../helpers/mock-kv'
import type { BalanceData } from '@greenlight-trmnl/shared'

describe('KVCache', () => {
	let mockKV: ReturnType<typeof createMockKV>
	let cache: KVCache

	beforeEach(() => {
		mockKV = createMockKV()
		mockKV._clear()
		cache = new KVCache(mockKV as unknown as KVNamespace)
	})

	describe('get', () => {
		it('should return null for non-existent key', async () => {
			// Act
			let result = await cache.get('non-existent-key')

			// Assert
			expect(result).toBeNull()
		})

		it('should return stored value for existing key', async () => {
			// Arrange
			let testData: BalanceData = {
				timestamp: '2026-01-03T10:30:00Z',
				accounts: [{ name: 'Alice', spending: 25.5, savings: 100, total: 125.5 }],
				parentWallet: 50,
			}
			await mockKV.put('test-key', JSON.stringify(testData))

			// Act
			let result = await cache.get('test-key')

			// Assert
			expect(result).toEqual(testData)
		})
	})

	describe('set', () => {
		it('should store value with expiration', async () => {
			// Arrange
			let testData: BalanceData = {
				timestamp: '2026-01-03T10:30:00Z',
				accounts: [{ name: 'Alice', spending: 25.5, savings: 100, total: 125.5 }],
				parentWallet: 50,
			}

			// Act
			await cache.set('test-key', testData, 300)

			// Assert
			expect(mockKV.put).toHaveBeenCalledWith(
				'test-key',
				JSON.stringify(testData),
				expect.objectContaining({ expirationTtl: 300 })
			)
		})

		it('should allow retrieving stored value', async () => {
			// Arrange
			let testData: BalanceData = {
				timestamp: '2026-01-03T10:30:00Z',
				accounts: [{ name: 'Bob', spending: 15.25, savings: 50, total: 65.25 }],
				parentWallet: 75,
			}

			// Act
			await cache.set('test-key', testData, 300)
			let result = await cache.get('test-key')

			// Assert
			expect(result).toEqual(testData)
		})
	})

	describe('setWithMetadata', () => {
		it('should store value with metadata and expiration', async () => {
			// Arrange
			let testData: BalanceData = {
				timestamp: '2026-01-03T10:30:00Z',
				accounts: [],
				parentWallet: 0,
			}
			let metadata = { timestamp: Date.now() }

			// Act
			await cache.setWithMetadata('test-key', testData, metadata, 300)

			// Assert
			expect(mockKV.put).toHaveBeenCalledWith(
				'test-key',
				JSON.stringify(testData),
				expect.objectContaining({
					expirationTtl: 300,
					metadata,
				})
			)
		})
	})

	describe('getWithMetadata', () => {
		it('should return null value and metadata for non-existent key', async () => {
			// Act
			let result = await cache.getWithMetadata('non-existent-key')

			// Assert
			expect(result.value).toBeNull()
			expect(result.metadata).toBeNull()
		})

		it('should return value and metadata for existing key', async () => {
			// Arrange
			let testData: BalanceData = {
				timestamp: '2026-01-03T10:30:00Z',
				accounts: [{ name: 'Charlie', spending: 30, savings: 70, total: 100 }],
				parentWallet: 200,
			}
			let metadata = { timestamp: 1704282600000 }
			await mockKV.put('test-key', JSON.stringify(testData), { metadata })

			// Act
			let result = await cache.getWithMetadata('test-key')

			// Assert
			expect(result.value).toEqual(testData)
			expect(result.metadata).toEqual(metadata)
		})

		it('should include timestamp in metadata', async () => {
			// Arrange
			let testData: BalanceData = {
				timestamp: '2026-01-03T10:30:00Z',
				accounts: [],
				parentWallet: 0,
			}
			let timestamp = Date.now()
			await cache.setWithMetadata('test-key', testData, { timestamp }, 300)

			// Act
			let result = await cache.getWithMetadata('test-key')

			// Assert
			expect(result.metadata).toHaveProperty('timestamp', timestamp)
		})
	})

	describe('delete', () => {
		it('should delete existing key', async () => {
			// Arrange
			let testData: BalanceData = {
				timestamp: '2026-01-03T10:30:00Z',
				accounts: [],
				parentWallet: 0,
			}
			await cache.set('test-key', testData, 300)

			// Act
			await cache.delete('test-key')

			// Assert
			expect(mockKV.delete).toHaveBeenCalledWith('test-key')
			let result = await cache.get('test-key')
			expect(result).toBeNull()
		})

		it('should not throw for non-existent key', async () => {
			// Act & Assert - should complete without throwing
			await cache.delete('non-existent-key')
			expect(mockKV.delete).toHaveBeenCalledWith('non-existent-key')
		})
	})
})

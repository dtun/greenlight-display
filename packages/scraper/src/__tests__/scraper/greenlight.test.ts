import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GreenlightScraper } from '../../scraper/greenlight'
import { createMockBrowser } from '../helpers/mock-browser'
import type { BalanceData } from '@greenlight-trmnl/shared'

describe('GreenlightScraper', () => {
	let mockPage: ReturnType<typeof createMockBrowser>['mockPage']
	let mockElementHandle: ReturnType<typeof createMockBrowser>['mockElementHandle']

	beforeEach(() => {
		let mocks = createMockBrowser()
		mockPage = mocks.mockPage
		mockElementHandle = mocks.mockElementHandle
		vi.clearAllMocks()
	})

	describe('constructor', () => {
		it('should create a scraper with credentials', () => {
			// Arrange & Act
			let scraper = new GreenlightScraper('test@example.com', 'password123')

			// Assert
			expect(scraper).toBeDefined()
		})
	})

	describe('login', () => {
		it('should navigate to auth page', async () => {
			// Arrange
			let scraper = new GreenlightScraper('test@example.com', 'password123')
			mockPage.waitForSelector.mockResolvedValue(undefined)

			// Act
			await scraper.login(mockPage as any)

			// Assert
			expect(mockPage.goto).toHaveBeenCalledWith(
				'https://auth.greenlight.com/',
				expect.objectContaining({ waitUntil: 'networkidle0' })
			)
		})

		it('should find and fill input fields', async () => {
			// Arrange
			let scraper = new GreenlightScraper('test@example.com', 'password123')
			mockPage.waitForSelector.mockResolvedValue(undefined)

			// Act
			await scraper.login(mockPage as any)

			// Assert - uses page.$() to find elements, then types on element handle
			expect(mockPage.$).toHaveBeenCalled()
			expect(mockElementHandle.type).toHaveBeenCalledWith('test@example.com')
			expect(mockElementHandle.type).toHaveBeenCalledWith('password123')
		})

		it('should submit the login form', async () => {
			// Arrange
			let scraper = new GreenlightScraper('test@example.com', 'password123')
			mockPage.waitForSelector.mockResolvedValue(undefined)

			// Act
			await scraper.login(mockPage as any)

			// Assert - clicks on element handle returned by page.$
			expect(mockElementHandle.click).toHaveBeenCalled()
		})

		it('should throw error on login failure', async () => {
			// Arrange
			let scraper = new GreenlightScraper('test@example.com', 'wrong-password')
			mockPage.waitForSelector.mockImplementation(async (selector: string) => {
				if (selector.includes('dashboard')) {
					throw new Error('Timeout waiting for selector')
				}
			})

			// Act & Assert
			await expect(scraper.login(mockPage as any)).rejects.toThrow('Login failed')
		})
	})

	describe('scrapeBalances', () => {
		it('should navigate to dashboard if not already there', async () => {
			// Arrange
			let scraper = new GreenlightScraper('test@example.com', 'password123')
			mockPage.url.mockReturnValue('https://greenlight.com/other-page')
			mockPage.waitForSelector.mockResolvedValue(undefined)
			mockPage.evaluate.mockResolvedValue([])

			// Act
			await scraper.scrapeBalances(mockPage as any)

			// Assert
			expect(mockPage.goto).toHaveBeenCalledWith(
				'https://greenlight.com/dashboard',
				expect.objectContaining({ waitUntil: 'networkidle0' })
			)
		})

		it('should wait for account elements to load', async () => {
			// Arrange
			let scraper = new GreenlightScraper('test@example.com', 'password123')
			mockPage.waitForSelector.mockResolvedValue(undefined)
			mockPage.evaluate.mockResolvedValue([])

			// Act
			await scraper.scrapeBalances(mockPage as any)

			// Assert
			expect(mockPage.waitForSelector).toHaveBeenCalledWith(
				'.account, [data-testid="account"]',
				expect.objectContaining({ timeout: 10000 })
			)
		})

		it('should extract account data from page', async () => {
			// Arrange
			let scraper = new GreenlightScraper('test@example.com', 'password123')
			mockPage.waitForSelector.mockResolvedValue(undefined)
			mockPage.evaluate
				.mockResolvedValueOnce([
					{ name: 'Alice', spending: 25.5, savings: 100, total: 125.5 },
					{ name: 'Bob', spending: 15.25, savings: 50, total: 65.25 },
				])
				.mockResolvedValueOnce(50)

			// Act
			let result = await scraper.scrapeBalances(mockPage as any)

			// Assert
			expect(result.accounts).toHaveLength(2)
			expect(result.accounts[0]).toEqual({
				name: 'Alice',
				spending: 25.5,
				savings: 100,
				total: 125.5,
			})
		})

		it('should extract parent wallet balance', async () => {
			// Arrange
			let scraper = new GreenlightScraper('test@example.com', 'password123')
			mockPage.waitForSelector.mockResolvedValue(undefined)
			mockPage.evaluate.mockResolvedValueOnce([]).mockResolvedValueOnce(150.75)

			// Act
			let result = await scraper.scrapeBalances(mockPage as any)

			// Assert
			expect(result.parentWallet).toBe(150.75)
		})

		it('should include timestamp in result', async () => {
			// Arrange
			let scraper = new GreenlightScraper('test@example.com', 'password123')
			mockPage.waitForSelector.mockResolvedValue(undefined)
			mockPage.evaluate.mockResolvedValue([])

			// Act
			let result = await scraper.scrapeBalances(mockPage as any)

			// Assert
			expect(result.timestamp).toBeDefined()
			expect(typeof result.timestamp).toBe('string')
			// Should be ISO format
			expect(() => new Date(result.timestamp)).not.toThrow()
		})
	})

	describe('scrape', () => {
		it('should call login and scrapeBalances', async () => {
			// Arrange
			let scraper = new GreenlightScraper('test@example.com', 'password123')
			mockPage.waitForSelector.mockResolvedValue(undefined)
			mockPage.evaluate
				.mockResolvedValueOnce([{ name: 'Alice', spending: 25.5, savings: 100, total: 125.5 }])
				.mockResolvedValueOnce(50)

			// Act
			let result = await scraper.scrape(mockPage as any)

			// Assert
			expect(result).toHaveProperty('timestamp')
			expect(result).toHaveProperty('accounts')
			expect(result).toHaveProperty('parentWallet')
		})

		it('should return properly structured BalanceData', async () => {
			// Arrange
			let scraper = new GreenlightScraper('test@example.com', 'password123')
			mockPage.waitForSelector.mockResolvedValue(undefined)
			mockPage.evaluate
				.mockResolvedValueOnce([{ name: 'Alice', spending: 25.5, savings: 100, total: 125.5 }])
				.mockResolvedValueOnce(50)

			// Act
			let result: BalanceData = await scraper.scrape(mockPage as any)

			// Assert
			expect(result.accounts[0]).toMatchObject({
				name: expect.any(String),
				spending: expect.any(Number),
				savings: expect.any(Number),
				total: expect.any(Number),
			})
		})
	})
})

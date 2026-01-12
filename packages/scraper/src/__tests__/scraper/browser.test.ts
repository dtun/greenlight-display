import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserClient, BrowserLauncher } from '../../scraper/browser'
import { createMockBrowser } from '../helpers/mock-browser'

describe('BrowserClient', () => {
	describe('launch', () => {
		it('should launch a browser instance', async () => {
			// Arrange
			let { mockBrowser } = createMockBrowser()
			let mockBinding = {} as Fetcher
			let mockLauncher: BrowserLauncher = {
				launch: vi.fn(async () => mockBrowser as any),
			}

			let client = new BrowserClient(mockBinding, mockLauncher)

			// Act
			let browser = await client.launch()

			// Assert
			expect(browser).toBeDefined()
			expect(mockLauncher.launch).toHaveBeenCalledWith(mockBinding)
		})

		it('should throw error if browser binding is unavailable', async () => {
			// Arrange
			let mockLauncher: BrowserLauncher = {
				launch: vi.fn(async () => {
					throw new Error('Browser binding not available')
				}),
			}
			let client = new BrowserClient(undefined as unknown as Fetcher, mockLauncher)

			// Act & Assert
			await expect(client.launch()).rejects.toThrow()
		})
	})

	describe('createPage', () => {
		it('should create a new page from browser', async () => {
			// Arrange
			let { mockBrowser, mockPage } = createMockBrowser()
			let client = new BrowserClient({} as Fetcher)

			// Act
			let page = await client.createPage(mockBrowser as any)

			// Assert
			expect(mockBrowser.newPage).toHaveBeenCalled()
			expect(page).toBe(mockPage)
		})

		it('should set viewport on created page', async () => {
			// Arrange
			let { mockBrowser, mockPage } = createMockBrowser()
			let client = new BrowserClient({} as Fetcher)

			// Act
			await client.createPage(mockBrowser as any)

			// Assert
			expect(mockPage.setViewport).toHaveBeenCalledWith({
				width: 1280,
				height: 720,
			})
		})

		it('should set user agent on created page', async () => {
			// Arrange
			let { mockBrowser, mockPage } = createMockBrowser()
			let client = new BrowserClient({} as Fetcher)

			// Act
			await client.createPage(mockBrowser as any)

			// Assert
			expect(mockPage.setUserAgent).toHaveBeenCalled()
			let userAgent = mockPage.setUserAgent.mock.calls[0][0]
			expect(userAgent).toContain('Mozilla')
		})
	})

	describe('closeBrowser', () => {
		it('should close the browser', async () => {
			// Arrange
			let { mockBrowser } = createMockBrowser()
			let client = new BrowserClient({} as Fetcher)

			// Act
			await client.closeBrowser(mockBrowser as any)

			// Assert
			expect(mockBrowser.close).toHaveBeenCalled()
		})
	})
})

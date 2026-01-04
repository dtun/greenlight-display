import { vi } from 'vitest'

export function createMockBrowser() {
	let mockPage = {
		goto: vi.fn(),
		waitForSelector: vi.fn(),
		type: vi.fn(),
		click: vi.fn(),
		waitForNavigation: vi.fn(),
		evaluate: vi.fn(),
		url: vi.fn(() => 'https://greenlight.com/dashboard'),
		setViewport: vi.fn(),
		setUserAgent: vi.fn(),
	}

	let mockBrowser = {
		newPage: vi.fn(async () => mockPage),
		close: vi.fn(),
	}

	return { mockBrowser, mockPage }
}

export function createMockBrowserClient() {
	let { mockBrowser, mockPage } = createMockBrowser()

	return {
		launch: vi.fn(async () => mockBrowser),
		createPage: vi.fn(async () => mockPage),
		closeBrowser: vi.fn(),
		mockBrowser,
		mockPage,
	}
}

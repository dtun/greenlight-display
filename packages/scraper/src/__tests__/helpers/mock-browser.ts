import { vi } from 'vitest'

export function createMockBrowser() {
	let mockElementHandle = {
		type: vi.fn(),
		click: vi.fn(),
	}

	let mockPage = {
		goto: vi.fn(),
		waitForSelector: vi.fn(),
		type: vi.fn(),
		click: vi.fn(),
		waitForNavigation: vi.fn(),
		evaluate: vi.fn(),
		evaluateHandle: vi.fn(() => mockElementHandle),
		url: vi.fn(() => 'https://greenlight.com/dashboard'),
		setViewport: vi.fn(),
		setUserAgent: vi.fn(),
		content: vi.fn(() => '<html><body></body></html>'),
		title: vi.fn(() => 'Greenlight'),
		$: vi.fn(() => mockElementHandle),
		$$eval: vi.fn(() => []),
	}

	let mockBrowser = {
		newPage: vi.fn(async () => mockPage),
		close: vi.fn(),
	}

	return { mockBrowser, mockPage, mockElementHandle }
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

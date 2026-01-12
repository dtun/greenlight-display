declare module '@cloudflare/puppeteer' {
	export interface Browser {
		newPage(): Promise<Page>
		close(): Promise<void>
	}

	export interface Page {
		goto(url: string, options?: { waitUntil?: string }): Promise<void>
		waitForSelector(selector: string, options?: { timeout?: number }): Promise<void>
		type(selector: string, text: string): Promise<void>
		click(selector: string): Promise<void>
		waitForNavigation(options?: { waitUntil?: string }): Promise<void>
		setViewport(options: { width: number; height: number }): Promise<void>
		setUserAgent(userAgent: string): Promise<void>
		url(): string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		evaluate<T>(fn: () => T, ...args: any[]): Promise<T>
	}

	const puppeteer: {
		launch(binding: Fetcher): Promise<Browser>
	}

	export default puppeteer
}

// Minimal DOM types for page.evaluate() callbacks
// These run in browser context, not Workers context
interface Element {
	querySelector(selector: string): Element | null
	querySelectorAll(selector: string): NodeListOf<Element>
	textContent: string | null
}

interface NodeListOf<T> extends ArrayLike<T> {
	[Symbol.iterator](): Iterator<T>
}

interface Document {
	querySelector(selector: string): Element | null
	querySelectorAll(selector: string): NodeListOf<Element>
}

declare const document: Document

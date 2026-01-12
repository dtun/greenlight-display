import type { Browser, Page } from '@cloudflare/puppeteer'

// Browser interface for dependency injection and testing
export interface BrowserLauncher {
	launch(binding: Fetcher): Promise<Browser>
}

// Default implementation using @cloudflare/puppeteer
// This will be dynamically imported when available
let defaultLauncher: BrowserLauncher | null = null

async function getDefaultLauncher(): Promise<BrowserLauncher> {
	if (!defaultLauncher) {
		let puppeteer = await import('@cloudflare/puppeteer')
		defaultLauncher = {
			launch: (binding: Fetcher) => puppeteer.default.launch(binding),
		}
	}
	return defaultLauncher
}

export class BrowserClient {
	private browserBinding: Fetcher
	private launcher: BrowserLauncher | null

	constructor(browserBinding: Fetcher, launcher?: BrowserLauncher) {
		this.browserBinding = browserBinding
		this.launcher = launcher ?? null
	}

	async launch(): Promise<Browser> {
		if (!this.browserBinding) {
			throw new Error('Browser binding not available')
		}
		let launcher = this.launcher ?? (await getDefaultLauncher())
		let browser = await launcher.launch(this.browserBinding)
		return browser
	}

	async createPage(browser: Browser): Promise<Page> {
		let page = await browser.newPage()

		// Set viewport for consistent rendering
		await page.setViewport({ width: 1280, height: 720 })

		// Set realistic user agent
		await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')

		return page
	}

	async closeBrowser(browser: Browser): Promise<void> {
		await browser.close()
	}
}

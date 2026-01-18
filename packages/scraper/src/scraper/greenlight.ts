import type { BalanceData } from '@greenlight-trmnl/shared'

// Using 'any' for Page due to type conflicts between @cloudflare/puppeteer
// (which needs DOM types) and @cloudflare/workers-types (which conflicts with DOM).
// The runtime types are correct - this is just a TypeScript compilation issue.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Page = any

export class GreenlightScraper {
	private username: string
	private password: string

	constructor(username: string, password: string) {
		this.username = username
		this.password = password
	}

	async login(page: Page): Promise<void> {
		// Navigate to login page
		await page.goto('https://auth.greenlight.com/', {
			waitUntil: 'networkidle0',
		})

		// Wait for page to stabilize
		await new Promise((r) => setTimeout(r, 2000))

		// Debug: log page content to help identify selectors
		let pageContent = await page.content()
		console.log('Page title:', await page.title())
		console.log('Page URL:', page.url())

		// Try multiple selector strategies for the username field
		let usernameInput = await page.$('input[type="text"]')
		if (!usernameInput) usernameInput = await page.$('input[type="tel"]')
		if (!usernameInput) usernameInput = await page.$('input[name="username"]')
		if (!usernameInput) usernameInput = await page.$('input[name="phone"]')
		if (!usernameInput)
			usernameInput = await page.$('input:not([type="password"]):not([type="hidden"])')

		if (!usernameInput) {
			// Log available inputs for debugging
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let inputs = await page.$$eval('input', (els: any[]) =>
				els.map((e: any) => ({ type: e.type, name: e.name, id: e.id, placeholder: e.placeholder }))
			)
			console.log('Available inputs:', JSON.stringify(inputs))
			throw new Error('Could not find username input field')
		}
		await usernameInput.type(this.username)

		// Fill password
		let passwordInput = await page.$('input[type="password"]')
		if (!passwordInput) {
			throw new Error('Could not find password input field')
		}
		await passwordInput.type(this.password)

		// Submit form - look for Sign in button
		let submitButton = await page.$('button[type="submit"]')
		if (!submitButton) {
			// Try finding button by text content
			submitButton = await page.evaluateHandle(() => {
				let buttons = Array.from(document.querySelectorAll('button'))
				return buttons.find((b) => b.textContent?.toLowerCase().includes('sign in'))
			})
		}
		if (!submitButton) {
			throw new Error('Could not find submit button')
		}

		await Promise.all([
			submitButton.click(),
			page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
		])

		// Verify login success
		let isLoggedIn = await this.checkLoginSuccess(page)
		if (!isLoggedIn) {
			throw new Error('Login failed - check credentials')
		}
	}

	private async checkLoginSuccess(page: Page): Promise<boolean> {
		// Check for dashboard elements or absence of error messages
		try {
			await page.waitForSelector('.dashboard, [data-testid="dashboard"]', {
				timeout: 5000,
			})
			return true
		} catch {
			return false
		}
	}

	async scrapeBalances(page: Page): Promise<BalanceData> {
		// Navigate to accounts page if needed
		let currentUrl = page.url()
		if (!currentUrl.includes('dashboard') && !currentUrl.includes('accounts')) {
			await page.goto('https://greenlight.com/dashboard', {
				waitUntil: 'networkidle0',
			})
		}

		// Wait for account data to load
		await page.waitForSelector('.account, [data-testid="account"]', {
			timeout: 10000,
		})

		// Extract account data
		let accounts = await page.evaluate(() => {
			let accountElements = document.querySelectorAll('.account, [data-testid="account"]')
			let results: Array<{
				name: string
				spending: number
				savings: number
				total: number
			}> = []

			for (let el of accountElements) {
				// Extract name - adjust selectors based on actual HTML
				let nameEl = el.querySelector('.account-name, .child-name, h3')
				let name = nameEl?.textContent?.trim() || 'Unknown'

				// Extract balances - adjust selectors
				let spendingEl = el.querySelector('[data-testid="spending"], .spending')
				let savingsEl = el.querySelector('[data-testid="savings"], .savings')
				let totalEl = el.querySelector('[data-testid="total"], .total-balance')

				// Parse currency strings
				let parseCurrency = (text: string | null) => {
					if (!text) return 0
					return parseFloat(text.replace(/[$,\s]/g, '')) || 0
				}

				let spending = parseCurrency(spendingEl?.textContent ?? null)
				let savings = parseCurrency(savingsEl?.textContent ?? null)
				let total = parseCurrency(totalEl?.textContent ?? null)

				results.push({ name, spending, savings, total })
			}

			return results
		})

		// Extract parent wallet balance
		let parentWallet = await page.evaluate(() => {
			let walletEl = document.querySelector('[data-testid="parent-wallet"], .parent-balance')
			let text = walletEl?.textContent || '$0'
			return parseFloat(text.replace(/[$,\s]/g, '')) || 0
		})

		return {
			timestamp: new Date().toISOString(),
			accounts,
			parentWallet,
		}
	}

	async scrape(page: Page): Promise<BalanceData> {
		await this.login(page)
		return await this.scrapeBalances(page)
	}
}

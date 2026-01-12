import type { Page } from '@cloudflare/puppeteer'
import type { BalanceData } from '@greenlight-trmnl/shared'

export class GreenlightScraper {
	private email: string
	private password: string

	constructor(email: string, password: string) {
		this.email = email
		this.password = password
	}

	async login(page: Page): Promise<void> {
		// Navigate to login page
		await page.goto('https://greenlight.com/login', {
			waitUntil: 'networkidle0',
		})

		// Fill in credentials
		await page.waitForSelector('input[type="email"]')
		await page.type('input[type="email"]', this.email)
		await page.type('input[type="password"]', this.password)

		// Submit form
		await Promise.all([
			page.click('button[type="submit"]'),
			page.waitForNavigation({ waitUntil: 'networkidle0' }),
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

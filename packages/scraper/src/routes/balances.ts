import { Hono } from 'hono'
import { isValidBalanceData, type BalanceData } from '@greenlight-trmnl/shared'
import { BrowserClient } from '../scraper/browser'
import { GreenlightScraper } from '../scraper/greenlight'
import { KVCache } from '../storage/cache'

type Bindings = {
	KV_CACHE: KVNamespace
	API_KEY: string
	GREENLIGHT_USERNAME: string
	GREENLIGHT_PASSWORD: string
	BROWSER?: Fetcher
}

const CACHE_TTL = 300 // 5 minutes in seconds
const CACHE_KEY = 'balances:latest'

let balancesRoute = new Hono<{ Bindings: Bindings }>()

balancesRoute.get('/', async (c) => {
	let cache = new KVCache(c.env.KV_CACHE)

	try {
		// Check cache first
		let cached = await cache.getWithMetadata(CACHE_KEY)

		if (cached.value && cached.metadata) {
			let age = Date.now() - cached.metadata.timestamp
			if (age < CACHE_TTL * 1000) {
				return c.json(cached.value)
			}
		}

		// Cache miss or expired - need to scrape fresh data
		if (!c.env.BROWSER) {
			throw new Error('Browser binding not available')
		}

		// Initialize browser and scraper
		let browserClient = new BrowserClient(c.env.BROWSER)
		let scraper = new GreenlightScraper(c.env.GREENLIGHT_USERNAME, c.env.GREENLIGHT_PASSWORD)

		// Launch browser and scrape
		let browser = await browserClient.launch()
		let page = await browserClient.createPage(browser)

		try {
			let balanceData = await scraper.scrape(page)

			// Validate scraped data before caching
			if (!isValidBalanceData(balanceData)) {
				throw new Error('Scraped data failed validation')
			}

			// Cache the fresh data
			await cache.setWithMetadata(CACHE_KEY, balanceData, { timestamp: Date.now() }, CACHE_TTL)

			return c.json(balanceData)
		} finally {
			// Always close browser
			await browserClient.closeBrowser(browser)
		}
	} catch (error) {
		console.error('Scraping error:', error)

		// Try to return stale cached data
		let staleData = await cache.get(CACHE_KEY)
		if (staleData) {
			return c.json({
				...staleData,
				stale: true,
				error: 'Using cached data due to scraping failure',
			})
		}

		return c.json(
			{
				error: 'ScraperError',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			500
		)
	}
})

export { balancesRoute }
